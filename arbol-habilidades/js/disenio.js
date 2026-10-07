/*
 * Diseño: interfaz del modo edición. Ficha editable de cada nodo y pestaña
 * «Estructura» (proyecto, ramas y niveles). Los cambios pasan por ctx.cambiar,
 * que guarda el historial para deshacer.
 */
const Disenio = (() => {
  let ctx = null;
  const ICONO_NOMBRE = {
    algoritmos: 'Algoritmos', programacion: 'Programación', datos: 'Datos', fisica: 'Computación física', modelacion: 'Modelación',
    ia: 'IA', seguridad: 'Seguridad', equidad: 'Personas', etica: 'Balanza',
    liderazgo: 'Bandera', plan: 'Documento', ensenanza: 'Tablero', desarrollo: 'Escalera', inclusion: 'Grupo',
    terciaria: 'Birrete', impacto: 'Gráfica', genero: 'Género', generico: 'Genérico'
  };
  const PERFIL_NOMBRE = {
    programador: 'Programador(a)', innovador: 'Innovador(a)', ciudadano: 'Ciudadano(a)', directivo: 'Directivo(a)',
    plan: 'Docente con plan', docente: 'Docente', mentor: 'Mentor(a)', diversidad: 'Grupo diverso', joven: 'Joven con birrete',
    estudiante: 'Estudiante', nina: 'Niña', generico: 'Genérico'
  };
  const listaTexto = v => String(v || '').split(/[,;]+/).map(x => x.trim()).filter(Boolean);

  // ── Ficha de un nodo ────────────────────────────────────────────
  function formulario(cont, id) {
    const { esc } = ctx;
    const p = ctx.proyecto;
    const n = p.nodos.find(x => x.id === id);
    if (!n) { cont.innerHTML = ''; return; }
    const vocab = p.vocabulario || {};
    const opciones = (lista, valor, etiqueta) => lista.map(x => `<option value="${esc(x.id)}" ${x.id === valor ? 'selected' : ''}>${esc(etiqueta(x))}</option>`).join('');
    const nivelIdx = new Map(p.niveles.map((x, i) => [x.id, i]));
    const antes = x => nivelIdx.get(x.nivel) < nivelIdx.get(n.nivel)
      || (x.nivel === n.nivel && Modelo.compararCodigos(x.codigo, n.codigo) < 0);
    const candidatos = p.nodos.filter(x => x.id !== n.id && antes(x));
    const dependientes = p.nodos.filter(x => (x.prerrequisitos || []).includes(n.id) || (x.deseables || []).includes(n.id));
    const chipsDep = tipo => {
      const ids = (tipo === 'deseable' ? n.deseables : n.prerrequisitos) || [];
      return ids.map(d => {
        const o = p.nodos.find(x => x.id === d);
        return `<span class="chip-dep ${tipo}"><b>${esc(d)}</b> ${esc(o ? o.titulo : '¿no existe?')}<button type="button" data-quitar-dep="${esc(d)}" data-tipo="${tipo}" aria-label="Quitar ${esc(d)}">×</button></span>`;
      }).join('') || '<span class="nota">Ninguna</span>';
    };
    const selectorDep = tipo => `<div class="agregar-dep">
        <select data-agregar-dep="${tipo}" aria-label="Agregar ${tipo}">
          <option value="">+ Agregar…</option>
          ${candidatos.filter(x => !(n.prerrequisitos || []).includes(x.id) && !(n.deseables || []).includes(x.id))
            .map(x => `<option value="${esc(x.id)}">${esc(x.codigo)} · ${esc(x.titulo)}</option>`).join('')}
        </select></div>`;

    cont.innerHTML = `
      <form class="formulario" data-nodo="${esc(n.id)}" onsubmit="return false">
        <div class="form-cabecera">
          <span class="insignia-edicion">✎ Editando</span>
          <button type="button" class="enlace" data-accion-form="ver">Ver ficha</button>
        </div>
        <div class="dos-col">
          <label>Código<input data-campo="codigo" value="${esc(n.codigo)}" required></label>
          <label>Tipo<select data-campo="tipo">
            <option value="guia" ${n.tipo !== 'proyecto' ? 'selected' : ''}>${esc(vocab.nodo || 'Guía')}</option>
            <option value="proyecto" ${n.tipo === 'proyecto' ? 'selected' : ''}>Proyecto integrador</option>
          </select></label>
        </div>
        <label>Título<input data-campo="titulo" value="${esc(n.titulo)}"></label>
        <div class="dos-col">
          <label>${esc(vocab.nivel || 'Nivel')}<select data-campo="nivel">${opciones(p.niveles, n.nivel, x => x.nombre)}</select></label>
          <label>Rama principal<select data-campo="rama">${opciones(p.ramas, n.rama, x => x.corto)}</select></label>
        </div>
        ${p.aprendizaje?.niveles?.length ? `
        <div class="dos-col">
          <label>${esc(p.aprendizaje.nombre || 'Nivel de aprendizaje')}<select data-campo="aprendizaje">
            <option value="">Sin asignar</option>
            ${opciones(p.aprendizaje.niveles, n.aprendizaje, x => x.nombre)}
          </select></label>
          <label>Por qué en este nivel<textarea data-campo="motivoAprendizaje" rows="2">${esc(n.motivoAprendizaje || '')}</textarea></label>
        </div>` : ''}
        <fieldset><legend>Ramas secundarias</legend><div class="chips">
          ${p.ramas.filter(r => r.id !== n.rama).map(r => `<button type="button" class="chip" data-secundaria="${esc(r.id)}" aria-pressed="${(n.ramasSecundarias || []).includes(r.id)}" style="--c:${r.color}">${esc(r.corto)}</button>`).join('')}
        </div></fieldset>
        <label>Descripción <small>(opcional)</small><textarea data-campo="descripcion" rows="4" placeholder="Qué describe este nodo">${esc(n.descripcion || '')}</textarea></label>
        <label>Para avanzar <small>(opcional: qué debe cambiar para llegar al siguiente ${esc((vocab.nivel || 'nivel').toLowerCase())})</small><textarea data-campo="avance" rows="2">${esc(n.avance || '')}</textarea></label>
        <label>Herramientas <small>(separadas por comas)</small><input data-campo="herramientas" value="${esc((n.herramientas || []).join(', '))}" placeholder="Scratch, micro:bit…"></label>

        <fieldset><legend>${esc(vocab.habilidad ? Editor.plural(vocab.habilidad) : 'Habilidades')}</legend>
          <div class="tabla-hab">
            ${(n.habilidades || []).map((h, i) => `
              <div class="fila-hab">
                <input data-hab="${i}" data-campo-hab="nombre" value="${esc(h.nombre)}" aria-label="Habilidad ${i + 1}" placeholder="Nombre de la habilidad">
                <select data-hab="${i}" data-campo-hab="rango" aria-label="Nivel de dominio">
                  <option value="" ${h.rango === null || h.rango === undefined ? 'selected' : ''}>—</option>
                  ${[0, 1, 2].map(r => `<option value="${r}" ${h.rango === r ? 'selected' : ''}>N${r}</option>`).join('')}
                </select>
                <input data-hab="${i}" data-campo-hab="clave" value="${esc(h.clave || '')}" aria-label="Clave" placeholder="clave" title="Misma clave en varias guías = misma habilidad que se profundiza">
                <button type="button" class="quitar" data-quitar-hab="${i}" aria-label="Quitar habilidad">×</button>
              </div>`).join('') || '<p class="nota">Todavía no tiene habilidades.</p>'}
          </div>
          <button type="button" class="enlace" data-accion-form="agregar-hab">+ Añadir habilidad</button>
        </fieldset>

        <fieldset><legend>Requiere · indispensables</legend><div class="deps">${chipsDep('indispensable')}</div>${selectorDep('indispensable')}</fieldset>
        <fieldset><legend>Requiere · deseables</legend><div class="deps">${chipsDep('deseable')}</div>${selectorDep('deseable')}</fieldset>
        <p class="nota">Solo se pueden elegir nodos anteriores. También puedes arrastrar en el árbol de una guía a otra (con Mayús para deseable).</p>
        ${dependientes.length ? `<p class="nota"><b>Dependen de esta:</b> ${dependientes.map(x => esc(x.codigo)).join(', ')}</p>` : ''}
        <div class="botonera-form">
          <button type="button" class="boton boton-peligro" data-accion-form="eliminar">Eliminar ${esc((vocab.nodo || 'nodo').toLowerCase())}</button>
        </div>
      </form>`;
  }

  function enlazarFormulario(cont) {
    const nodoActual = () => ctx.proyecto.nodos.find(x => x.id === cont.querySelector('form')?.dataset.nodo);

    cont.addEventListener('change', e => {
      const form = e.target.closest('form.formulario');
      if (!form) return;
      const id = form.dataset.nodo, el = e.target;
      if (el.dataset.campo) {
        const campo = el.dataset.campo, valor = el.value;
        if (campo === 'codigo') {
          ctx.cambiar(p => {
            const error = Editor.renombrarNodo(p, id, valor, { rutas: ctx.estado.rutasUsuario, completados: ctx.estado.completados });
            if (error) { ctx.aviso(error, 'error'); return false; }
            ctx.estado.seleccion = valor.trim();
          }, { formulario: true });
        } else if (campo === 'nivel') {
          ctx.cambiar(p => {
            const n = p.nodos.find(x => x.id === id);
            const viejo = n.nivel;
            n.nivel = valor;
            // Si el código empieza por el nivel anterior, se renumera en el nuevo.
            if (String(n.codigo).startsWith(`${viejo}.`)) {
              const nuevo = Editor.siguienteCodigo(p, valor);
              Editor.renombrarNodo(p, n.id, nuevo, { rutas: ctx.estado.rutasUsuario, completados: ctx.estado.completados });
              ctx.estado.seleccion = nuevo;
              ctx.aviso(`Movida al nivel ${valor}: ahora es ${nuevo}.`);
            }
          }, { formulario: true });
        } else {
          ctx.cambiar(p => {
            const n = p.nodos.find(x => x.id === id);
            if (campo === 'herramientas') n.herramientas = listaTexto(valor);
            else if (campo === 'titulo') n.titulo = valor.trim() || n.titulo;
            else if (['descripcion', 'avance', 'aprendizaje', 'motivoAprendizaje'].includes(campo)) { if (valor.trim()) n[campo] = valor.trim(); else delete n[campo]; }
            else if (campo === 'rama') { n.rama = valor; n.ramasSecundarias = (n.ramasSecundarias || []).filter(r => r !== valor); }
            else n[campo] = valor;
          }, { formulario: campo === 'rama' || campo === 'tipo' });
        }
        return;
      }
      if (el.dataset.campoHab) {
        const i = +el.dataset.hab, campo = el.dataset.campoHab;
        ctx.cambiar(p => {
          const h = p.nodos.find(x => x.id === id).habilidades[i];
          if (campo === 'rango') h.rango = el.value === '' ? null : +el.value;
          else if (campo === 'clave') h.clave = el.value.trim() || null;
          else h.nombre = el.value.trim() || h.nombre;
        }, { formulario: false });
        return;
      }
      if (el.dataset.agregarDep && el.value) {
        const tipo = el.dataset.agregarDep, origen = el.value;
        ctx.cambiar(p => { Editor.conectar(p, origen, id, tipo); }, { formulario: true });
      }
    });

    cont.addEventListener('click', e => {
      const form = e.target.closest('form.formulario');
      if (!form) return;
      const id = form.dataset.nodo;
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.secundaria) {
        const r = b.dataset.secundaria;
        ctx.cambiar(p => {
          const n = p.nodos.find(x => x.id === id);
          const s = new Set(n.ramasSecundarias || []);
          s.has(r) ? s.delete(r) : s.add(r);
          n.ramasSecundarias = p.ramas.map(x => x.id).filter(x => s.has(x));
        }, { formulario: true });
      } else if (b.dataset.quitarHab !== undefined) {
        ctx.cambiar(p => { p.nodos.find(x => x.id === id).habilidades.splice(+b.dataset.quitarHab, 1); }, { formulario: true });
      } else if (b.dataset.quitarDep) {
        ctx.cambiar(p => { Editor.desconectar(p, b.dataset.quitarDep, id); }, { formulario: true });
      } else if (b.dataset.accionForm === 'agregar-hab') {
        ctx.cambiar(p => { p.nodos.find(x => x.id === id).habilidades.push({ nombre: 'Nueva habilidad', rango: 0, clave: null }); }, { formulario: true });
        const filas = cont.querySelectorAll('[data-campo-hab="nombre"]');
        if (filas.length) { filas[filas.length - 1].focus(); filas[filas.length - 1].select(); }
      } else if (b.dataset.accionForm === 'eliminar') {
        const n = nodoActual();
        if (!confirm(`¿Eliminar ${n.codigo} «${n.titulo}»? Se quitará también de los prerrequisitos y trayectorias.`)) return;
        ctx.cambiar(p => { Editor.eliminarNodo(p, id, { rutas: ctx.estado.rutasUsuario, completados: ctx.estado.completados }); ctx.estado.seleccion = null; }, { formulario: true });
        ctx.aviso(`${n.codigo} eliminada. Puedes deshacer con Ctrl+Z.`);
      } else if (b.dataset.accionForm === 'ver') {
        ctx.verFicha(id);
      }
    });
  }

  // ── Pestaña Estructura ──────────────────────────────────────────
  function estructura(cont) {
    const { esc } = ctx;
    const p = ctx.proyecto, vocab = p.vocabulario || {};
    const usoRama = id => p.nodos.filter(n => n.rama === id).length;
    const usoNivel = id => p.nodos.filter(n => n.nivel === id).length;
    cont.innerHTML = `
      <form class="formulario" data-estructura onsubmit="return false">
        <h4>Proyecto</h4>
        <label>Título<input data-proy="titulo" value="${esc(p.titulo)}"></label>
        <label>Subtítulo<input data-proy="subtitulo" value="${esc(p.subtitulo || '')}"></label>
        <label>Autoría<input data-proy="autoria" value="${esc(p.autoria || '')}"></label>
        <div class="dos-col">
          <label>Tipo<select data-proy="tipo">
            <option value="libro" ${p.tipo !== 'curso' ? 'selected' : ''}>Libro de texto</option>
            <option value="curso" ${p.tipo === 'curso' ? 'selected' : ''}>Curso de FP</option>
          </select></label>
          <label>Texto de la raíz<input data-vocab="raiz" value="${esc(vocab.raiz || '')}"></label>
        </div>
        <div class="dos-col">
          <label>Cada nivel se llama<input data-vocab="nivel" value="${esc(vocab.nivel || '')}" placeholder="Grado, Módulo…"></label>
          <label>Cada nodo se llama<input data-vocab="nodo" value="${esc(vocab.nodo || '')}" placeholder="Guía, Unidad…"></label>
        </div>
        <div class="dos-col">
          <label>Cada habilidad se llama<input data-vocab="habilidad" value="${esc(vocab.habilidad || '')}" placeholder="Habilidad, Criterio…"></label>
          <label>El modo de progreso se llama<input data-vocab="modo" value="${esc(vocab.modo || '')}" placeholder="Modo estudiante"></label>
        </div>

        <h4>Categorías y perfiles (${(p.categorias || []).length})</h4>
        <p class="nota">Agrupan ramas en el árbol. Cada categoría termina en un perfil: la persona hacia la que crece el árbol.</p>
        <div class="lista-edicion">
          ${(p.categorias || []).map((c, i) => `
            <div class="fila-rama fila-categoria" data-cat-id="${esc(c.id)}" style="background:${esc(c.tinte || '#F4F6FB')}">
              <input type="color" data-cat-campo="color" value="${esc(c.color)}" aria-label="Color de ${esc(c.nombre)}">
              <input data-cat-campo="nombre" value="${esc(c.nombre)}" aria-label="Nombre de la categoría" title="Nombre de la categoría">
              <span class="acciones-fila">
                <button type="button" data-mover-cat="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
                <button type="button" data-mover-cat="1" ${i === p.categorias.length - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button>
                <button type="button" data-eliminar-cat aria-label="Eliminar">×</button>
              </span>
              <span class="sub">
                <label>Perfil<input data-cat-campo="perfil" value="${esc(c.perfil || '')}" placeholder="p. ej. Programador(a)"></label>
                <label>Avatar<select data-cat-campo="icono">${Editor.PERFILES.map(ic => `<option value="${ic}" ${ic === c.icono ? 'selected' : ''}>${PERFIL_NOMBRE[ic]}</option>`).join('')}</select></label>
                <label>Fondo<input type="color" data-cat-campo="tinte" value="${esc(c.tinte || '#F4F6FB')}"></label>
              </span>
            </div>`).join('')}
        </div>
        <button type="button" class="enlace" data-accion-est="agregar-cat">+ Añadir categoría</button>

        <h4>Ramas (${p.ramas.length})</h4>
        <div class="lista-edicion">
          ${p.ramas.map((r, i) => `
            <div class="fila-rama" data-rama-id="${esc(r.id)}">
              <input type="color" data-rama-campo="color" value="${esc(r.color)}" aria-label="Color de ${esc(r.corto)}">
              <input data-rama-campo="nombre" value="${esc(r.nombre)}" aria-label="Nombre completo" title="Nombre completo">
              <span class="sub">
                <label>Corto<input data-rama-campo="corto" value="${esc(r.corto)}" aria-label="Nombre corto" title="Nombre corto (en el árbol)"></label>
                <label>Ícono<select data-rama-campo="icono" aria-label="Ícono">${Editor.ICONOS.map(ic => `<option value="${ic}" ${ic === r.icono ? 'selected' : ''}>${ICONO_NOMBRE[ic]}</option>`).join('')}</select></label>
                ${(p.categorias || []).length ? `<label class="ancho">Categoría<select data-rama-campo="categoria"><option value="">— Sin categoría —</option>${p.categorias.map(c => `<option value="${esc(c.id)}" ${c.id === r.categoria ? 'selected' : ''}>${esc(c.perfil || c.nombre)} · ${esc(c.nombre)}</option>`).join('')}</select></label>` : ''}
              </span>
              <span class="acciones-fila">
                <button type="button" data-mover-rama="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
                <button type="button" data-mover-rama="1" ${i === p.ramas.length - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button>
                <button type="button" data-eliminar-rama title="${usoRama(r.id) ? `Rama principal de ${usoRama(r.id)} nodos` : 'Eliminar'}" aria-label="Eliminar">×</button>
              </span>
            </div>`).join('')}
        </div>
        <button type="button" class="enlace" data-accion-est="agregar-rama">+ Añadir rama</button>

        <h4>${esc(vocab.nivel ? Editor.plural(vocab.nivel) : 'Niveles')} (${p.niveles.length})</h4>
        <div class="lista-edicion">
          ${p.niveles.map((nv, i) => `
            <div class="fila-nivel" data-nivel-id="${esc(nv.id)}">
              <span class="id-nivel" title="Prefijo de los códigos">${esc(nv.id)}.</span>
              <input data-nivel-campo="nombre" value="${esc(nv.nombre)}" aria-label="Nombre">
              <input data-nivel-campo="corto" value="${esc(nv.corto)}" aria-label="Corto" class="corto">
              <span class="uso">${usoNivel(nv.id)}</span>
              <span class="acciones-fila">
                <button type="button" data-mover-nivel="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
                <button type="button" data-mover-nivel="1" ${i === p.niveles.length - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button>
                <button type="button" data-eliminar-nivel aria-label="Eliminar">×</button>
              </span>
            </div>`).join('')}
        </div>
        <button type="button" class="enlace" data-accion-est="agregar-nivel">+ Añadir ${esc((vocab.nivel || 'nivel').toLowerCase())}</button>
        <p class="nota">Los ${esc(Editor.plural((vocab.nivel || 'nivel').toLowerCase()))} se ordenan del centro hacia afuera en el árbol radial. El número antes del punto es el prefijo de los códigos (p. ej. ${esc(p.niveles[0]?.id || '1')}.1).</p>

        <h4>Niveles de aprendizaje${p.aprendizaje ? ` (${p.aprendizaje.niveles.length})` : ''}</h4>
        ${p.aprendizaje ? `
          <div class="lista-edicion">
            ${p.aprendizaje.niveles.map(nv => `
              <div class="fila-aprendizaje" data-apr-id="${esc(nv.id)}">
                <div class="dos-col">
                  <input data-apr-campo="nombre" value="${esc(nv.nombre)}" aria-label="Nombre">
                  <input data-apr-campo="bloque" value="${esc(nv.bloque || '')}" aria-label="Momento" placeholder="Momento (p. ej. Lo básico)">
                </div>
                <textarea data-apr-campo="descripcion" rows="2" aria-label="Qué hacen los estudiantes">${esc(nv.descripcion || '')}</textarea>
                <span class="uso">${p.nodos.filter(n => n.aprendizaje === nv.id).length} nodos</span>
              </div>`).join('')}
          </div>
          <p class="nota">${p.nodos.filter(n => !p.aprendizaje.niveles.some(x => x.id === n.aprendizaje)).length} nodos sin nivel asignado. Asígnalo en la ficha de cada uno (✎ Editar) o en la columna «Nivel de aprendizaje» de la hoja de cálculo.</p>
          <button type="button" class="enlace borrar" data-accion-est="quitar-aprendizaje">Quitar los niveles de aprendizaje</button>`
        : `<p class="nota">Una segunda forma de ordenar los anillos: por lo que ya saben los estudiantes y no por el ${esc((vocab.nivel || 'nivel').toLowerCase())} en que se ubica cada nodo.</p>
          <button type="button" class="enlace" data-accion-est="crear-aprendizaje">+ Añadir niveles de aprendizaje</button>`}
      </form>`;
  }

  function enlazarEstructura(cont) {
    cont.addEventListener('change', e => {
      const el = e.target;
      if (el.dataset.proy) {
        ctx.cambiar(p => { p[el.dataset.proy] = el.value.trim(); }, { estructura: false });
      } else if (el.dataset.vocab) {
        ctx.cambiar(p => { p.vocabulario = { ...(p.vocabulario || {}), [el.dataset.vocab]: el.value.trim() }; }, { estructura: false });
      } else if (el.dataset.ramaCampo === 'categoria') {
        const id = el.closest('[data-rama-id]').dataset.ramaId;
        ctx.cambiar(p => { const r = p.ramas.find(x => x.id === id); if (el.value) r.categoria = el.value; else delete r.categoria; }, { estructura: false });
      } else if (el.dataset.ramaCampo) {
        const id = el.closest('[data-rama-id]').dataset.ramaId;
        ctx.cambiar(p => { const r = p.ramas.find(x => x.id === id); r[el.dataset.ramaCampo] = el.value.trim() || r[el.dataset.ramaCampo]; }, { estructura: false });
      } else if (el.dataset.catCampo) {
        const id = el.closest('[data-cat-id]').dataset.catId;
        ctx.cambiar(p => { const c = p.categorias.find(x => x.id === id); c[el.dataset.catCampo] = el.value.trim() || c[el.dataset.catCampo]; }, { estructura: el.dataset.catCampo === 'tinte' });
      } else if (el.dataset.aprCampo) {
        const id = el.closest('[data-apr-id]').dataset.aprId;
        ctx.cambiar(p => { const nv = p.aprendizaje.niveles.find(x => x.id === id); nv[el.dataset.aprCampo] = el.value.trim() || (el.dataset.aprCampo === 'nombre' ? nv.nombre : ''); }, { estructura: false });
      } else if (el.dataset.nivelCampo) {
        const id = el.closest('[data-nivel-id]').dataset.nivelId;
        ctx.cambiar(p => { const nv = p.niveles.find(x => x.id === id); nv[el.dataset.nivelCampo] = el.value.trim() || nv[el.dataset.nivelCampo]; }, { estructura: false });
      }
    });
    cont.addEventListener('input', e => {
      if (e.target.type === 'color') {
        // Vista previa inmediata del color sin pasar por el historial.
        const id = e.target.closest('[data-rama-id]').dataset.ramaId;
        document.querySelectorAll(`#lista-ramas [data-rama="${CSS.escape(id)}"] use`).forEach(u => { u.setAttribute('stroke', e.target.value); });
      }
    });
    cont.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const rama = b.closest('[data-rama-id]')?.dataset.ramaId, nivel = b.closest('[data-nivel-id]')?.dataset.nivelId;
      const cat = b.closest('[data-cat-id]')?.dataset.catId;
      if (b.dataset.accionEst === 'agregar-cat') { ctx.cambiar(p => { Editor.agregarCategoria(p); }); return; }
      if (b.dataset.moverCat) { ctx.cambiar(p => { Editor.mover(p.categorias, cat, +b.dataset.moverCat); }); return; }
      if (b.hasAttribute('data-eliminar-cat')) {
        if (!confirm('¿Eliminar esta categoría? Sus ramas quedan sin categoría (no se borran).')) return;
        ctx.cambiar(p => { Editor.eliminarCategoria(p, cat); }); return;
      }
      if (b.dataset.accionEst === 'crear-aprendizaje') { ctx.cambiar(p => { Editor.crearAprendizaje(p); }); ctx.aviso('Niveles de aprendizaje creados. Asígnalos en la ficha de cada nodo.'); return; }
      if (b.dataset.accionEst === 'quitar-aprendizaje') {
        if (!confirm('¿Quitar los niveles de aprendizaje y su asignación en todos los nodos? Puedes deshacer con Ctrl+Z.')) return;
        ctx.cambiar(p => { Editor.quitarAprendizaje(p); }); return;
      }
      if (b.dataset.accionEst === 'agregar-rama') ctx.cambiar(p => { Editor.agregarRama(p); });
      else if (b.dataset.accionEst === 'agregar-nivel') ctx.cambiar(p => { Editor.agregarNivel(p); });
      else if (b.dataset.moverRama) ctx.cambiar(p => { Editor.mover(p.ramas, rama, +b.dataset.moverRama); });
      else if (b.dataset.moverNivel) ctx.cambiar(p => { Editor.mover(p.niveles, nivel, +b.dataset.moverNivel); });
      else if (b.hasAttribute('data-eliminar-rama')) ctx.cambiar(p => { const err = Editor.eliminarRama(p, rama); if (err) { ctx.aviso(err, 'error'); return false; } });
      else if (b.hasAttribute('data-eliminar-nivel')) ctx.cambiar(p => { const err = Editor.eliminarNivel(p, nivel); if (err) { ctx.aviso(err, 'error'); return false; } });
    });
  }

  function iniciar(contexto) {
    ctx = contexto;
    enlazarFormulario(document.querySelector('#detalle'));
    enlazarEstructura(document.querySelector('#estructura'));
  }

  return { iniciar, formulario, estructura };
})();
