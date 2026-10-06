/*
 * Grafo: traduce las hojas de cálculo del equipo pedagógico al proyecto y viceversa.
 *
 * Hoja «Grafo guías» (una fila por guía, formato del Anexo 1):
 *   Guía · Guía indispensable · Guía deseable · Subcategoría · Subcategoría 2 ·
 *   Subcategoría 3 · Herramienta computacional · Descripción · Para avanzar
 *   (las dos últimas son opcionales)
 * Hoja «Habilidades» (una fila por habilidad):
 *   Guía · Título · Habilidad · Nivel de dominio (N0/N1/N2) · Clave
 *
 * Hoja «Categorías» (opcional, como la tabla de categorías del equipo):
 *   Categoría principal · Subcategorías · Perfil
 *   Una subcategoría por fila; la categoría puede ir solo en su primera fila.
 *
 * Un mismo archivo puede traer las tres hojas; se reconocen por sus columnas.
 */
const Grafo = (() => {
  const CABECERA = ['Guía', 'Guía indispensable', 'Guía deseable', 'Subcategoría', 'Subcategoría 2', 'Subcategoría 3', 'Herramienta computacional', 'Descripción', 'Para avanzar'];
  const CABECERA_HAB = ['Guía', 'Título', 'Habilidad', 'Nivel de dominio', 'Clave'];
  const CABECERA_CAT = ['Categoría principal', 'Subcategorías', 'Perfil'];
  const ALIAS_CAT = {
    categoria: ['categoriaprincipal', 'categoria', 'categorias'],
    ramas: ['subcategorias', 'subcategoria', 'ramas', 'rama'],
    perfil: ['perfil', 'perfildesalida', 'persona']
  };
  const ALIAS_GRAFO = {
    guia: ['guia', 'codigo', 'nodo', 'unidad'],
    indispensable: ['guiaindispensable', 'indispensable', 'indispensables', 'prerrequisitos', 'prerrequisito'],
    deseable: ['guiadeseable', 'deseable', 'deseables'],
    sub1: ['subcategoria', 'subcategoria1', 'ejeprincipal', 'eje', 'rama'],
    sub2: ['subcategoria2', 'eje2', 'rama2'],
    sub3: ['subcategoria3', 'eje3', 'rama3'],
    herramienta: ['herramientacomputacional', 'herramienta', 'herramientas'],
    descripcion: ['descripcion', 'descripciondelnivel'],
    avance: ['paraavanzar', 'avance', 'paraelsiguientenivel']
  };
  const ALIAS_HAB = {
    guia: ALIAS_GRAFO.guia,
    titulo: ['titulo', 'titulodelaguia', 'nombredelaguia', 'nombreguia', 'tituloguia'],
    habilidad: ['habilidad', 'habilidades', 'aprendizaje', 'aprendizajes'],
    rango: ['niveldedominio', 'dominio', 'rango', 'nivelhabilidad'],
    clave: ['clave', 'claveopcional', 'identificador'],
    sub1: ALIAS_GRAFO.sub1
  };
  const COLORES_NUEVOS = ['#4F79B8', '#7A4A9E', '#C2506F', '#3E8C8E', '#5C3B7E', '#9C3D5E', '#2F5B94'];

  const clave = s => Modelo.normalizar(s).replace(/-/g, '');
  const codigo = c => String(c ?? '').trim().replace(/^T\.?(\d+)$/i, 'T.$1');
  const lista = v => String(v ?? '').split(/[,;]+/).map(codigo).filter(Boolean);
  const aHoja = c => c.replace(/^T\.(\d+)$/, 'T$1');
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

  function ubicarColumnas(filas, alias, requerida = 'guia') {
    for (let i = 0; i < Math.min(filas.length, 6); i++) {
      const cab = (filas[i] || []).map(c => clave(c || ''));
      const col = {};
      Object.entries(alias).forEach(([k, nombres]) => {
        const j = cab.findIndex(c => nombres.includes(c));
        if (j >= 0) col[k] = j;
      });
      if (col[requerida] !== undefined) return { fila: i, col };
    }
    return null;
  }

  /** 'habilidades', 'grafo' o null según las columnas de la hoja. */
  function tipoDeHoja(filas) {
    const c = ubicarColumnas(filas, ALIAS_CAT, 'categoria');
    if (c && c.col.ramas !== undefined && ubicarColumnas(filas, ALIAS_GRAFO)?.col.indispensable === undefined) return 'categorias';
    const h = ubicarColumnas(filas, ALIAS_HAB);
    if (h && h.col.habilidad !== undefined) return 'habilidades';
    const g = ubicarColumnas(filas, ALIAS_GRAFO);
    if (g && ['indispensable', 'deseable', 'sub1'].some(k => g.col[k] !== undefined)) return 'grafo';
    return null;
  }

  function rango(texto) {
    const t = String(texto ?? '').trim();
    if (!t || t === '-' || /^sin/i.test(t)) return null;
    const m = t.match(/^N?\s*([0-2])$/i);
    return m ? +m[1] : undefined;
  }

  // Utilidades compartidas por las dos hojas sobre un proyecto en edición
  function contexto(p, resumen) {
    const vocab = p.vocabulario || {};
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
    const crearNodo = (cod, rama) => {
      const nodo = { id: cod, codigo: cod, titulo: `${vocab.nodo || 'Guía'} ${cod}`, nivel: nivelDe(cod), rama, tipo: 'guia', ramasSecundarias: [], habilidades: [], herramientas: [], prerrequisitos: [], deseables: [] };
      p.nodos.push(nodo);
      resumen.nuevas.push(cod);
      return nodo;
    };
    const buscarNodo = cod => p.nodos.find(n => n.id === cod || n.codigo === cod);
    return { buscarRama, crearNodo, buscarNodo };
  }

  // ── Hoja del grafo ──────────────────────────────────────────────
  function aplicarGrafo(p, filas, resumen, ctx) {
    const ub = ubicarColumnas(filas, ALIAS_GRAFO);
    const celda = (f, k) => (ub.col[k] === undefined ? '' : String(f[ub.col[k]] ?? '').trim());
    const vistos = new Set();
    filas.slice(ub.fila + 1).forEach(f => {
      const cod = codigo(celda(f, 'guia'));
      if (!cod) return;
      if (vistos.has(cod)) resumen.avisos.push(`La guía ${cod} aparece más de una vez en el grafo; se usa la última fila.`);
      vistos.add(cod);
      resumen.filasGrafo++;
      const ramasFila = [...new Set(['sub1', 'sub2', 'sub3'].map(k => celda(f, k)).filter(Boolean).map(ctx.buscarRama))];
      let nodo = ctx.buscarNodo(cod);
      if (!nodo) {
        if (!ramasFila.length) { resumen.avisos.push(`${cod} no existe en el proyecto y no tiene subcategoría: se omite.`); return; }
        nodo = ctx.crearNodo(cod, ramasFila[0]);
      } else resumen.actualizadas.add(cod);
      if (ramasFila.length) {
        const nombre = id => p.ramas.find(r => r.id === id)?.corto || id;
        if (nodo.rama !== ramasFila[0] && !resumen.nuevas.includes(cod)) resumen.cambiosRama.push(`${cod}: ${nombre(nodo.rama)} → ${nombre(ramasFila[0])}`);
        nodo.rama = ramasFila[0];
        nodo.ramasSecundarias = ramasFila.slice(1);
      } else resumen.avisos.push(`${cod} no tiene subcategoría: conserva su rama.`);
      if (celda(f, 'descripcion')) nodo.descripcion = celda(f, 'descripcion');
      if (celda(f, 'avance')) nodo.avance = celda(f, 'avance');
      nodo.prerrequisitos = lista(celda(f, 'indispensable'));
      nodo.deseables = lista(celda(f, 'deseable')).filter(d => !nodo.prerrequisitos.includes(d));
      if (ub.col.herramienta !== undefined) nodo.herramientas = celda(f, 'herramienta').split(/[,;]+/).map(x => x.trim()).filter(Boolean);
    });
    const fuera = p.nodos.filter(n => !vistos.has(n.id)).map(n => n.codigo);
    if (fuera.length) resumen.avisos.push(`${plural(fuera.length, 'guía del proyecto no está', 'guías del proyecto no están')} en el grafo y conservan sus conexiones: ${fuera.slice(0, 8).join(', ')}${fuera.length > 8 ? '…' : ''}.`);
  }

  // ── Hoja de habilidades ─────────────────────────────────────────
  function aplicarHabilidades(p, filas, resumen, ctx) {
    const ub = ubicarColumnas(filas, ALIAS_HAB);
    const celda = (f, k) => (ub.col[k] === undefined ? '' : String(f[ub.col[k]] ?? '').trim());
    const grupos = new Map();
    filas.slice(ub.fila + 1).forEach((f, i) => {
      const cod = codigo(celda(f, 'guia'));
      if (!cod) return;
      if (!grupos.has(cod)) grupos.set(cod, { titulo: '', rama: '', habilidades: [] });
      const g = grupos.get(cod);
      if (!g.titulo && celda(f, 'titulo')) g.titulo = celda(f, 'titulo');
      if (!g.rama && celda(f, 'sub1')) g.rama = celda(f, 'sub1');
      const nombre = celda(f, 'habilidad');
      if (!nombre) return;
      let r = rango(celda(f, 'rango'));
      if (r === undefined) {
        resumen.avisos.push(`Fila ${ub.fila + i + 2}: nivel de dominio «${celda(f, 'rango')}» no reconocido en ${cod} (usa N0, N1 o N2). Queda sin nivel.`);
        r = null;
      }
      g.habilidades.push({ nombre, rango: r, clave: celda(f, 'clave') || null });
    });
    grupos.forEach((g, cod) => {
      let nodo = ctx.buscarNodo(cod);
      if (!nodo) {
        const rama = g.rama ? ctx.buscarRama(g.rama) : p.ramas[0].id;
        if (!g.rama) resumen.avisos.push(`${cod} es nueva y la hoja de habilidades no dice su rama: queda en «${p.ramas[0].corto}». Asígnala en el grafo.`);
        nodo = ctx.crearNodo(cod, rama);
      }
      if (g.titulo && g.titulo !== nodo.titulo) { nodo.titulo = g.titulo; resumen.titulos++; }
      if (g.habilidades.length) {
        nodo.habilidades = g.habilidades;
        resumen.guiasHabilidades++;
        resumen.habilidades += g.habilidades.length;
      }
    });
  }

  // ── Hoja de categorías ──────────────────────────────────────────
  function aplicarCategorias(p, filas, resumen) {
    const ub = ubicarColumnas(filas, ALIAS_CAT, 'categoria');
    const celda = (f, k) => (ub.col[k] === undefined ? '' : String(f[ub.col[k]] ?? '').trim());
    const ramas = new Map();
    p.ramas.forEach(r => [r.id, r.nombre, r.corto].forEach(x => x && ramas.set(clave(x), r)));
    p.categorias = p.categorias || [];
    let actual = null;
    const vistas = new Set();
    filas.slice(ub.fila + 1).forEach(f => {
      const nombre = celda(f, 'categoria');
      if (nombre) {
        actual = p.categorias.find(c => clave(c.nombre) === clave(nombre) || clave(c.perfil || '') === clave(nombre));
        if (!actual) { actual = Editor.agregarCategoria(p, nombre); actual.perfil = ''; resumen.categoriasNuevas.push(nombre); }
        vistas.add(actual.id);
      }
      if (!actual) return;
      const perfil = celda(f, 'perfil');
      if (perfil) actual.perfil = perfil;
      // Los nombres de rama pueden llevar comas: primero el texto completo, luego partes separadas por «;».
      const texto = celda(f, 'ramas');
      if (!texto) return;
      const partes = ramas.has(clave(texto)) ? [texto] : texto.split(/[;\n]+/).map(x => x.trim()).filter(Boolean);
      partes.forEach(nr => {
        const r = ramas.get(clave(nr));
        if (!r) { resumen.avisos.push(`La subcategoría «${nr}» no corresponde a ninguna rama del proyecto.`); return; }
        r.categoria = actual.id;
        resumen.ramasAgrupadas++;
      });
    });
    p.categorias.forEach(c => { if (!c.perfil) c.perfil = c.nombre; });
    resumen.categorias = vistas.size;
  }

  /**
   * Aplica un libro de hojas ([{ nombre, filas }]) a una copia del proyecto.
   * Primero el grafo y luego las habilidades, para que las guías nuevas reciban título.
   */
  function aplicarLibro(proyecto, hojas) {
    const p = JSON.parse(JSON.stringify(proyecto));
    const resumen = {
      hojas: [], filasGrafo: 0, actualizadas: new Set(), nuevas: [], ramasNuevas: [], nivelesNuevos: [], cambiosRama: [],
      guiasHabilidades: 0, habilidades: 0, titulos: 0, categorias: 0, categoriasNuevas: [], ramasAgrupadas: 0, avisos: []
    };
    const ctx = contexto(p, resumen);
    const clasificadas = hojas.map(h => ({ ...h, tipo: tipoDeHoja(h.filas) }));
    const reconocidas = clasificadas.filter(h => h.tipo);
    if (!reconocidas.length) {
      throw new Error('No reconozco ninguna hoja. El grafo necesita las columnas «' + CABECERA.slice(0, 7).join(', ')
        + '», la hoja de habilidades «' + CABECERA_HAB.join(', ') + '» y la de categorías «' + CABECERA_CAT.join(', ') + '».');
    }
    reconocidas.filter(h => h.tipo === 'grafo').forEach(h => { aplicarGrafo(p, h.filas, resumen, ctx); resumen.hojas.push(`${h.nombre} (grafo)`); });
    reconocidas.filter(h => h.tipo === 'habilidades').forEach(h => { aplicarHabilidades(p, h.filas, resumen, ctx); resumen.hojas.push(`${h.nombre} (habilidades)`); });
    reconocidas.filter(h => h.tipo === 'categorias').forEach(h => { aplicarCategorias(p, h.filas, resumen); resumen.hojas.push(`${h.nombre} (categorías)`); });
    const ids = new Set(p.nodos.map(n => n.id));
    p.nodos.forEach(n => [...(n.prerrequisitos || []), ...(n.deseables || [])].forEach(x => {
      if (!ids.has(x)) resumen.avisos.push(`${n.codigo} depende de ${x}, que no existe.`);
    }));
    resumen.actualizadas = resumen.actualizadas.size;
    return { proyecto: p, resumen };
  }

  /** Compatibilidad: aplica una única hoja. */
  const aplicar = (proyecto, filas) => aplicarLibro(proyecto, [{ nombre: 'Hoja1', filas }]);

  // ── Exportación ─────────────────────────────────────────────────
  /** Filas del grafo (mismo orden que el anexo: del último nivel al primero). */
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
        (n.herramientas || []).join(', '),
        n.descripcion || '',
        n.avance || ''
      ];
    })];
  }

  /** Filas de la hoja de habilidades (del primer nivel al último). */
  function filasHabilidades(proyecto) {
    const nivel = new Map(proyecto.niveles.map((n, i) => [n.id, i]));
    const nodos = [...proyecto.nodos].sort((a, b) => nivel.get(a.nivel) - nivel.get(b.nivel) || Modelo.compararCodigos(a.codigo, b.codigo));
    const salida = [CABECERA_HAB];
    nodos.forEach(n => {
      const habs = n.habilidades || [];
      if (!habs.length) { salida.push([aHoja(n.codigo), n.titulo, '', '', '']); return; }
      habs.forEach((h, i) => salida.push([
        aHoja(n.codigo), i === 0 ? n.titulo : '', h.nombre,
        h.rango === null || h.rango === undefined ? '' : `N${h.rango}`, h.clave || ''
      ]));
    });
    return salida;
  }

  /** Filas de la hoja de categorías (la categoría solo en su primera fila, como la tabla del equipo). */
  function filasCategorias(proyecto) {
    const salida = [CABECERA_CAT];
    (proyecto.categorias || []).forEach(c => {
      proyecto.ramas.filter(r => r.categoria === c.id).forEach((r, i) => salida.push([i === 0 ? c.nombre : '', r.nombre, i === 0 ? (c.perfil || '') : '']));
    });
    return salida;
  }

  const INSTRUCCIONES = [
    ['Cómo usar este libro con el Árbol de habilidades'],
    ['Hoja «Grafo guías»: una fila por guía. Define su rama (Subcategoría), ramas secundarias (Subcategoría 2 y 3), herramienta y prerrequisitos.'],
    ['   · Guía indispensable: guías que hay que completar antes (separadas por comas). Bloquean en el modo estudiante.'],
    ['   · Guía deseable: guías recomendadas antes. No bloquean.'],
    ['Hoja «Habilidades»: una fila por habilidad. Repite el código de la guía en cada fila; el título basta con ponerlo en la primera.'],
    ['   · Nivel de dominio: N0 (inicial), N1 (intermedio), N2 (avanzado) o vacío.'],
    ['   · Clave (opcional): el mismo identificador en varias guías indica que es la misma habilidad que se profundiza (p. ej. «condicionales»).'],
    ['Los códigos de guía empiezan por el nivel: 6.3 es la guía 3 del nivel 6. T1 y T.1 son equivalentes.'],
    ['Hoja «Categorías» (opcional): agrupa las subcategorías (ramas) en categorías principales y da el perfil hacia el que crece cada una (p. ej. Programador(a)).'],
    ['   · Una subcategoría por fila. La categoría y el perfil basta con ponerlos en su primera fila.'],
    ['Para importar: Archivo → Importar hoja de cálculo. Se pueden importar todas las hojas a la vez o cada una por separado.']
  ];

  /** Libro completo: grafo, habilidades e instrucciones. */
  function libro(proyecto) {
    return [
      { nombre: 'Grafo guías', filas: filas(proyecto) },
      { nombre: 'Habilidades', filas: filasHabilidades(proyecto) },
      ...((proyecto.categorias || []).length ? [{ nombre: 'Categorías', filas: filasCategorias(proyecto) }] : []),
      { nombre: 'Instrucciones', filas: INSTRUCCIONES }
    ];
  }

  /** Plantilla vacía con filas de ejemplo. */
  function plantilla() {
    return [
      { nombre: 'Grafo guías', filas: [CABECERA, ['1.1', '', '', 'Algoritmos', '', '', ''], ['1.2', '1.1', '', 'Programación', 'Algoritmos', '', 'Scratch']] },
      { nombre: 'Habilidades', filas: [CABECERA_HAB, ['1.1', 'Mi primera guía', 'Seguir instrucciones', 'N0', 'instrucciones'], ['1.1', '', 'Descomponer un problema en pasos', 'N0', 'descomposicion'], ['1.2', 'Programar una historia', 'Programar en bloques', 'N1', 'bloques']] },
      { nombre: 'Categorías', filas: [CABECERA_CAT, ['Conceptos y habilidades en computación', 'Algoritmos', 'Programador(a)'], ['', 'Programación', '']] },
      { nombre: 'Instrucciones', filas: INSTRUCCIONES }
    ];
  }

  return { CABECERA, CABECERA_HAB, CABECERA_CAT, tipoDeHoja, filasCategorias, aplicar, aplicarLibro, filas, filasHabilidades, libro, plantilla };
})();
