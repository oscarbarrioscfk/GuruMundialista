/*
 * App: estado, paneles y conexión entre el modelo y la vista.
 */
(() => {
  const CLAVE = 'arbolHabilidades.v2';
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const copia = o => JSON.parse(JSON.stringify(o));

  const estado = {
    proyecto: null, completados: new Set(), rutasUsuario: [],
    seleccion: null, rutaActiva: null, foco: null, busqueda: '', estudiante: false, editandoRuta: null,
    fuente: 'equipo', matriz: 'todas',
    filtros: { herramientas: new Set(), rangos: new Set(), desde: 0, hasta: Infinity }
  };
  let m = null;

  // ── Persistencia (solo en este navegador) ───────────────────────
  function leerGuardado() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (datos && !Modelo.validar(datos.proyecto).length) return datos;
    } catch (e) { /* almacenamiento no disponible o dañado */ }
    return null;
  }
  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        proyecto: estado.proyecto, completados: [...estado.completados], rutasUsuario: estado.rutasUsuario,
        fuente: estado.fuente
      }));
    } catch (e) { /* sin almacenamiento: la sesión sigue funcionando */ }
  }

  // ── Vista ───────────────────────────────────────────────────────
  const tooltip = $('#tooltip');
  const vista = Vista.crear($('#arbol'), {
    onNodo: id => clicNodo(id),
    onFondo: () => { if (!estado.editandoRuta) seleccionar(null); },
    onRama: id => enfocarRama(estado.foco === id ? null : id),
    onHover: (n, e) => mostrarTooltip(n, e),
    onNivelZoom: nivel => $$('#indicador-zoom span').forEach(s => s.classList.toggle('activo', s.dataset.nivel === nivel))
  });

  function reconstruir({ encuadrar = true } = {}) {
    m = Modelo.preparar(estado.proyecto, { fuente: estado.fuente });
    $$('#filtro-fuente [data-fuente]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.fuente === estado.fuente)));
    estado.filtros.hasta = Math.min(estado.filtros.hasta, m.proyecto.niveles.length - 1);
    if (!Number.isFinite(estado.filtros.hasta)) estado.filtros.hasta = m.proyecto.niveles.length - 1;
    vista.dibujar(m);
    $('#titulo-proyecto').textContent = `${m.proyecto.titulo} · ${m.proyecto.subtitulo || ''}`.replace(/ · $/, '');
    $('#autoria').textContent = m.proyecto.autoria || '';
    renderRamas();
    renderFiltros();
    renderTrayectorias();
    renderDiagnostico();
    seleccionar(m.porId.has(estado.seleccion) ? estado.seleccion : null);
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

  function seleccionar(id) {
    estado.seleccion = id;
    vista.seleccionar(id);
    renderDetalle();
    if (id) activarPestana('detalle');
  }

  function renderDetalle() {
    const cont = $('#detalle');
    const id = estado.seleccion;
    if (!id) {
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
          <p>Cada rama es un eje del pensamiento computacional y cada anillo, un ${esc(m.proyecto.vocabulario?.nivel?.toLowerCase() || 'nivel')}.</p>
          <ul>
            <li><b>Rueda del ratón</b> o pellizco: acercar y alejar. Al acercarte aparecen las guías y luego sus habilidades.</li>
            <li><b>Clic en una guía</b>: ves lo que requiere (azul) y lo que desbloquea (morado).</li>
            <li><b>Clic en una rama</b>: la enfocas y atenúas el resto.</li>
            <li><b>Trayectorias</b>: rutas de especialización listas o creadas por ti.</li>
            <li><b>Modo estudiante</b>: marca guías completadas y mira qué se desbloquea.</li>
          </ul>
        </div>`;
      return;
    }
    const n = m.porId.get(id);
    const rama = m.ramaPorId.get(n.rama);
    const nivel = m.proyecto.niveles[n._nivel];
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
        ${n.habilidades.length ? `<h4>Habilidades</h4>
          <ul class="habilidades">${n.habilidades.map(h => `
            <li><span>${esc(h.nombre)}</span>${h.rango === null || h.rango === undefined ? '<span class="sin-rango">sin nivel</span>'
              : `<span class="rangos" title="${Modelo.RANGOS[h.rango]}">${[0, 1, 2].map(k => `<i class="${k <= h.rango ? 'lleno' : ''}"></i>`).join('')}</span>`}</li>`).join('')}
          </ul>` : '<p class="nota">Integra lo trabajado en las guías del nivel.</p>'}
        <h4>Requiere (${requiere.length})</h4>
        ${grupos(requiere, 'origen', 'Es un punto de entrada: no tiene prerrequisitos.')}
        <h4>Desbloquea (${desbloquea.length})</h4>
        ${grupos(desbloquea, 'destino', 'Ninguna guía posterior depende de esta.')}
        <p class="nota">${esc(NOTA_FUENTE[m.fuente])} Debajo de cada vínculo aparecen las habilidades que comparten.</p>
      </article>`;
  }

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
      <use href="#ico-${esc(rama.icono || 'generico')}" x="-8.5" y="-8.5" width="17" height="17" stroke="${rama.color}" fill="${rama.color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="fill:none"/>
    </svg></span>`;
  }
  function renderRamas() {
    $('#lista-ramas').innerHTML = m.proyecto.ramas.map((r, i) => {
      const n = m.nodos.filter(x => x._rama === i && x.tipo !== 'proyecto').length;
      return `<li><button type="button" data-rama="${esc(r.id)}" class="${estado.foco === r.id ? 'activo' : ''}" title="${esc(r.nombre)}">
        ${insigniaHTML(r)}<span>${esc(r.corto)}</span><span class="conteo">${n}</span></button></li>`;
    }).join('');
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
        : `<button type="button" class="boton" data-accion-ruta="nueva" style="margin-bottom:12px">+ Nueva trayectoria</button>`}
      ${todasLasRutas().map(r => `
        <div class="ruta ${estado.rutaActiva === r.id ? 'activo' : ''}" data-ruta="${esc(r.id)}" role="button" tabindex="0">
          <h5><span>${esc(r.nombre)}</span>${r.propia ? `<button type="button" class="enlace borrar" data-borrar-ruta="${esc(r.id)}">Borrar</button>` : ''}</h5>
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
    const maximo = Math.max(1, ...matriz.flat());
    $('#num-alertas').textContent = alertas.filter(a => a.gravedad !== 'baja').length || '';
    $('#diagnostico').innerHTML = `
      <div class="resumen">
        <div><b>${guias.length}</b><span>${esc((m.proyecto.vocabulario?.nodo || 'nodo').toLowerCase())}s</span></div>
        <div><b>${habilidades.size}</b><span>habilidades</span></div>
        <div><b>${m.aristas.filter(a => a.tipo !== 'proyecto').length}</b><span>conexiones</span></div>
      </div>
      <h4 class="titulo-panel" style="margin-top:6px">Equilibrio por rama y ${esc((m.proyecto.vocabulario?.nivel || 'nivel').toLowerCase())}</h4>
      <div class="chips" id="modo-matriz" style="margin:6px 0 8px">
        <button type="button" class="chip" data-matriz="todas" aria-pressed="${estado.matriz === 'todas'}">Todas las asociaciones</button>
        <button type="button" class="chip" data-matriz="principal" aria-pressed="${estado.matriz === 'principal'}">Solo eje principal</button>
      </div>
      <table class="matriz">
        <thead><tr><th></th>${m.proyecto.niveles.map(n => `<th>${esc(n.corto)}</th>`).join('')}</tr></thead>
        <tbody>${m.proyecto.ramas.map((r, i) => `<tr><th class="fila" title="${esc(r.nombre)}">${esc(r.corto.length > 11 ? r.corto.slice(0, 10) + '.' : r.corto)}</th>${matriz[i].map(v => {
          const a = v ? 0.18 + 0.82 * (v / maximo) : 0;
          return `<td style="background:${v ? hexA(r.color, a) : '#F4F6FB'};color:${a > 0.55 ? '#fff' : '#58595B'}">${v ? fraccion(v) : ''}</td>`;
        }).join('')}</tr>`).join('')}</tbody>
      </table>
      <p class="nota" style="margin-bottom:14px">${estado.matriz === 'todas'
        ? 'Guías asociadas a cada rama, como eje principal o secundario. Es el mismo conteo del mapa de calor «Currículo en Pensamiento Computacional» del equipo.'
        : 'Guías cuyo eje principal es cada rama.'}</p>
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
    vista.aplicarEstudiante(estado.estudiante, estados);
    if (!estado.estudiante) return;
    const total = m.nodos.length, hechos = [...estados.values()].filter(e => e === 'completado').length;
    const disponibles = [...estados.values()].filter(e => e === 'disponible').length;
    const habs = new Set(m.nodos.filter(n => estado.completados.has(n.id)).flatMap(n => n.habilidades.map(h => h._clave)));
    $('#progreso-texto').textContent = `${hechos} de ${total} ${(m.proyecto.vocabulario?.nodo || 'nodo').toLowerCase()}s`;
    $('#progreso-detalle').textContent = `${habs.size} habilidades · ${disponibles} disponibles`;
    $('#progreso-barra').style.width = `${(100 * hechos / total).toFixed(1)}%`;
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
      estado.proyecto = proyecto;
      estado.completados = new Set(datos.completados || []);
      estado.rutasUsuario = datos.rutasUsuario || [];
      if (Modelo.FUENTES[datos.fuente]) estado.fuente = datos.fuente;
      estado.seleccion = estado.rutaActiva = estado.foco = null;
      estado.filtros = { herramientas: new Set(), rangos: new Set(), desde: 0, hasta: Infinity };
      guardar();
      reconstruir();
    };
    lector.readAsText(archivo);
  }

  async function importarGrafo(archivo) {
    let resultado;
    try {
      resultado = Grafo.aplicar(estado.proyecto, await Hoja.leer(archivo));
    } catch (e) {
      mostrarDialogo('No se pudo importar la hoja', `<p>${esc(e.message)}</p>`);
      return;
    }
    const errores = Modelo.validar(resultado.proyecto);
    if (errores.length) { mostrarDialogo('No se pudo importar la hoja', `<ul>${errores.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`); return; }
    estado.proyecto = resultado.proyecto;
    estado.fuente = 'equipo';
    guardar();
    reconstruir();
    const r = resultado.resumen;
    const lista = (titulo, xs) => (xs.length ? `<h4>${titulo} (${xs.length})</h4><p>${xs.map(esc).join(', ')}</p>` : '');
    mostrarDialogo('Grafo importado', `
      <p><b>${r.filas}</b> filas leídas de «${esc(archivo.name)}»: <b>${r.actualizadas}</b> ${r.actualizadas === 1 ? 'guía actualizada' : 'guías actualizadas'} y <b>${r.nuevas.length}</b> ${r.nuevas.length === 1 ? 'nueva' : 'nuevas'}.</p>
      ${lista('Cambian de eje principal', r.cambiosRama)}
      ${lista('Guías nuevas (sin título ni habilidades todavía)', r.nuevas)}
      ${lista('Ramas nuevas', r.ramasNuevas)}
      ${lista('Niveles nuevos', r.nivelesNuevos)}
      ${r.avisos.length ? `<h4>Avisos (${r.avisos.length})</h4><ul>${r.avisos.slice(0, 12).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <p class="nota">Las conexiones del árbol ahora siguen esta hoja. Revisa la pestaña Diagnóstico.</p>`);
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
    else if (accion === 'importar-grafo') $('#archivo-hoja').click();
    else if (accion === 'exportar-grafo') descargar(`${nombreBase()}-grafo.xlsx`, Hoja.xlsx(Grafo.filas(estado.proyecto), 'Grafo guías'));
    else if (accion === 'restablecer' && confirm('¿Volver a los datos de ejemplo? Se perderán los cambios, el progreso y las trayectorias propias.')) {
      estado.proyecto = copia(window.PROYECTO_PC);
      estado.completados = new Set(); estado.rutasUsuario = [];
      estado.seleccion = estado.rutaActiva = estado.foco = null;
      guardar();
      reconstruir();
    }
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
    $('#archivo-hoja').addEventListener('change', e => { if (e.target.files[0]) importarGrafo(e.target.files[0]); e.target.value = ''; });
    $('#dialogo-cerrar').addEventListener('click', () => $('#dialogo').close ? $('#dialogo').close() : $('#dialogo').removeAttribute('open'));
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
      if (e.key !== 'Escape' || e.target.matches('input')) return;
      seleccionar(null); enfocarRama(null);
      if (estado.rutaActiva) activarRuta(estado.rutaActiva);
    });
    let redimension;
    window.addEventListener('resize', () => { clearTimeout(redimension); redimension = setTimeout(() => vista.encuadrar(null, 300), 200); });
  }

  // ── Inicio ──────────────────────────────────────────────────────
  const guardado = leerGuardado();
  estado.proyecto = guardado ? guardado.proyecto : copia(window.PROYECTO_PC);
  estado.completados = new Set(guardado?.completados || []);
  estado.rutasUsuario = guardado?.rutasUsuario || [];
  if (Modelo.FUENTES[guardado?.fuente]) estado.fuente = guardado.fuente;
  enlazar();
  reconstruir();
})();
