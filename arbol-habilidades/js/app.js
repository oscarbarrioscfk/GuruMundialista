/*
 * App: estado, paneles y conexión entre el modelo y la vista.
 */
(() => {
  const CLAVE = 'arbolHabilidades.v3';
  const CLAVE_V2 = 'arbolHabilidades.v2';
  const ID_EJEMPLO = 'ejemplo-pc';
  // Proyectos de ejemplo incluidos en la herramienta (no se pueden eliminar, sí restablecer).
  const EJEMPLOS = { 'ejemplo-pc': () => window.PROYECTO_PC, 'ejemplo-marco': () => window.PROYECTO_MARCO };
  const esEjemplo = id => Object.prototype.hasOwnProperty.call(EJEMPLOS, id) && !!EJEMPLOS[id]();
  // Solo lectura: «?lectura» o un enlace compartido «#ver=…». Nunca escribe en los proyectos guardados.
  const PARAMS = new URLSearchParams(location.search);
  const HASH = new URLSearchParams(location.hash.slice(1));
  const LECTURA = PARAMS.has('lectura') || HASH.has('ver');
  const CLAVE_LECTURA = 'arbolHabilidades.lectura';
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const copia = o => JSON.parse(JSON.stringify(o));

  const estado = {
    idProyecto: ID_EJEMPLO, proyecto: null, completados: new Set(), rutasUsuario: [], edicion: false, fichaLectura: false,
    seleccion: null, rutaActiva: null, foco: null, busqueda: '', estudiante: false, editandoRuta: null,
    fuente: 'equipo', matriz: 'todas', capas: null,
    filtros: { herramientas: new Set(), rangos: new Set(), desde: 0, hasta: Infinity }
  };
  let m = null;

  // ── Persistencia (solo en este navegador, varios proyectos) ─────
  let almacen = { actual: ID_EJEMPLO, proyectos: {} };
  const entradaEjemplo = (id = ID_EJEMPLO) => ({ proyecto: copia(EJEMPLOS[id]()), completados: [], rutasUsuario: [], fuente: 'equipo', actualizado: Date.now() });
  function leerAlmacen() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (datos && datos.proyectos) {
        Object.entries(datos.proyectos).forEach(([id, e]) => { if (e && !Modelo.validar(e.proyecto).length) almacen.proyectos[id] = e; });
        if (almacen.proyectos[datos.actual]) almacen.actual = datos.actual;
      } else {
        // Migración desde la versión anterior (un único proyecto)
        const v2 = JSON.parse(localStorage.getItem(CLAVE_V2) || 'null');
        if (v2 && !Modelo.validar(v2.proyecto).length) almacen.proyectos[ID_EJEMPLO] = { ...v2, actualizado: Date.now() };
      }
    } catch (e) { /* almacenamiento no disponible o dañado */ }
    Object.keys(EJEMPLOS).filter(esEjemplo).forEach(id => {
      if (!almacen.proyectos[id]) almacen.proyectos[id] = { ...entradaEjemplo(id), actualizado: 0 };
    });
    actualizarEjemplo(almacen.proyectos[ID_EJEMPLO].proyecto);
  }
  // El ejemplo guardado antes de existir las categorías las recibe sin perder cambios,
  // y toma los colores de la paleta vigente.
  function actualizarEjemplo(p) {
    const semilla = window.PROYECTO_PC;
    if (p.categorias && p.paleta !== semilla.paleta) {
      p.categorias.forEach(c => { const s = semilla.categorias.find(x => x.id === c.id); if (s) { c.color = s.color; c.tinte = s.tinte; } });
      p.ramas.forEach(r => { const s = semilla.ramas.find(x => x.id === r.id); if (s) r.color = s.color; });
      p.paleta = semilla.paleta;
    }
    if (p.categorias || !semilla.categorias) return;
    p.paleta = semilla.paleta;
    p.categorias = copia(semilla.categorias);
    const orden = semilla.ramas.map(r => r.id);
    p.ramas.forEach(r => {
      const s = semilla.ramas.find(x => x.id === r.id);
      if (s) { r.categoria = s.categoria; r.color = s.color; }
    });
    p.ramas.sort((a, b) => (orden.indexOf(a.id) + 1 || 99) - (orden.indexOf(b.id) + 1 || 99));
  }
  function guardar() {
    if (LECTURA) {
      // En lectura solo se recuerdan la vista y el progreso del modo estudiante.
      try {
        const prefs = JSON.parse(localStorage.getItem(CLAVE_LECTURA) || '{}');
        prefs[estado.idProyecto] = { capas: estado.capas, completados: [...estado.completados] };
        localStorage.setItem(CLAVE_LECTURA, JSON.stringify(prefs));
      } catch (e) { /* sin almacenamiento */ }
      return;
    }
    almacen.actual = estado.idProyecto;
    almacen.proyectos[estado.idProyecto] = {
      proyecto: estado.proyecto, completados: [...estado.completados], rutasUsuario: estado.rutasUsuario,
      fuente: estado.fuente, capas: estado.capas, actualizado: Date.now()
    };
    try { localStorage.setItem(CLAVE, JSON.stringify(almacen)); } catch (e) { /* sin almacenamiento: la sesión sigue funcionando */ }
  }
  function abrirProyecto(id, { encuadrar = true } = {}) {
    const e = almacen.proyectos[id];
    if (!e) return;
    estado.idProyecto = id;
    estado.proyecto = e.proyecto;
    estado.completados = new Set(e.completados || []);
    estado.rutasUsuario = e.rutasUsuario || [];
    estado.fuente = Modelo.FUENTES[e.fuente] ? e.fuente : 'equipo';
    estado.capas = { ...CAPAS_COMPLETAS, ...(e.capas || {}) };
    vista.establecerCapas(estado.capas);
    estado.seleccion = estado.rutaActiva = estado.foco = estado.editandoRuta = null;
    estado.filtros = { herramientas: new Set(), rangos: new Set(), desde: 0, hasta: Infinity };
    historial.length = 0;
    guardar();
    reconstruir({ encuadrar });
  }
  // ── Solo lectura ────────────────────────────────────────────────
  async function iniciarLectura() {
    document.body.classList.add('modo-lectura');
    $('#insignia-lectura').hidden = false;
    $('#pie-guardado').textContent = 'Vista de solo lectura · tus cambios de vista y tu progreso quedan solo en este navegador';
    let datos = null, error = null;
    try {
      if (HASH.get('ver')) datos = await Compartir.decodificar(HASH.get('ver'));
      else if (EJEMPLOS[`ejemplo-${PARAMS.get('ejemplo')}`]) datos = { proyecto: copia(EJEMPLOS[`ejemplo-${PARAMS.get('ejemplo')}`]()) };
      else if (PARAMS.get('url')) {
        const r = await fetch(PARAMS.get('url'));
        if (!r.ok) throw new Error(`No se pudo descargar el proyecto (${r.status}).`);
        const j = await r.json();
        datos = j.proyecto ? j : { proyecto: j };
        const errores = Modelo.validar(datos.proyecto);
        if (errores.length) throw new Error('El archivo no contiene un proyecto válido: ' + errores.join(' '));
      }
    } catch (e) { error = e.message || String(e); }
    if (!datos) datos = { proyecto: copia(window.PROYECTO_PC) };
    if (!datos.proyecto.categorias && datos.proyecto.titulo === window.PROYECTO_PC.titulo) actualizarEjemplo(datos.proyecto);
    const id = `lectura:${Modelo.normalizar(datos.proyecto.titulo || 'proyecto')}`;
    let prefs = {};
    try { prefs = JSON.parse(localStorage.getItem(CLAVE_LECTURA) || '{}')[id] || {}; } catch (e) { /* sin almacenamiento */ }
    almacen.proyectos[id] = {
      proyecto: datos.proyecto, rutasUsuario: datos.rutas || [], fuente: datos.fuente,
      capas: prefs.capas || datos.capas, completados: prefs.completados || []
    };
    abrirProyecto(id);
    if (datos.vista === 'poster') $('[data-vista="poster"]').click();
    if (error) mostrarDialogo('No se pudo abrir el enlace', `<p>${esc(error)}</p><p>Se muestra el proyecto de ejemplo.</p>`);
  }

  /** Copia el proyecto que se está viendo a «Mis proyectos» y abre el editor. */
  function copiaEditable() {
    const e = almacen.proyectos[estado.idProyecto];
    let guardado = { actual: ID_EJEMPLO, proyectos: {} };
    try { guardado = JSON.parse(localStorage.getItem(CLAVE) || 'null') || guardado; } catch (err) { /* vacío */ }
    const id = `p-${Date.now().toString(36)}`;
    guardado.proyectos[id] = { proyecto: copia(e.proyecto), completados: [], rutasUsuario: copia(e.rutasUsuario || []), fuente: estado.fuente, capas: estado.capas, actualizado: Date.now() };
    guardado.actual = id;
    try { localStorage.setItem(CLAVE, JSON.stringify(guardado)); } catch (err) { aviso('Este navegador no permite guardar proyectos.', 'error'); return; }
    location.href = location.href.split(/[?#]/)[0];
  }

  async function dialogoCompartir() {
    const codigo = await Compartir.codificar({
      proyecto: estado.proyecto, rutas: estado.rutasUsuario, capas: estado.capas, fuente: estado.fuente, vista: vista.vista
    });
    const url = Compartir.enlace(codigo);
    const local = location.protocol === 'file:';
    mostrarDialogo('Compartir en solo lectura', `
      <p>Quien abra este enlace verá <b>«${esc(estado.proyecto.titulo)}»</b> tal como está ahora, con la vista actual (nivel, capas y ${vista.vista === 'poster' ? 'vista póster' : 'árbol radial'}). Podrá explorarlo, usar el modo estudiante y descargar imágenes, pero no editarlo.</p>
      <textarea class="enlace-compartir" id="enlace-compartir" readonly rows="4">${esc(url)}</textarea>
      <div class="botonera" style="justify-content:flex-start;gap:8px;margin-top:8px">
        <button type="button" class="boton" data-copiar-enlace>Copiar enlace</button>
        <a class="boton boton-secundario" href="${esc(url)}" target="_blank" rel="noopener">Abrir vista previa</a>
      </div>
      <p class="nota">El proyecto viaja dentro del enlace (${(url.length / 1000).toFixed(1)} mil caracteres), sin servidor ni cuentas. Si cambias el diseño, comparte un enlace nuevo.${url.length > 30000 ? ' <b>Es un enlace largo:</b> algunos servicios de mensajería podrían cortarlo; en ese caso, publica el .json y usa «?lectura&amp;url=».' : ''}${local ? ' <b>Ojo:</b> estás usando la herramienta desde un archivo local; para que otros abran el enlace, compártelo desde la versión publicada en línea.' : ''}</p>`);
  }

  function crearProyecto(proyecto, extra = {}) {
    const id = `p-${Date.now().toString(36)}`;
    almacen.proyectos[id] = { proyecto, completados: [], rutasUsuario: [], fuente: 'equipo', ...extra, actualizado: Date.now() };
    abrirProyecto(id);
    return id;
  }

  // ── Capas de la vista: de lo más simple a lo más complejo ───────
  const CAPAS_COMPLETAS = { conexiones: true, secundarias: true, proyectos: true, categorias: true, perfiles: true };
  const NIVELES_VISTA = [
    { id: 1, nombre: 'Ramas', ayuda: 'Solo ramas y guías', capas: { conexiones: false, secundarias: false, proyectos: false, categorias: false, perfiles: false } },
    { id: 2, nombre: 'Conexiones', ayuda: 'Más prerrequisitos y proyectos', capas: { conexiones: true, secundarias: false, proyectos: true, categorias: false, perfiles: false } },
    { id: 3, nombre: 'Categorías', ayuda: 'Más agrupación y ejes secundarios', capas: { conexiones: true, secundarias: true, proyectos: true, categorias: true, perfiles: false } },
    { id: 4, nombre: 'Perfiles', ayuda: 'Vista completa', capas: { ...CAPAS_COMPLETAS } }
  ];
  const CAPAS_NOMBRE = [
    ['conexiones', 'Conexiones', 'Prerrequisitos entre guías (al hacer clic en una guía siempre se ven los suyos)'],
    ['proyectos', 'Proyectos', 'Nodos de evaluación y proyectos integradores'],
    ['secundarias', 'Ejes secundarios', 'Puntos de color con las otras ramas de cada guía'],
    ['categorias', 'Categorías', 'Agrupa las ramas en categorías'],
    ['perfiles', 'Perfiles', 'La persona hacia la que crece cada categoría']
  ];

  function renderCapas() {
    const tieneCat = m.categorias.length > 0;
    const efectivas = { ...estado.capas, perfiles: estado.capas.perfiles && estado.capas.categorias };
    // Sin categorías en el proyecto, solo cuentan las capas que sí existen.
    const cuenta = k => tieneCat || (k !== 'categorias' && k !== 'perfiles');
    const nivel = NIVELES_VISTA.find(n => Object.keys(CAPAS_COMPLETAS).every(k => !cuenta(k) || !!n.capas[k] === !!efectivas[k]));
    $('#niveles-vista').innerHTML = NIVELES_VISTA.filter(n => tieneCat || n.id <= 2).map(n => `
      <button type="button" data-nivel-vista="${n.id}" class="${nivel && nivel.id === n.id ? 'activo' : ''}" title="${esc(n.ayuda)}">
        <b>${n.id}</b><span>${esc(n.nombre)}</span></button>`).join('');
    $('#capas-vista').innerHTML = CAPAS_NOMBRE.map(([k, nombre, ayuda]) => {
      const deshabilitada = (k === 'categorias' || k === 'perfiles') && !tieneCat || (k === 'perfiles' && !estado.capas.categorias);
      const activa = !!efectivas[k] && !deshabilitada;
      return `<button type="button" class="chip capa" data-capa="${k}" aria-pressed="${activa}" ${deshabilitada ? 'disabled' : ''} title="${esc(deshabilitada && !tieneCat ? 'Este proyecto no tiene categorías (se crean en Diseñar → Estructura)' : ayuda)}">${esc(nombre)}</button>`;
    }).join('');
    $('#nota-vista').textContent = nivel ? NIVELES_VISTA.find(n => n.id === nivel.id).ayuda : 'Vista personalizada';
  }
  function aplicarCapas(nuevas) {
    estado.capas = { ...estado.capas, ...nuevas };
    if (!estado.capas.categorias) estado.capas.perfiles = false;
    vista.establecerCapas(estado.capas);
    guardar();
    reconstruir({ encuadrar: false });
    vista.encuadrar(null, 600);
  }

  // ── Historial (deshacer) ────────────────────────────────────────
  const historial = [];
  /**
   * Aplica un cambio al proyecto. fn(proyecto) lo modifica; si devuelve false se descarta.
   * opciones.formulario / opciones.estructura: volver a pintar esos paneles (por defecto sí).
   */
  function cambiar(fn, opciones = {}) {
    const antes = JSON.stringify({ p: estado.proyecto, r: estado.rutasUsuario, s: estado.seleccion });
    if (fn(estado.proyecto) === false) {
      const previo = JSON.parse(antes);
      estado.proyecto = previo.p; estado.rutasUsuario = previo.r; estado.seleccion = previo.s;
      if (opciones.formulario !== false) renderDetalle();
      return false;
    }
    historial.push(antes);
    if (historial.length > 80) historial.shift();
    guardar();
    reconstruir({ encuadrar: false, detalle: opciones.formulario !== false, estructura: opciones.estructura !== false });
    $('#btn-deshacer').disabled = false;
    return true;
  }
  function deshacer() {
    if (!historial.length) { aviso('No hay nada que deshacer.'); return; }
    const previo = JSON.parse(historial.pop());
    estado.proyecto = previo.p; estado.rutasUsuario = previo.r;
    estado.seleccion = previo.s && previo.p.nodos.some(n => n.id === previo.s) ? previo.s : null;
    guardar();
    reconstruir({ encuadrar: false });
    $('#btn-deshacer').disabled = !historial.length;
    aviso('Cambio deshecho.');
  }

  let temporizadorAviso;
  function aviso(texto, tipo = 'info') {
    const el = $('#aviso');
    el.textContent = texto;
    el.className = `aviso aviso-${tipo}`;
    el.hidden = false;
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => { el.hidden = true; }, tipo === 'error' ? 4500 : 2600);
  }

  // ── Vista ───────────────────────────────────────────────────────
  const tooltip = $('#tooltip');
  const vista = Vista.crear($('#arbol'), {
    onNodo: id => clicNodo(id),
    onFondo: () => { if (!estado.editandoRuta) seleccionar(null); },
    onRama: id => enfocarRama(estado.foco === id ? null : id),
    onHover: (n, e) => mostrarTooltip(n, e),
    onNivelZoom: nivel => $$('#indicador-zoom span').forEach(s => s.classList.toggle('activo', s.dataset.nivel === nivel)),
    onDobleClic: celda => crearEnCelda(celda),
    onConectar: (a, b, deseable) => {
      let r = null;
      cambiar(p => { r = Editor.conectar(p, a, b, deseable ? 'deseable' : 'indispensable'); if (typeof r === 'string') { aviso(r, 'error'); return false; } }, { formulario: true });
      if (r && typeof r === 'object') aviso(`${r.origen} → ${r.destino} (${deseable ? 'deseable' : 'indispensable'}). Ctrl+Z para deshacer.`);
    }
  });

  function crearEnCelda(celda) {
    if (!estado.edicion) return;
    if (!celda) { aviso('Haz doble clic dentro de un anillo y una rama para crear ahí la guía.'); return; }
    let nuevo = null;
    cambiar(p => { nuevo = Editor.agregarNodo(p, celda); estado.seleccion = nuevo.id; });
    activarPestana('detalle');
    const t = $('#detalle [data-campo="titulo"]');
    if (t) { t.focus(); t.select(); }
    aviso(`${nuevo.codigo} creada. Escribe su título y sus habilidades.`);
  }

  function reconstruir({ encuadrar = true, detalle = true, estructura = true } = {}) {
    m = Modelo.preparar(estado.proyecto, { fuente: estado.fuente });
    $$('#filtro-fuente [data-fuente]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fuente === estado.fuente)));
    estado.filtros.hasta = Math.min(estado.filtros.hasta, m.proyecto.niveles.length - 1);
    if (!Number.isFinite(estado.filtros.hasta)) estado.filtros.hasta = m.proyecto.niveles.length - 1;
    vista.dibujar(m);
    $('#titulo-proyecto').textContent = `${m.proyecto.titulo} · ${m.proyecto.subtitulo || ''}`.replace(/ · $/, '');
    $('#autoria').textContent = m.proyecto.autoria || '';
    renderRamas();
    renderCapas();
    renderFiltros();
    renderTrayectorias();
    renderDiagnostico();
    if (estado.edicion && estructura) Disenio.estructura($('#estructura'));
    $('#lienzo-vacio').hidden = m.nodos.length > 0;
    $('#nombre-modo').textContent = m.proyecto.vocabulario?.modo || 'Modo estudiante';
    $('#indicador-zoom [data-nivel="medio"]').textContent = Editor.plural(m.proyecto.vocabulario?.nodo || 'Guía');
    $('#indicador-zoom [data-nivel="cerca"]').textContent = nombreHabilidades();
    $('#btn-nueva-guia').textContent = `+ Nueva ${(m.proyecto.vocabulario?.nodo || 'guía').toLowerCase()}`;
    const sel = m.porId.has(estado.seleccion) ? estado.seleccion : null;
    if (detalle) seleccionar(sel, { pestana: false });
    else { estado.seleccion = sel; vista.seleccionar(sel); }
    aplicarFiltros();
    aplicarEstudiante();
    if (estado.rutaActiva) vista.mostrarRuta(rutaPorId(estado.rutaActiva)?.nodos);
    if (encuadrar) requestAnimationFrame(() => vista.encuadrar(null, 0));
  }

  // ── Selección y detalle ─────────────────────────────────────────
  function clicNodo(id) {
    if (estado.editandoRuta) {
      const pasos = estado.editandoRuta.nodos;
      if (pasos[pasos.length - 1] === id) pasos.pop(); else if (!pasos.includes(id)) pasos.push(id);
      vista.mostrarRuta(pasos);
      renderTrayectorias();
      return;
    }
    if (estado.edicion) { estado.fichaLectura = false; seleccionar(id); return; }
    if (estado.estudiante) {
      const est = Modelo.estado(m, id, estado.completados);
      if (est === 'completado') desmarcar(id);
      else if (est === 'disponible') estado.completados.add(id);
      guardar();
      aplicarEstudiante();
    }
    seleccionar(id);
  }

  // Al desmarcar una guía, también se desmarca lo que dependía de ella.
  function desmarcar(id) {
    estado.completados.delete(id);
    Modelo.recorrer(m, id, 'adelante').nodos.forEach(d => estado.completados.delete(d));
  }

  function seleccionar(id, { pestana = true } = {}) {
    estado.seleccion = id;
    vista.seleccionar(id);
    renderDetalle();
    if (id && pestana) activarPestana('detalle');
  }

  function renderDetalle() {
    const cont = $('#detalle');
    const id = estado.seleccion;
    if (id && estado.edicion && !estado.fichaLectura) { Disenio.formulario(cont, id); return; }
    if (!id && estado.edicion) {
      cont.innerHTML = `
        <div class="vacio">
          <h3>Modo diseño</h3>
          <ul>
            <li><b>Doble clic</b> en un hueco del árbol (un anillo dentro de una rama) para crear una ${esc((m.proyecto.vocabulario?.nodo || 'guía').toLowerCase())} ahí.</li>
            <li><b>Arrastra</b> de una ${esc((m.proyecto.vocabulario?.nodo || 'guía').toLowerCase())} a otra para conectarlas (indispensable). Con <b>Mayús</b>, deseable.</li>
            <li><b>Clic</b> en un nodo para editar su ficha: título, rama, habilidades y prerrequisitos.</li>
            <li>La pestaña <b>Estructura</b> define ramas, ${esc(Editor.plural((m.proyecto.vocabulario?.nivel || 'nivel').toLowerCase()))} y el nombre del proyecto.</li>
            <li><b>Ctrl+Z</b> deshace el último cambio. Todo se guarda solo en este navegador.</li>
          </ul>
        </div>`;
      return;
    }
    if (!id) {
      const voc = m.proyecto.vocabulario || {}, nodo = (voc.nodo || 'guía').toLowerCase(), nodos = Editor.plural(nodo);
      cont.innerHTML = `
        <div class="vacio">
          <svg viewBox="0 0 90 90" aria-hidden="true">
            <circle cx="45" cy="45" r="14" fill="#4F2B63"/>
            ${[0, 1, 2, 3, 4, 5].map(k => {
              const a = -Math.PI / 2 + k * Math.PI / 3, x = 45 + Math.cos(a) * 32, y = 45 + Math.sin(a) * 32;
              return `<line x1="45" y1="45" x2="${x}" y2="${y}" stroke="#6898D0" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="${k % 2 ? '#662B80' : '#6898D0'}" stroke-width="3"/>`;
            }).join('')}
          </svg>
          <h3>Explora el árbol</h3>
          <p>Cada rama es ${esc(voc.rama || 'un eje del pensamiento computacional')} y cada anillo, un ${esc(voc.nivel?.toLowerCase() || 'nivel')}.</p>
          <ul>
            <li><b>Rueda del ratón</b> o pellizco: acercar y alejar. Al acercarte aparecen las ${esc(nodos)} y luego sus ${esc(nombreHabilidades().toLowerCase())}.</li>
            <li><b>Clic en una ${esc(nodo)}</b>: ves lo que requiere (azul) y lo que desbloquea (morado).</li>
            <li><b>Clic en una rama</b>: la enfocas y atenúas el resto.</li>
            <li><b>Rutas</b>: recorridos listos o creados por ti.</li>
            <li><b>${esc(voc.modo || 'Modo estudiante')}</b>: marca ${esc(nodos)} completadas y mira qué se desbloquea.</li>
          </ul>
        </div>`;
      return;
    }
    const n = m.porId.get(id);
    const rama = m.ramaPorId.get(n.rama);
    const nivel = m.proyecto.niveles[n._nivel];
    const siguienteNivel = m.proyecto.niveles[n._nivel + 1];
    const usaRangos = m.nodos.some(x => x._rangoMax !== null);
    const requiere = m.entrantes.get(id), desbloquea = m.salientes.get(id);
    const vinculo = (a, lado) => {
      const otro = m.porId.get(a[lado]);
      const comparten = a.etiquetas.length ? `<small>${esc(a.etiquetas.slice(0, 3).join(' · '))}${a.etiquetas.length > 3 ? '…' : ''}</small>` : '';
      return `<button type="button" class="vinculo tipo-${a.tipo}" data-ir="${esc(otro.id)}" title="${esc(TIPO_VINCULO[a.tipo])}"><b>${esc(otro.codigo)}</b> ${esc(otro.titulo)}${comparten}</button>`;
    };
    const grupos = (lista, lado, vacio) => {
      if (!lista.length) return `<p class="nota">${vacio}</p>`;
      return ['indispensable', 'deseable', 'habilidad', 'proyecto'].map(t => {
        const del = lista.filter(a => a.tipo === t);
        return del.length ? `<h5 class="tipo-vinculo"><i class="linea-${t}"></i>${esc(TIPO_VINCULO[t])} (${del.length})</h5><div class="vinculos">${del.map(a => vinculo(a, lado)).join('')}</div>` : '';
      }).join('');
    };
    const est = estado.estudiante ? Modelo.estado(m, id, estado.completados) : null;
    const faltan = est === 'bloqueado' ? requiere.filter(a => a.tipo !== 'deseable' && !estado.completados.has(a.origen)).map(a => m.porId.get(a.origen).codigo) : [];
    const recomendadas = est && est !== 'completado' ? requiere.filter(a => a.tipo === 'deseable' && !estado.completados.has(a.origen)).map(a => m.porId.get(a.origen).codigo) : [];
    cont.innerHTML = `
      <article class="ficha">
        <div class="ficha-cabecera">
          <div class="ficha-codigo ${n.tipo === 'proyecto' ? 'proyecto' : ''}" style="color:${rama.color}">${esc(n.codigo)}</div>
          <div>
            <h3 class="ficha-titulo">${esc(n.titulo)}</h3>
            <div class="ficha-meta">${esc(nivel.nombre)} · ${esc(m.proyecto.vocabulario?.nodo || 'Nodo')}${n.tipo === 'proyecto' ? ' integradora' : ''}</div>
          </div>
        </div>
        <div class="etiquetas">
          <span class="etiqueta" style="background:${rama.color}">${esc(rama.corto)}</span>
          ${n.ramasSecundarias.map(r => { const x = m.ramaPorId.get(r); return `<span class="etiqueta secundaria" style="color:${x.color}">${esc(x.corto)}</span>`; }).join('')}
          ${n.herramientas.map(t => `<span class="etiqueta herramienta">${esc(t)}</span>`).join('')}
        </div>
        ${est ? `<p class="nota" style="font-size:.82rem;color:${est === 'bloqueado' ? '#C2417A' : '#3C8D5A'}">
          ${est === 'completado' ? '✔ Completada. Clic de nuevo para desmarcar.' : est === 'disponible' ? '★ Disponible: haz clic en el nodo para marcarla como completada.' : `🔒 Bloqueada: completa antes ${esc(faltan.join(', '))}.`}${recomendadas.length ? `<br>Recomendado antes: ${esc(recomendadas.join(', '))}.` : ''}</p>` : ''}
        ${n.descripcion ? `<p class="ficha-descripcion">${esc(n.descripcion)}</p>` : ''}
        ${n.habilidades.length ? `<h4>${esc(nombreHabilidades())}</h4>
          <ul class="habilidades">${n.habilidades.map(h => `
            <li><span>${esc(h.nombre)}</span>${h.rango === null || h.rango === undefined ? (usaRangos ? '<span class="sin-rango">sin nivel</span>' : '')
              : `<span class="rangos" title="${Modelo.RANGOS[h.rango]}">${[0, 1, 2].map(k => `<i class="${k <= h.rango ? 'lleno' : ''}"></i>`).join('')}</span>`}</li>`).join('')}
          </ul>` : '<p class="nota">Integra lo trabajado en las guías del nivel.</p>'}
        ${n.avance ? `<div class="ficha-avance"><h4>Para avanzar${siguienteNivel ? ` a ${esc(siguienteNivel.nombre)}` : ''}</h4><p>${esc(n.avance)}</p></div>` : ''}
        <h4>Requiere (${requiere.length})</h4>
        ${grupos(requiere, 'origen', 'Es un punto de entrada: no tiene prerrequisitos.')}
        <h4>Desbloquea (${desbloquea.length})</h4>
        ${grupos(desbloquea, 'destino', 'Ninguna guía posterior depende de esta.')}
        <p class="nota">${esc(NOTA_FUENTE[m.fuente])} Debajo de cada vínculo aparecen las habilidades que comparten.</p>
        ${estado.edicion ? `<button type="button" class="boton" data-editar-ficha="${esc(n.id)}">✎ Editar</button>` : ''}
      </article>`;
  }

  const nombreHabilidades = () => (m.proyecto.vocabulario?.habilidad ? Editor.plural(m.proyecto.vocabulario.habilidad) : 'Habilidades');
  const TIPO_VINCULO = { indispensable: 'Indispensables', deseable: 'Deseables', habilidad: 'Por habilidad compartida', proyecto: 'Proyecto integrador' };
  const NOTA_FUENTE = {
    equipo: 'Conexiones del grafo de dependencias del equipo pedagógico.',
    habilidades: 'Conexiones derivadas de las habilidades que se repiten entre niveles.',
    ambas: 'Conexiones del grafo del equipo más las derivadas de habilidades compartidas.'
  };

  // ── Ramas y foco ────────────────────────────────────────────────
  function insigniaHTML(rama) {
    return `<span class="insignia-rama"><svg viewBox="-20 -20 40 40" aria-hidden="true">
      <circle r="15" fill="#fff" stroke="#6898D0" stroke-width="1.2"/>
      <path d="M-14.6 4.3A15 15 0 0 0 -4.6 14.3" fill="none" stroke="#6898D0" stroke-width="3" stroke-linecap="round" transform="translate(-1.5,1)"/>
      <use href="#ico-${esc(rama.icono || 'generico')}" x="-10" y="-10" width="20" height="20" color="${rama.color}" stroke="${rama.color}" fill="${rama.color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="fill:none"/>
    </svg></span>`;
  }
  function renderRamas() {
    const fila = i => {
      const r = m.proyecto.ramas[i];
      const n = m.nodos.filter(x => x._rama === i && x.tipo !== 'proyecto').length;
      return `<li><button type="button" data-rama="${esc(r.id)}" class="${estado.foco === r.id ? 'activo' : ''}" title="${esc(r.nombre)}">
        ${insigniaHTML(r)}<span>${esc(r.corto)}</span><span class="conteo">${n}</span></button></li>`;
    };
    const orden = m.ordenRamas;
    const grupos = (estado.capas.categorias ? m.categorias : []).map(c => ({ c, idx: orden.filter(i => m.proyecto.ramas[i].categoria === c.id) })).filter(g => g.idx.length);
    const sueltas = orden.filter(i => !estado.capas.categorias || !m.catIdx.has(m.proyecto.ramas[i].categoria));
    $('#lista-ramas').innerHTML = grupos.map(({ c, idx }) => `
      <li class="grupo-categoria" style="--tinte:${esc(c.tinte || '#EEF2F8')};--c:${esc(c.color || '#4F2B63')}">
        <button type="button" class="cabecera-categoria ${estado.foco === `cat:${c.id}` ? 'activo' : ''}" data-rama="cat:${esc(c.id)}" title="${esc(c.nombre)}">
          <span class="perfil-mini"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#perfil-${esc(c.icono || 'generico')}" stroke="${esc(c.color)}" color="${esc(c.color)}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span><b>${esc(c.perfil || c.nombre)}</b><small>${esc(c.nombre)}</small></span>
        </button>
        <ul>${idx.map(fila).join('')}</ul>
      </li>`).join('') + sueltas.map(fila).join('');
  }
  function enfocarRama(id) {
    estado.foco = id;
    vista.enfocarRama(id);
    $$('#lista-ramas button').forEach(b => b.classList.toggle('activo', b.dataset.rama === id));
    if (!id) vista.encuadrar();
  }

  // ── Filtros y búsqueda ──────────────────────────────────────────
  function renderFiltros() {
    const presentes = Modelo.HERRAMIENTAS.filter(t => m.nodos.some(n => n._herramientas.includes(t.id)));
    $('#filtro-herramientas').innerHTML = presentes.map(t =>
      `<button type="button" class="chip" data-herramienta="${t.id}" aria-pressed="${estado.filtros.herramientas.has(t.id)}">${esc(t.nombre)}</button>`).join('');
    $('#filtro-rangos').innerHTML = Modelo.RANGOS.map((r, i) =>
      `<button type="button" class="chip" data-rango="${i}" aria-pressed="${estado.filtros.rangos.has(i)}">${r}</button>`).join('');
    const opciones = m.proyecto.niveles.map((n, i) => `<option value="${i}">${esc(n.nombre)}</option>`).join('');
    $('#nivel-desde').innerHTML = opciones;
    $('#nivel-hasta').innerHTML = opciones;
    $('#nivel-desde').value = estado.filtros.desde;
    $('#nivel-hasta').value = estado.filtros.hasta;
  }
  function coincidencias() {
    const f = estado.filtros, q = Modelo.normalizar(estado.busqueda);
    const ultimo = m.proyecto.niveles.length - 1;
    const activo = f.herramientas.size || f.rangos.size || f.desde > 0 || f.hasta < ultimo || q;
    if (!activo) return null;
    return new Set(m.nodos.filter(n =>
      (!f.herramientas.size || n._herramientas.some(t => f.herramientas.has(t)))
      && (!f.rangos.size || n.habilidades.some(h => f.rangos.has(h.rango)))
      && n._nivel >= f.desde && n._nivel <= f.hasta
      && (!q || n._busqueda.includes(q))
    ).map(n => n.id));
  }
  function aplicarFiltros() {
    vista.filtrar(coincidencias());
  }

  // ── Trayectorias ────────────────────────────────────────────────
  const todasLasRutas = () => [...(m.proyecto.trayectorias || []).map(r => ({ ...r, propia: false })), ...estado.rutasUsuario.map(r => ({ ...r, propia: true }))];
  const rutaPorId = id => todasLasRutas().find(r => r.id === id);

  function renderTrayectorias() {
    const ed = estado.editandoRuta;
    const pasos = ids => ids.filter(id => m.porId.has(id)).map(id => `<span>${esc(m.porId.get(id).codigo)}</span>`).join('');
    $('#trayectorias').innerHTML = `
      ${ed ? `<div class="editor-ruta">
          <strong style="color:#4F2B63">Nueva trayectoria</strong>
          <p class="nota">Haz clic en las guías del árbol en el orden de la ruta. Clic en la última para quitarla.</p>
          <input id="ruta-nombre" type="text" placeholder="Nombre de la trayectoria" value="${esc(ed.nombre)}">
          <input id="ruta-desc" type="text" placeholder="Descripción (opcional)" value="${esc(ed.descripcion)}">
          <div class="ruta" style="margin:0"><div class="pasos">${pasos(ed.nodos) || '<span>Sin pasos todavía</span>'}</div></div>
          <div class="botonera">
            <button type="button" class="boton" data-accion-ruta="guardar" ${ed.nodos.length < 2 ? 'disabled' : ''}>Guardar</button>
            <button type="button" class="boton boton-secundario" data-accion-ruta="cancelar">Cancelar</button>
          </div>
        </div>`
        : LECTURA ? '' : `<button type="button" class="boton" data-accion-ruta="nueva" style="margin-bottom:12px">+ Nueva trayectoria</button>`}
      ${todasLasRutas().map(r => `
        <div class="ruta ${estado.rutaActiva === r.id ? 'activo' : ''}" data-ruta="${esc(r.id)}" role="button" tabindex="0">
          <h5><span>${esc(r.nombre)}</span>${r.propia && !LECTURA ? `<button type="button" class="enlace borrar" data-borrar-ruta="${esc(r.id)}">Borrar</button>` : ''}</h5>
          ${r.descripcion ? `<p>${esc(r.descripcion)}</p>` : ''}
          <div class="pasos">${pasos(r.nodos)}</div>
        </div>`).join('')}
      <p class="nota">Selecciona una trayectoria para iluminarla en el árbol. Vuelve a hacer clic para quitarla.</p>`;
  }
  function activarRuta(id) {
    estado.rutaActiva = estado.rutaActiva === id ? null : id;
    const ruta = estado.rutaActiva ? rutaPorId(estado.rutaActiva) : null;
    if (ruta && estado.seleccion) { estado.seleccion = null; vista.seleccionar(null); renderDetalle(); }
    vista.mostrarRuta(ruta ? ruta.nodos : null);
    if (ruta) vista.encuadrar(ruta.nodos.filter(x => m.porId.has(x)));
    renderTrayectorias();
  }

  // ── Diagnóstico ─────────────────────────────────────────────────
  function renderDiagnostico() {
    const { alertas, matriz } = Modelo.diagnosticar(m, { matriz: estado.matriz });
    const guias = m.nodos.filter(n => n.tipo !== 'proyecto');
    const habilidades = new Set(guias.flatMap(n => n.habilidades.map(h => h._clave)));
    const nodosMay = esc(Editor.plural(m.proyecto.vocabulario?.nodo || 'Guía'));
    const maximo = Math.max(1, ...matriz.flat());
    $('#num-alertas').textContent = alertas.filter(a => a.gravedad !== 'baja').length || '';
    $('#diagnostico').innerHTML = `
      <div class="resumen">
        <div><b>${guias.length}</b><span>${esc(Editor.plural((m.proyecto.vocabulario?.nodo || 'nodo').toLowerCase()))}</span></div>
        <div><b>${habilidades.size}</b><span>${esc(nombreHabilidades().toLowerCase())}</span></div>
        <div><b>${m.aristas.filter(a => a.tipo !== 'proyecto').length}</b><span>conexiones</span></div>
      </div>
      <h4 class="titulo-panel" style="margin-top:6px">Equilibrio por rama y ${esc((m.proyecto.vocabulario?.nivel || 'nivel').toLowerCase())}</h4>
      <div class="chips" id="modo-matriz" style="margin:6px 0 8px">
        <button type="button" class="chip" data-matriz="todas" aria-pressed="${estado.matriz === 'todas'}">Todas las asociaciones</button>
        <button type="button" class="chip" data-matriz="principal" aria-pressed="${estado.matriz === 'principal'}">Solo eje principal</button>
      </div>
      <table class="matriz">
        <thead><tr><th></th>${m.proyecto.niveles.map(n => `<th>${esc(n.corto)}</th>`).join('')}</tr></thead>
        <tbody>${m.ordenRamas.map(i => [m.proyecto.ramas[i], i]).map(([r, i]) => `<tr><th class="fila" title="${esc(r.nombre)}" style="border-left:4px solid ${esc(m.categorias.find(c => c.id === r.categoria)?.color || 'transparent')}">${esc(r.corto.length > 11 ? r.corto.slice(0, 10) + '.' : r.corto)}</th>${matriz[i].map(v => {
          const a = v ? 0.18 + 0.82 * (v / maximo) : 0;
          return `<td style="background:${v ? hexA(r.color, a) : '#F4F6FB'};color:${a > 0.55 ? '#fff' : '#58595B'}">${v ? fraccion(v) : ''}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table>
      <p class="nota" style="margin-bottom:14px">${estado.matriz === 'todas'
        ? `${nodosMay} asociadas a cada rama, como eje principal o secundario.${m.proyecto.titulo === window.PROYECTO_PC?.titulo ? ' Es el mismo conteo del mapa de calor «Currículo en Pensamiento Computacional» del equipo.' : ''}`
        : `${nodosMay} cuyo eje principal es cada rama.`}</p>
      <h4 class="titulo-panel">Alertas de diseño (${alertas.length})</h4>
      <ul class="alertas">${alertas.map(a => `
        <li><button type="button" class="alerta ${a.gravedad}" ${a.nodo ? `data-ir="${esc(a.nodo)}"` : `data-rama="${esc(a.rama)}"`}>
          <strong>${esc(a.texto)}</strong><span>${esc(a.detalle)}</span></button></li>`).join('')}
      </ul>`;
  }
  const fraccion = v => (Number.isInteger(v) ? String(v) : `${Math.floor(v) || ''}½`);
  function hexA(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(2)})`;
  }

  // ── Modo estudiante ─────────────────────────────────────────────
  function aplicarEstudiante() {
    const btn = $('#btn-estudiante');
    btn.setAttribute('aria-pressed', estado.estudiante);
    $('#barra-estudiante').hidden = !estado.estudiante;
    const estados = new Map(m.nodos.map(n => [n.id, Modelo.estado(m, n.id, estado.completados)]));
    vista.aplicarEstudiante(estado.estudiante, estados, Modelo.avancePerfiles(m, estado.completados));
    if (!estado.estudiante) return;
    const total = m.nodos.length, hechos = [...estados.values()].filter(e => e === 'completado').length;
    const disponibles = [...estados.values()].filter(e => e === 'disponible').length;
    const habs = new Set(m.nodos.filter(n => estado.completados.has(n.id)).flatMap(n => n.habilidades.map(h => h._clave)));
    $('#progreso-texto').textContent = `${hechos} de ${total} ${Editor.plural((m.proyecto.vocabulario?.nodo || 'nodo').toLowerCase())}`;
    $('#progreso-detalle').textContent = `${habs.size} ${nombreHabilidades().toLowerCase()} · ${disponibles} disponibles`;
    $("#progreso-barra").style.width = `${total ? (100 * hechos / total).toFixed(1) : 0}%`;
    if (estado.seleccion) renderDetalle();
  }

  // ── Tooltip ─────────────────────────────────────────────────────
  function mostrarTooltip(n, e) {
    if (!n) { tooltip.hidden = true; return; }
    const caja = $('.lienzo').getBoundingClientRect();
    const rama = m.ramaPorId.get(n.rama);
    tooltip.innerHTML = `<strong>${esc(n.codigo)} · ${esc(n.titulo)}</strong>${esc(m.proyecto.niveles[n._nivel].nombre)} · ${esc(rama.corto)}<br>${n.habilidades.length} habilidades · requiere ${m.entrantes.get(n.id).length} · desbloquea ${m.salientes.get(n.id).length}`;
    tooltip.hidden = false;
    const x = Math.min(e.clientX - caja.left + 14, caja.width - tooltip.offsetWidth - 8);
    const y = Math.min(e.clientY - caja.top + 14, caja.height - tooltip.offsetHeight - 8);
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  // ── Archivos ────────────────────────────────────────────────────
  function descargar(nombre, contenido, tipo) {
    const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const nombreBase = () => Modelo.normalizar(m.proyecto.titulo || 'arbol') || 'arbol';

  function exportarPNG() {
    const { texto, ancho, alto } = vista.exportarSVG();
    const escala = Math.min(2, 8000 / Math.max(ancho, alto));
    const img = new Image();
    img.onload = () => {
      const lienzo = Object.assign(document.createElement('canvas'), { width: Math.round(ancho * escala), height: Math.round(alto * escala) });
      const ctx = lienzo.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
      lienzo.toBlob(b => descargar(`${nombreBase()}-${vista.vista}.png`, b), 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(texto);
  }

  function importar(archivo) {
    const lector = new FileReader();
    lector.onload = () => {
      let datos;
      try { datos = JSON.parse(lector.result); } catch (e) { alert('El archivo no es un JSON válido.'); return; }
      const proyecto = datos.proyecto || datos;
      const errores = Modelo.validar(proyecto);
      if (errores.length) { alert('No se pudo abrir el proyecto:\n\n• ' + errores.join('\n• ')); return; }
      crearProyecto(proyecto, {
        completados: datos.completados || [], rutasUsuario: datos.rutasUsuario || [],
        fuente: Modelo.FUENTES[datos.fuente] ? datos.fuente : 'equipo'
      });
      aviso(`«${proyecto.titulo}» abierto como proyecto nuevo.`);
    };
    lector.readAsText(archivo);
  }

  async function importarHoja(archivo) {
    let resultado;
    try {
      resultado = Grafo.aplicarLibro(estado.proyecto, await Hoja.leer(archivo));
    } catch (e) {
      mostrarDialogo('No se pudo importar la hoja', `<p>${esc(e.message)}</p>`);
      return;
    }
    const errores = Modelo.validar(resultado.proyecto);
    if (errores.length) { mostrarDialogo('No se pudo importar la hoja', `<ul>${errores.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`); return; }
    const r = resultado.resumen;
    const conGrafo = r.filasGrafo > 0;
    cambiar(() => {
      estado.proyecto = resultado.proyecto;
      if (conGrafo) estado.fuente = 'equipo';
    });
    vista.encuadrar();
    const pl = (n, uno, varios) => `<b>${n}</b> ${n === 1 ? uno : varios}`;
    const lista = (titulo, xs) => (xs.length ? `<h4>${titulo} (${xs.length})</h4><p>${xs.map(esc).join(', ')}</p>` : '');
    const nodo = (m.proyecto.vocabulario?.nodo || 'guía').toLowerCase();
    mostrarDialogo('Hoja importada', `
      <p>De «${esc(archivo.name)}» se leyeron: ${r.hojas.map(esc).join(' · ')}.</p>
      ${conGrafo ? `<p>Grafo: ${pl(r.filasGrafo, 'fila', 'filas')}, ${pl(r.actualizadas, `${nodo} actualizada`, `${Editor.plural(nodo)} actualizadas`)}.</p>` : ''}
      ${r.guiasHabilidades || r.titulos ? `<p>Habilidades: ${pl(r.habilidades, 'habilidad', 'habilidades')} en ${pl(r.guiasHabilidades, nodo, Editor.plural(nodo))}; ${pl(r.titulos, 'título cambiado', 'títulos cambiados')}.</p>` : ''}
      ${r.categorias ? `<p>Categorías: ${pl(r.categorias, 'categoría', 'categorías')}, ${pl(r.ramasAgrupadas, 'rama agrupada', 'ramas agrupadas')}.</p>` : ''}
      ${lista('Cambian de rama principal', r.cambiosRama)}
      ${lista(`${nodo[0].toUpperCase()}${Editor.plural(nodo).slice(1)} nuevas`, r.nuevas)}
      ${lista('Ramas nuevas', r.ramasNuevas)}
      ${lista('Niveles nuevos', r.nivelesNuevos)}
      ${r.avisos.length ? `<h4>Avisos (${r.avisos.length})</h4><ul>${r.avisos.slice(0, 12).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <p class="nota">Si algo no quedó bien, Ctrl+Z deshace la importación completa.</p>`);
  }

  function dialogoProyectos() {
    const orden = Object.keys(EJEMPLOS);
    const filas = Object.entries(almacen.proyectos).sort((a, b) => (orden.indexOf(a[0]) + 1 || 99) - (orden.indexOf(b[0]) + 1 || 99) || b[1].actualizado - a[1].actualizado);
    mostrarDialogo('Mis proyectos', `
      <ul class="lista-proyectos">${filas.map(([id, e]) => `
        <li class="${id === estado.idProyecto ? 'actual' : ''}">
          <div><b>${esc(e.proyecto.titulo)}</b><span>${e.proyecto.nodos.length} ${esc(Editor.plural((e.proyecto.vocabulario?.nodo || 'nodo').toLowerCase()))} · ${e.proyecto.ramas.length} ramas${esEjemplo(id) ? ' · ejemplo' : ` · ${new Date(e.actualizado || Date.now()).toLocaleDateString('es')}`}</span></div>
          ${id === estado.idProyecto ? '<em>Abierto</em>' : `<button type="button" class="boton boton-secundario" data-abrir-proyecto="${esc(id)}">Abrir</button>`}
          ${esEjemplo(id) ? '' : `<button type="button" class="enlace borrar" data-borrar-proyecto="${esc(id)}">Eliminar</button>`}
        </li>`).join('')}
      </ul>
      <div class="botonera"><button type="button" class="boton" data-accion="nuevo">+ Nuevo proyecto</button></div>`);
  }

  function dialogoNuevo() {
    const d = $('#dialogo-nuevo');
    const f = d.querySelector('form');
    f.reset();
    f.dataset.tocado = '';
    rellenarPlantilla(f, 'libro');
    d.showModal ? d.showModal() : d.setAttribute('open', '');
    f.querySelector('[name=titulo]').focus();
  }
  function rellenarPlantilla(f, tipo) {
    const pl = Editor.PLANTILLAS[tipo];
    if (!f.dataset.tocado.includes('niveles')) f.niveles.value = pl.niveles.join('\n');
    if (!f.dataset.tocado.includes('ramas')) f.ramas.value = pl.ramas.join('\n');
  }
  function crearDesdeDialogo() {
    const f = $('#dialogo-nuevo form');
    const lineas = t => t.split(/\n+/).map(x => x.trim()).filter(Boolean);
    const datos = { titulo: f.titulo.value.trim(), subtitulo: f.subtitulo.value.trim(), autoria: f.autoria.value.trim(), tipo: f.tipo.value, niveles: lineas(f.niveles.value), ramas: lineas(f.ramas.value) };
    if (!datos.titulo) { f.titulo.focus(); return; }
    if (!datos.niveles.length || !datos.ramas.length) { aviso('Escribe al menos un nivel y una rama.', 'error'); return; }
    $('#dialogo-nuevo').close();
    crearProyecto(Editor.nuevoProyecto(datos));
    activarEdicion(true);
    aviso(`«${datos.titulo}» creado. Doble clic en un anillo para crear la primera ${(Editor.PLANTILLAS[datos.tipo].vocabulario.nodo).toLowerCase()}.`);
  }

  function cerrarDialogo() {
    const d = $('#dialogo');
    if (d.open) (d.close ? d.close() : d.removeAttribute('open'));
  }
  function mostrarDialogo(titulo, html) {
    const d = $('#dialogo');
    $('#dialogo-titulo').textContent = titulo;
    $('#dialogo-cuerpo').innerHTML = html;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }

  function accionArchivo(accion) {
    $('#menu-archivo').hidden = true;
    $('#btn-archivo').setAttribute('aria-expanded', 'false');
    if (accion === 'exportar-json') {
      descargar(`${nombreBase()}.json`, JSON.stringify({
        proyecto: estado.proyecto, rutasUsuario: estado.rutasUsuario, completados: [...estado.completados], fuente: estado.fuente
      }, null, 2), 'application/json');
    } else if (accion === 'importar-json') $('#archivo-json').click();
    else if (accion === 'exportar-svg') descargar(`${nombreBase()}-${vista.vista}.svg`, vista.exportarSVG().texto, 'image/svg+xml');
    else if (accion === 'exportar-png') exportarPNG();
    else if (accion === 'importar-hoja') $('#archivo-hoja').click();
    else if (accion === 'exportar-hoja') descargar(`${nombreBase()}.xlsx`, Hoja.xlsx(Grafo.libro(estado.proyecto)));
    else if (accion === 'plantilla') descargar('plantilla-arbol-de-habilidades.xlsx', Hoja.xlsx(Grafo.plantilla()));
    else if (accion === 'proyectos') dialogoProyectos();
    else if (accion === 'compartir') dialogoCompartir();
    else if (accion === 'copia-editable') copiaEditable();
    else if (accion === 'nuevo') { cerrarDialogo(); dialogoNuevo(); }
    else if (accion === 'duplicar') {
      const p = copia(estado.proyecto);
      p.titulo = `${p.titulo} (copia)`;
      crearProyecto(p, { rutasUsuario: copia(estado.rutasUsuario), fuente: estado.fuente });
      aviso(`Ahora trabajas en «${p.titulo}». El original queda intacto en Mis proyectos.`);
    } else if (accion === 'restablecer') {
      const id = esEjemplo(estado.idProyecto) ? estado.idProyecto : ID_EJEMPLO;
      const titulo = EJEMPLOS[id]().titulo;
      if (!confirm(`¿Restablecer el proyecto de ejemplo «${titulo}»? Se perderán sus cambios, el progreso y sus trayectorias propias. Tus otros proyectos no se tocan.`)) return;
      almacen.proyectos[id] = entradaEjemplo(id);
      abrirProyecto(id);
    }
  }

  // ── Modo diseño ─────────────────────────────────────────────────
  function activarEdicion(activo) {
    estado.edicion = activo;
    estado.fichaLectura = false;
    if (activo && estado.estudiante) { estado.estudiante = false; aplicarEstudiante(); }
    if (activo && estado.editandoRuta) { estado.editandoRuta = null; vista.mostrarRuta(null); }
    $('#btn-editar').setAttribute('aria-pressed', String(activo));
    $('#btn-estudiante').disabled = activo;
    $('#barra-edicion').hidden = !activo;
    $('[data-pestana="estructura"]').hidden = !activo;
    vista.modoEdicion(activo);
    if (activo) Disenio.estructura($('#estructura'));
    else if ($('[data-pestana="estructura"]').classList.contains('activo')) activarPestana('detalle');
    renderDetalle();
  }

  // ── Pestañas ────────────────────────────────────────────────────
  function activarPestana(nombre) {
    $$('.pestanas button').forEach(b => b.classList.toggle('activo', b.dataset.pestana === nombre));
    $$('.contenido-pestana').forEach(c => { c.hidden = c.dataset.contenido !== nombre; });
  }

  // ── Eventos de la interfaz ──────────────────────────────────────
  function enlazar() {
    $$('.segmentado button').forEach(b => b.addEventListener('click', () => {
      $$('.segmentado button').forEach(x => x.classList.toggle('activo', x === b));
      vista.cambiarVista(b.dataset.vista);
    }));
    $$('.controles-zoom button').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.zoom === 'mas') vista.acercar(1.5);
      else if (b.dataset.zoom === 'menos') vista.acercar(1 / 1.5);
      else vista.encuadrar();
    }));
    $$('.pestanas button').forEach(b => b.addEventListener('click', () => activarPestana(b.dataset.pestana)));

    let temporizador;
    $('#buscar').addEventListener('input', e => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { estado.busqueda = e.target.value; aplicarFiltros(); }, 120);
    });
    $('#buscar').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      estado.busqueda = e.target.value;
      const ids = coincidencias();
      if (ids && ids.size) {
        const primero = m.nodos.find(n => ids.has(n.id));
        seleccionar(primero.id);
        vista.centrarEn(primero.id);
      }
    });

    $('#lista-ramas').addEventListener('click', e => {
      const b = e.target.closest('[data-rama]');
      if (b) enfocarRama(estado.foco === b.dataset.rama ? null : b.dataset.rama);
    });
    $('#filtro-herramientas').addEventListener('click', e => {
      const b = e.target.closest('[data-herramienta]'); if (!b) return;
      const s = estado.filtros.herramientas, id = b.dataset.herramienta;
      s.has(id) ? s.delete(id) : s.add(id);
      b.setAttribute('aria-pressed', s.has(id));
      aplicarFiltros();
    });
    $('#filtro-rangos').addEventListener('click', e => {
      const b = e.target.closest('[data-rango]'); if (!b) return;
      const s = estado.filtros.rangos, r = +b.dataset.rango;
      s.has(r) ? s.delete(r) : s.add(r);
      b.setAttribute('aria-pressed', s.has(r));
      aplicarFiltros();
    });
    ['#nivel-desde', '#nivel-hasta'].forEach(sel => $(sel).addEventListener('change', () => {
      let d = +$('#nivel-desde').value, h = +$('#nivel-hasta').value;
      if (d > h) [d, h] = [h, d];
      Object.assign(estado.filtros, { desde: d, hasta: h });
      $('#nivel-desde').value = d; $('#nivel-hasta').value = h;
      aplicarFiltros();
    }));
    $('#limpiar-filtros').addEventListener('click', () => {
      estado.filtros = { herramientas: new Set(), rangos: new Set(), desde: 0, hasta: m.proyecto.niveles.length - 1 };
      estado.busqueda = ''; $('#buscar').value = '';
      renderFiltros(); aplicarFiltros();
    });

    $('#btn-estudiante').addEventListener('click', () => { estado.estudiante = !estado.estudiante; aplicarEstudiante(); renderDetalle(); });
    $('#reiniciar-progreso').addEventListener('click', () => { estado.completados.clear(); guardar(); aplicarEstudiante(); renderDetalle(); });

    $('#btn-archivo').addEventListener('click', e => {
      e.stopPropagation();
      const menu = $('#menu-archivo');
      menu.hidden = !menu.hidden;
      $('#btn-archivo').setAttribute('aria-expanded', String(!menu.hidden));
    });
    document.addEventListener('click', e => { if (!e.target.closest('.menu')) $('#menu-archivo').hidden = true; });
    $('#menu-archivo').addEventListener('click', e => { const b = e.target.closest('[data-accion]'); if (b) accionArchivo(b.dataset.accion); });
    $('#archivo-json').addEventListener('change', e => { if (e.target.files[0]) importar(e.target.files[0]); e.target.value = ''; });
    $('#archivo-hoja').addEventListener('change', e => { if (e.target.files[0]) importarHoja(e.target.files[0]); e.target.value = ''; });
    $('#dialogo-cerrar').addEventListener('click', cerrarDialogo);
    $('#dialogo-cuerpo').addEventListener('click', e => {
      if (e.target.closest('[data-copiar-enlace]')) {
        const t = $('#enlace-compartir');
        t.select();
        (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(
          () => aviso('Enlace copiado.'), () => { document.execCommand && document.execCommand('copy'); aviso('Enlace seleccionado: cópialo con Ctrl+C.'); });
        return;
      }
      const abrir = e.target.closest('[data-abrir-proyecto]'), borrar = e.target.closest('[data-borrar-proyecto]'), acc = e.target.closest('[data-accion]');
      if (abrir) { cerrarDialogo(); abrirProyecto(abrir.dataset.abrirProyecto); aviso(`Proyecto «${estado.proyecto.titulo}» abierto.`); }
      else if (borrar) {
        const id = borrar.dataset.borrarProyecto, t = almacen.proyectos[id].proyecto.titulo;
        if (!confirm(`¿Eliminar «${t}» de este navegador? No se puede deshacer. Si lo necesitas, guárdalo antes como .json.`)) return;
        delete almacen.proyectos[id];
        if (id === estado.idProyecto) abrirProyecto(ID_EJEMPLO); else guardar();
        dialogoProyectos();
      } else if (acc) accionArchivo(acc.dataset.accion);
    });
    const fNuevo = $('#dialogo-nuevo form');
    fNuevo.addEventListener('input', e => { if (e.target.name === 'niveles' || e.target.name === 'ramas') fNuevo.dataset.tocado += ` ${e.target.name}`; });
    fNuevo.addEventListener('change', e => { if (e.target.name === 'tipo') rellenarPlantilla(fNuevo, e.target.value); });
    fNuevo.addEventListener('submit', e => { e.preventDefault(); crearDesdeDialogo(); });
    $('#nuevo-cancelar').addEventListener('click', () => $('#dialogo-nuevo').close());
    $('#btn-editar').addEventListener('click', () => activarEdicion(!estado.edicion));
    $('#btn-deshacer').addEventListener('click', deshacer);
    $('#btn-nueva-guia').addEventListener('click', () => {
      const nivel = m.porId.get(estado.seleccion)?.nivel || m.proyecto.niveles[0].id;
      const rama = m.porId.get(estado.seleccion)?.rama || m.proyecto.ramas[0].id;
      crearEnCelda({ nivel, rama });
    });
    $('#detalle').addEventListener('click', e => {
      const b = e.target.closest('[data-editar-ficha]');
      if (b) { estado.fichaLectura = false; renderDetalle(); }
    });
    $('#niveles-vista').addEventListener('click', e => {
      const b = e.target.closest('[data-nivel-vista]');
      if (b) aplicarCapas(NIVELES_VISTA.find(n => n.id === +b.dataset.nivelVista).capas);
    });
    $('#capas-vista').addEventListener('click', e => {
      const b = e.target.closest('[data-capa]');
      if (!b || b.disabled) return;
      const k = b.dataset.capa, valor = !(b.getAttribute('aria-pressed') === 'true');
      aplicarCapas(k === 'perfiles' && valor ? { perfiles: true, categorias: true } : { [k]: valor });
    });
    $('#filtro-fuente').addEventListener('click', e => {
      const b = e.target.closest('[data-fuente]');
      if (!b || b.dataset.fuente === estado.fuente) return;
      estado.fuente = b.dataset.fuente;
      guardar();
      reconstruir({ encuadrar: false });
    });
    $('#diagnostico').addEventListener('click', e => {
      const b = e.target.closest('[data-matriz]');
      if (!b) return;
      estado.matriz = b.dataset.matriz;
      renderDiagnostico();
    });

    // Vínculos y alertas que llevan a un nodo o una rama
    document.addEventListener('click', e => {
      const ir = e.target.closest('[data-ir]');
      if (ir) { seleccionar(ir.dataset.ir); vista.centrarEn(ir.dataset.ir); return; }
      const rama = e.target.closest('.alerta[data-rama]');
      if (rama) enfocarRama(rama.dataset.rama);
    });

    $('#trayectorias').addEventListener('click', e => {
      const borrar = e.target.closest('[data-borrar-ruta]');
      if (borrar) {
        e.stopPropagation();
        estado.rutasUsuario = estado.rutasUsuario.filter(r => r.id !== borrar.dataset.borrarRuta);
        if (estado.rutaActiva === borrar.dataset.borrarRuta) { estado.rutaActiva = null; vista.mostrarRuta(null); }
        guardar(); renderTrayectorias(); return;
      }
      const acc = e.target.closest('[data-accion-ruta]');
      if (acc) {
        const a = acc.dataset.accionRuta;
        if (a === 'nueva') {
          estado.editandoRuta = { nombre: '', descripcion: '', nodos: [] };
          estado.rutaActiva = null; seleccionar(null); vista.mostrarRuta([]);
        } else if (a === 'cancelar') {
          estado.editandoRuta = null; vista.mostrarRuta(null);
        } else if (a === 'guardar') {
          const ed = estado.editandoRuta;
          const id = `propia-${Date.now()}`;
          estado.rutasUsuario.push({ id, nombre: ed.nombre.trim() || 'Trayectoria sin nombre', descripcion: ed.descripcion.trim(), nodos: ed.nodos });
          estado.editandoRuta = null; estado.rutaActiva = null;
          guardar(); activarRuta(id); return;
        }
        renderTrayectorias(); activarPestana('trayectorias'); return;
      }
      const ruta = e.target.closest('[data-ruta]');
      if (ruta && !estado.editandoRuta) activarRuta(ruta.dataset.ruta);
    });
    $('#trayectorias').addEventListener('input', e => {
      if (!estado.editandoRuta) return;
      if (e.target.id === 'ruta-nombre') estado.editandoRuta.nombre = e.target.value;
      if (e.target.id === 'ruta-desc') estado.editandoRuta.descripcion = e.target.value;
    });
    $('#trayectorias').addEventListener('keydown', e => {
      const ruta = e.target.closest('[data-ruta]');
      if (ruta && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activarRuta(ruta.dataset.ruta); }
    });

    document.addEventListener('keydown', e => {
      const enCampo = e.target.matches('input, textarea, select');
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && estado.edicion && !enCampo) { e.preventDefault(); deshacer(); return; }
      if (e.key !== 'Escape' || enCampo) return;
      seleccionar(null); enfocarRama(null);
      if (estado.rutaActiva) activarRuta(estado.rutaActiva);
    });
    let redimension;
    window.addEventListener('resize', () => { clearTimeout(redimension); redimension = setTimeout(() => vista.encuadrar(null, 300), 200); });
  }

  // ── Inicio ──────────────────────────────────────────────────────
  leerAlmacen();
  enlazar();
  Disenio.iniciar({
    estado, esc, cambiar, aviso,
    get proyecto() { return estado.proyecto; },
    verFicha: () => { estado.fichaLectura = true; renderDetalle(); }
  });
  // «?ejemplo=marco» abre directamente uno de los proyectos de ejemplo.
  const ejemploPedido = `ejemplo-${PARAMS.get('ejemplo')}`;
  if (LECTURA) iniciarLectura(); else abrirProyecto(almacen.proyectos[ejemploPedido] ? ejemploPedido : almacen.actual);
})();
