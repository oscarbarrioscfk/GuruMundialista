/*
 * Editor: operaciones para crear y modificar un proyecto (sin DOM).
 * Todas reciben el proyecto y lo modifican en el sitio; devuelven un mensaje
 * de error (texto) cuando la operación no es válida.
 */
const Editor = (() => {
  const PALETA = ['#662B80', '#4F79B8', '#7A4A9E', '#C2506F', '#2F5B94', '#8E5FB5', '#B8456A', '#4D8BBF', '#5C3B7E', '#9C3D5E', '#3E8C8E', '#4F2B63'];
  const PERFILES = ['programador', 'innovador', 'ciudadano', 'generico'];
  // Familias de la paleta de las guías: azul periwinkle, lavanda, rosa, ciruela y turquesa suave.
  const COLORES_CATEGORIA = [['#4F79B8', '#E4ECF7'], ['#7A4A9E', '#EFE7F5'], ['#C2506F', '#FBE8ED'], ['#4F2B63', '#ECE6F0'], ['#3E8C8E', '#E2F1F1']];
  const ICONOS = ['algoritmos', 'programacion', 'datos', 'fisica', 'modelacion', 'ia', 'seguridad', 'equidad', 'etica', 'generico'];

  const PLANTILLAS = {
    libro: {
      vocabulario: { nivel: 'Grado', nodo: 'Guía' },
      niveles: ['Grado 1°', 'Grado 2°', 'Grado 3°'],
      ramas: ['Algoritmos', 'Programación', 'Datos']
    },
    curso: {
      vocabulario: { nivel: 'Módulo', nodo: 'Unidad' },
      niveles: ['Módulo 1', 'Módulo 2', 'Módulo 3', 'Módulo 4'],
      ramas: ['Fundamentos', 'Programación', 'Bases de datos', 'Redes', 'Habilidades transversales']
    }
  };

  /** Plural en español: guía → guías, unidad → unidades, nivel → niveles, luz → luces. */
  function plural(palabra) {
    const p = String(palabra || '');
    if (/[aeiouáéó]$/i.test(p)) return `${p}s`;
    if (/z$/i.test(p)) return `${p.slice(0, -1)}ces`;
    return `${p}es`;
  }

  // "Grado 3°" → "3°" · "Módulo 2" → "M2" · "Transición" → "T"
  function corto(nombre) {
    const t = String(nombre).trim();
    const num = t.match(/(\d+)\s*°?/);
    if (/^grado/i.test(t) && num) return `${num[1]}°`;
    if (num) return `${t[0].toUpperCase()}${num[1]}`;
    return t.slice(0, 3);
  }
  const iconoPara = nombre => {
    const n = Modelo.normalizar(nombre);
    const pistas = [['algorit', 'algoritmos'], ['program', 'programacion'], ['dato', 'datos'], ['fisic', 'fisica'], ['robot', 'fisica'],
      ['model', 'modelacion'], ['simul', 'modelacion'], ['inteligencia', 'ia'], ['ia', 'ia'], ['segur', 'seguridad'], ['red', 'seguridad'],
      ['equidad', 'equidad'], ['transvers', 'equidad'], ['etic', 'etica']];
    return (pistas.find(([p]) => n.split('-').some(w => w.startsWith(p))) || [null, 'generico'])[1];
  };
  const idRama = (p, nombre) => {
    let base = Modelo.normalizar(nombre).replace(/-/g, '').slice(0, 3).toUpperCase() || 'R';
    let id = base, k = 2;
    while (p.ramas.some(r => r.id === id)) id = `${base}${k++}`;
    return id;
  };

  /** Proyecto nuevo y vacío a partir de listas de niveles y ramas. */
  function nuevoProyecto({ titulo, subtitulo = '', autoria = '', tipo = 'libro', niveles, ramas, vocabulario }) {
    const base = PLANTILLAS[tipo] || PLANTILLAS.libro;
    const p = {
      version: 1, tipo, titulo: titulo || 'Proyecto sin título', subtitulo, autoria,
      vocabulario: { ...base.vocabulario, raiz: titulo || 'Proyecto', ...(vocabulario || {}) },
      niveles: [], ramas: [], nodos: [], trayectorias: []
    };
    (niveles && niveles.length ? niveles : base.niveles).forEach(n => agregarNivel(p, n));
    (ramas && ramas.length ? ramas : base.ramas).forEach(r => agregarRama(p, r));
    return p;
  }

  // ── Niveles ─────────────────────────────────────────────────────
  function agregarNivel(p, nombre) {
    let n = p.niveles.length + 1;
    while (p.niveles.some(x => x.id === String(n))) n++;
    const texto = nombre || `${p.vocabulario?.nivel || 'Nivel'} ${n}`;
    const nivel = { id: String(n), nombre: texto, corto: corto(texto) };
    p.niveles.push(nivel);
    return nivel;
  }
  function eliminarNivel(p, id) {
    const usados = p.nodos.filter(n => n.nivel === id).length;
    if (usados) return `No se puede eliminar: tiene ${usados} ${usados === 1 ? 'nodo' : 'nodos'}. Muévelos o elimínalos antes.`;
    if (p.niveles.length <= 1) return 'El proyecto necesita al menos un nivel.';
    p.niveles = p.niveles.filter(n => n.id !== id);
    return null;
  }

  // ── Ramas ───────────────────────────────────────────────────────
  function agregarRama(p, nombre) {
    const texto = (nombre || `Rama ${p.ramas.length + 1}`).trim();
    const rama = {
      id: idRama(p, texto), nombre: texto, corto: texto.length > 18 ? texto.slice(0, 17) + '…' : texto,
      color: PALETA[p.ramas.length % PALETA.length], icono: iconoPara(texto)
    };
    p.ramas.push(rama);
    return rama;
  }
  function eliminarRama(p, id) {
    const usados = p.nodos.filter(n => n.rama === id).length;
    if (usados) return `No se puede eliminar: es la rama principal de ${usados} ${usados === 1 ? 'nodo' : 'nodos'}. Cámbiales la rama antes.`;
    if (p.ramas.length <= 1) return 'El proyecto necesita al menos una rama.';
    p.ramas = p.ramas.filter(r => r.id !== id);
    p.nodos.forEach(n => { n.ramasSecundarias = (n.ramasSecundarias || []).filter(r => r !== id); });
    return null;
  }

  // ── Categorías y perfiles ───────────────────────────────────────
  function agregarCategoria(p, nombre, perfil) {
    p.categorias = p.categorias || [];
    const texto = (nombre || `Categoría ${p.categorias.length + 1}`).trim();
    let base = Modelo.normalizar(texto).replace(/-/g, '').slice(0, 3).toUpperCase() || 'C', id = base, k = 2;
    while (p.categorias.some(c => c.id === id)) id = `${base}${k++}`;
    const [color, tinte] = COLORES_CATEGORIA[p.categorias.length % COLORES_CATEGORIA.length];
    const cat = { id, nombre: texto, perfil: perfil || 'Nuevo perfil', icono: PERFILES[p.categorias.length % 3], color, tinte };
    p.categorias.push(cat);
    return cat;
  }
  function eliminarCategoria(p, id) {
    p.categorias = (p.categorias || []).filter(c => c.id !== id);
    p.ramas.forEach(r => { if (r.categoria === id) delete r.categoria; });
  }

  /** Mueve un elemento de una lista (ramas o niveles) una posición arriba (-1) o abajo (+1). */
  function mover(lista, id, paso) {
    const i = lista.findIndex(x => x.id === id), j = i + paso;
    if (i < 0 || j < 0 || j >= lista.length) return;
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }

  // ── Nodos ───────────────────────────────────────────────────────
  function siguienteCodigo(p, nivelId) {
    const usados = p.nodos.filter(n => n.nivel === nivelId).map(n => +String(n.codigo).split('.')[1] || 0);
    let k = (usados.length ? Math.max(...usados) : 0) + 1;
    while (p.nodos.some(n => n.id === `${nivelId}.${k}`)) k++;
    return `${nivelId}.${k}`;
  }
  function agregarNodo(p, { nivel, rama, titulo, tipo = 'guia' } = {}) {
    const nv = nivel || p.niveles[0].id, rm = rama || p.ramas[0].id;
    const codigo = siguienteCodigo(p, nv);
    const nodo = {
      id: codigo, codigo, titulo: titulo || `${p.vocabulario?.nodo || 'Guía'} nueva`, nivel: nv, rama: rm, tipo,
      ramasSecundarias: [], habilidades: [], herramientas: [], prerrequisitos: [], deseables: []
    };
    p.nodos.push(nodo);
    return nodo;
  }
  /** Cambia el código (id) de un nodo y actualiza todas las referencias. */
  function renombrarNodo(p, viejo, nuevo, extra = {}) {
    nuevo = String(nuevo || '').trim();
    if (!nuevo) return 'El código no puede estar vacío.';
    if (nuevo === viejo) return null;
    if (p.nodos.some(n => n.id === nuevo)) return `Ya existe otro nodo con el código «${nuevo}».`;
    const n = p.nodos.find(x => x.id === viejo);
    n.id = nuevo; n.codigo = nuevo;
    const cambia = lista => (lista || []).map(x => (x === viejo ? nuevo : x));
    p.nodos.forEach(x => { x.prerrequisitos = cambia(x.prerrequisitos); x.deseables = cambia(x.deseables); });
    (p.trayectorias || []).forEach(t => { t.nodos = cambia(t.nodos); });
    (extra.rutas || []).forEach(t => { t.nodos = cambia(t.nodos); });
    if (extra.completados && extra.completados.delete(viejo)) extra.completados.add(nuevo);
    return null;
  }
  function eliminarNodo(p, id, extra = {}) {
    p.nodos = p.nodos.filter(n => n.id !== id);
    const quita = lista => (lista || []).filter(x => x !== id);
    p.nodos.forEach(x => { x.prerrequisitos = quita(x.prerrequisitos); x.deseables = quita(x.deseables); });
    (p.trayectorias || []).forEach(t => { t.nodos = quita(t.nodos); });
    (extra.rutas || []).forEach(t => { t.nodos = quita(t.nodos); });
    if (extra.completados) extra.completados.delete(id);
  }

  /** Conecta origen → destino. El nodo de nivel anterior siempre queda como prerrequisito. */
  function conectar(p, a, b, tipo = 'indispensable') {
    if (a === b) return 'Una guía no puede depender de sí misma.';
    const nivel = new Map(p.niveles.map((n, i) => [n.id, i]));
    let o = p.nodos.find(n => n.id === a), d = p.nodos.find(n => n.id === b);
    const antes = (x, y) => nivel.get(x.nivel) - nivel.get(y.nivel) || Modelo.compararCodigos(x.codigo, y.codigo);
    if (antes(o, d) > 0) [o, d] = [d, o];
    d.prerrequisitos = (d.prerrequisitos || []).filter(x => x !== o.id);
    d.deseables = (d.deseables || []).filter(x => x !== o.id);
    (tipo === 'deseable' ? d.deseables : d.prerrequisitos).push(o.id);
    return { origen: o.id, destino: d.id };
  }
  function desconectar(p, origen, destino) {
    const d = p.nodos.find(n => n.id === destino);
    if (!d) return;
    d.prerrequisitos = (d.prerrequisitos || []).filter(x => x !== origen);
    d.deseables = (d.deseables || []).filter(x => x !== origen);
  }

  return {
    PALETA, ICONOS, PERFILES, PLANTILLAS, corto, plural, agregarCategoria, eliminarCategoria, nuevoProyecto, agregarNivel, eliminarNivel, agregarRama, eliminarRama, mover,
    siguienteCodigo, agregarNodo, renombrarNodo, eliminarNodo, conectar, desconectar
  };
})();
