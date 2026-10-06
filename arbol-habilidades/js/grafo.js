/*
 * Grafo: traduce la hoja del equipo pedagógico ("Anexo 1. Grafo guías") al
 * proyecto y viceversa. Columnas: Guía · Guía indispensable · Guía deseable ·
 * Subcategoría · Subcategoría 2 · Subcategoría 3 · Herramienta computacional.
 */
const Grafo = (() => {
  const CABECERA = ['Guía', 'Guía indispensable', 'Guía deseable', 'Subcategoría', 'Subcategoría 2', 'Subcategoría 3', 'Herramienta computacional'];
  const ALIAS = {
    guia: ['guia', 'codigo', 'nodo', 'unidad'],
    indispensable: ['guiaindispensable', 'indispensable', 'indispensables', 'prerrequisitos', 'prerrequisito'],
    deseable: ['guiadeseable', 'deseable', 'deseables'],
    sub1: ['subcategoria', 'subcategoria1', 'ejeprincipal', 'eje', 'rama'],
    sub2: ['subcategoria2', 'eje2', 'rama2'],
    sub3: ['subcategoria3', 'eje3', 'rama3'],
    herramienta: ['herramientacomputacional', 'herramienta', 'herramientas']
  };
  const COLORES_NUEVOS = ['#2E7D9A', '#A0522D', '#5B6ABF', '#8A6D1F', '#B0476B', '#3D7F6E', '#7A4FA0'];

  const clave = s => Modelo.normalizar(s).replace(/-/g, '');
  const codigo = c => String(c ?? '').trim().replace(/^T\.?(\d+)$/i, 'T.$1');
  const lista = v => String(v ?? '').split(/[,;]+/).map(codigo).filter(Boolean);
  const aHoja = c => c.replace(/^T\.(\d+)$/, 'T$1');

  function ubicarColumnas(filas) {
    for (let i = 0; i < Math.min(filas.length, 6); i++) {
      const cab = (filas[i] || []).map(c => clave(c || ''));
      const col = {};
      Object.entries(ALIAS).forEach(([k, nombres]) => {
        const j = cab.findIndex(c => nombres.includes(c));
        if (j >= 0) col[k] = j;
      });
      if (col.guia !== undefined) return { fila: i, col };
    }
    return null;
  }

  /** Aplica una hoja del grafo a una copia del proyecto. */
  function aplicar(proyecto, filas) {
    const ub = ubicarColumnas(filas);
    if (!ub) throw new Error('No encuentro la columna «Guía». La hoja debe tener las columnas: ' + CABECERA.join(', ') + '.');
    const p = JSON.parse(JSON.stringify(proyecto));
    const vocab = p.vocabulario || {};
    const resumen = { filas: 0, actualizadas: 0, nuevas: [], ramasNuevas: [], nivelesNuevos: [], cambiosRama: [], avisos: [] };
    const celda = (f, k) => (ub.col[k] === undefined ? '' : String(f[ub.col[k]] ?? '').trim());

    const ramas = new Map();
    p.ramas.forEach(r => [r.id, r.nombre, r.corto].forEach(x => x && ramas.set(clave(x), r.id)));
    const buscarRama = texto => {
      const k = clave(texto);
      if (ramas.has(k)) return ramas.get(k);
      const id = `R${p.ramas.length + 1}`;
      p.ramas.push({ id, nombre: texto, corto: texto.length > 18 ? texto.slice(0, 17) + '…' : texto, color: COLORES_NUEVOS[resumen.ramasNuevas.length % COLORES_NUEVOS.length], icono: 'generico' });
      ramas.set(k, id);
      resumen.ramasNuevas.push(texto);
      return id;
    };
    const nivelDe = cod => {
      const id = cod.includes('.') ? cod.split('.')[0] : cod;
      if (!p.niveles.some(n => n.id === id)) {
        p.niveles.push({ id, nombre: `${vocab.nivel || 'Nivel'} ${id}`, corto: id });
        resumen.nivelesNuevos.push(id);
      }
      return id;
    };

    const vistos = new Set();
    filas.slice(ub.fila + 1).forEach(f => {
      const cod = codigo(celda(f, 'guia'));
      if (!cod) return;
      if (vistos.has(cod)) { resumen.avisos.push(`La guía ${cod} aparece más de una vez; se usa la última fila.`); }
      vistos.add(cod);
      resumen.filas++;
      let nodo = p.nodos.find(n => n.id === cod || n.codigo === cod);
      const ramasFila = [...new Set(['sub1', 'sub2', 'sub3'].map(k => celda(f, k)).filter(Boolean).map(buscarRama))];
      if (!nodo) {
        if (!ramasFila.length) { resumen.avisos.push(`${cod} no existe en el proyecto y no tiene subcategoría: se omite.`); return; }
        nodo = { id: cod, codigo: cod, titulo: `${vocab.nodo || 'Guía'} ${cod}`, nivel: nivelDe(cod), rama: ramasFila[0], tipo: 'guia', ramasSecundarias: [], habilidades: [], herramientas: [], prerrequisitos: [], deseables: [] };
        p.nodos.push(nodo);
        resumen.nuevas.push(cod);
      } else resumen.actualizadas++;
      if (ramasFila.length) {
        if (nodo.rama !== ramasFila[0] && !resumen.nuevas.includes(cod)) resumen.cambiosRama.push(`${cod}: ${nodo.rama} → ${ramasFila[0]}`);
        nodo.rama = ramasFila[0];
        nodo.ramasSecundarias = ramasFila.slice(1);
      } else resumen.avisos.push(`${cod} no tiene subcategoría: conserva su rama.`);
      nodo.prerrequisitos = lista(celda(f, 'indispensable'));
      nodo.deseables = lista(celda(f, 'deseable')).filter(d => !nodo.prerrequisitos.includes(d));
      if (ub.col.herramienta !== undefined) nodo.herramientas = celda(f, 'herramienta').split(/[,;]+/).map(x => x.trim()).filter(Boolean);
    });

    const ids = new Set(p.nodos.map(n => n.id));
    p.nodos.forEach(n => [...n.prerrequisitos, ...(n.deseables || [])].forEach(x => {
      if (!ids.has(x)) resumen.avisos.push(`${n.codigo} depende de ${x}, que no existe.`);
    }));
    const fuera = p.nodos.filter(n => !vistos.has(n.id)).map(n => n.codigo);
    if (fuera.length) resumen.avisos.push(`${fuera.length} guías del proyecto no están en la hoja y conservan sus datos: ${fuera.slice(0, 8).join(', ')}${fuera.length > 8 ? '…' : ''}.`);
    if (!resumen.filas) throw new Error('La hoja no tiene filas con código de guía.');
    return { proyecto: p, resumen };
  }

  /** Filas de la hoja del grafo a partir del proyecto (mismo orden que el anexo: de 11° a Transición). */
  function filas(proyecto) {
    const nivel = new Map(proyecto.niveles.map((n, i) => [n.id, i]));
    const rama = new Map(proyecto.ramas.map(r => [r.id, r.nombre]));
    const nodos = [...proyecto.nodos].sort((a, b) => nivel.get(b.nivel) - nivel.get(a.nivel) || Modelo.compararCodigos(a.codigo, b.codigo));
    return [CABECERA, ...nodos.map(n => {
      const sec = n.ramasSecundarias || [];
      return [
        aHoja(n.codigo),
        (n.prerrequisitos || []).map(aHoja).join(', '),
        (n.deseables || []).map(aHoja).join(', '),
        rama.get(n.rama) || '',
        rama.get(sec[0]) || '',
        sec.slice(1).map(r => rama.get(r)).filter(Boolean).join(', '),
        (n.herramientas || []).join(', ')
      ];
    })];
  }

  return { CABECERA, aplicar, filas };
})();
