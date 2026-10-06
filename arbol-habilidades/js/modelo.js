/*
 * Modelo del árbol de habilidades: a partir de un proyecto (JSON plano) deriva
 * conexiones, recorridos, estados del modo estudiante y alertas de diseño.
 * No toca el DOM.
 */
const Modelo = (() => {
  const RANGOS = ['N0', 'N1', 'N2'];

  const HERRAMIENTAS = [
    { id: 'beebot', nombre: 'Bee-bot', re: /bee-?bot/i },
    { id: 'scratchjr', nombre: 'ScratchJr', re: /scratch\s*jr/i },
    { id: 'scratch', nombre: 'Scratch', re: /scratch(?!\s*jr)/i },
    { id: 'microbit', nombre: 'micro:bit', re: /makecode|micro:?bit/i },
    { id: 'python', nombre: 'Python', re: /python/i },
    { id: 'hojas', nombre: 'Hojas de cálculo', re: /excel|hojas? de c[aá]lculo/i },
    { id: 'phet', nombre: 'PhET', re: /phet/i },
    { id: 'tinkercad', nombre: 'Tinkercad', re: /t[h]?inkercad/i },
    { id: 'phyphox', nombre: 'Phyphox', re: /phyphox|physics tracker/i }
  ];

  function normalizar(texto) {
    return String(texto).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function claveDe(habilidad) {
    return habilidad.clave || normalizar(habilidad.nombre);
  }

  /** Comprueba la forma mínima de un proyecto importado. Devuelve una lista de errores. */
  function validar(p) {
    const errores = [];
    if (!p || typeof p !== 'object') return ['El archivo no contiene un proyecto.'];
    ['niveles', 'ramas', 'nodos'].forEach(k => {
      if (!Array.isArray(p[k]) || !p[k].length) errores.push(`Falta la lista "${k}".`);
    });
    if (errores.length) return errores;
    const niveles = new Set(p.niveles.map(n => n.id));
    const ramas = new Set(p.ramas.map(r => r.id));
    const ids = new Set();
    p.nodos.forEach(n => {
      if (!n.id) errores.push('Hay un nodo sin "id".');
      else if (ids.has(n.id)) errores.push(`El id "${n.id}" está repetido.`);
      ids.add(n.id);
      if (!niveles.has(n.nivel)) errores.push(`El nodo "${n.id}" usa un nivel inexistente (${n.nivel}).`);
      if (!ramas.has(n.rama)) errores.push(`El nodo "${n.id}" usa una rama inexistente (${n.rama}).`);
    });
    return errores.slice(0, 8);
  }

  /** Construye la estructura de trabajo a partir del proyecto. */
  function preparar(proyecto) {
    const nivelIdx = new Map(proyecto.niveles.map((n, i) => [n.id, i]));
    const ramaIdx = new Map(proyecto.ramas.map((r, i) => [r.id, i]));
    const ramaPorId = new Map(proyecto.ramas.map(r => [r.id, r]));

    const nodos = proyecto.nodos.map(n => {
      const habilidades = (n.habilidades || []).map(hab => ({ ...hab, _clave: claveDe(hab) }));
      const texto = [n.titulo, ...habilidades.map(x => x.nombre)].join(' ');
      const rangos = habilidades.map(x => x.rango).filter(r => r !== null && r !== undefined);
      return {
        ...n,
        habilidades,
        ramasSecundarias: (n.ramasSecundarias || []).filter(r => ramaIdx.has(r) && r !== n.rama),
        prerrequisitos: n.prerrequisitos || [],
        _nivel: nivelIdx.get(n.nivel),
        _rama: ramaIdx.get(n.rama),
        _herramientas: HERRAMIENTAS.filter(t => t.re.test(texto)).map(t => t.id),
        _rangoMax: rangos.length ? Math.max(...rangos) : null,
        _busqueda: normalizar(`${n.codigo} ${texto}`)
      };
    });
    const porId = new Map(nodos.map(n => [n.id, n]));

    // 1) Cadenas de mejora: cada aparición de una habilidad se conecta con sus
    //    apariciones más recientes de mayor rango: las del nivel anterior más
    //    cercano o, dentro del mismo nivel, las guías previas de rango menor.
    const apariciones = new Map();
    nodos.forEach(n => n.habilidades.forEach(hab => {
      if (!apariciones.has(hab._clave)) apariciones.set(hab._clave, []);
      apariciones.get(hab._clave).push({ nodo: n, hab });
    }));
    const rangoDe = o => o.hab.rango ?? -1;

    const aristas = new Map();
    const agregar = (origen, destino, tipo, etiqueta) => {
      if (origen === destino) return;
      const k = `${origen}→${destino}`;
      if (!aristas.has(k)) aristas.set(k, { id: k, origen, destino, tipo, etiquetas: [] });
      const a = aristas.get(k);
      if (tipo === 'manual') a.tipo = 'manual';
      if (etiqueta && !a.etiquetas.includes(etiqueta)) a.etiquetas.push(etiqueta);
    };

    apariciones.forEach(lista => {
      lista.forEach(actual => {
        const mismoNivel = lista.filter(o => o.nodo._nivel === actual.nodo._nivel
          && rangoDe(o) < rangoDe(actual) && compararCodigos(o.nodo.codigo, actual.nodo.codigo) < 0);
        let candidatas = mismoNivel;
        if (!candidatas.length) {
          const previas = lista.filter(o => o.nodo._nivel < actual.nodo._nivel);
          if (!previas.length) return;
          const nivelPrevio = Math.max(...previas.map(o => o.nodo._nivel));
          candidatas = previas.filter(o => o.nodo._nivel === nivelPrevio);
        }
        const mejor = Math.max(...candidatas.map(rangoDe));
        candidatas.filter(o => rangoDe(o) === mejor)
          .forEach(o => agregar(o.nodo.id, actual.nodo.id, 'habilidad', actual.hab.nombre));
      });
    });

    // 2) Proyectos integradores: reciben todas las guías de su nivel.
    nodos.filter(n => n.tipo === 'proyecto').forEach(p => {
      nodos.filter(n => n.tipo !== 'proyecto' && n._nivel === p._nivel)
        .forEach(n => agregar(n.id, p.id, 'proyecto'));
    });

    // 3) Prerrequisitos definidos a mano por el diseñador.
    nodos.forEach(n => n.prerrequisitos.forEach(pid => {
      if (porId.has(pid)) agregar(pid, n.id, 'manual');
    }));

    const listaAristas = [...aristas.values()];
    const entrantes = new Map(nodos.map(n => [n.id, []]));
    const salientes = new Map(nodos.map(n => [n.id, []]));
    listaAristas.forEach(a => {
      entrantes.get(a.destino).push(a);
      salientes.get(a.origen).push(a);
    });

    return {
      proyecto, nodos, porId, aristas: listaAristas, entrantes, salientes,
      nivelIdx, ramaIdx, ramaPorId, apariciones
    };
  }

  function compararCodigos(a, b) {
    const pa = a.split('.'), pb = b.split('.');
    return (pa[0] === 'T' ? -1 : +pa[0]) - (pb[0] === 'T' ? -1 : +pb[0]) || (+pa[1] || 0) - (+pb[1] || 0);
  }

  /** Recorre el grafo hacia atrás (requisitos) o hacia adelante (lo que desbloquea). */
  function recorrer(m, id, sentido) {
    const mapa = sentido === 'atras' ? m.entrantes : m.salientes;
    const lado = sentido === 'atras' ? 'origen' : 'destino';
    const vistos = new Set(), aristas = new Set(), cola = [id];
    while (cola.length) {
      const actual = cola.shift();
      (mapa.get(actual) || []).forEach(a => {
        aristas.add(a.id);
        const otro = a[lado];
        if (!vistos.has(otro)) { vistos.add(otro); cola.push(otro); }
      });
    }
    return { nodos: vistos, aristas };
  }

  /** Estado de un nodo en modo estudiante. */
  function estado(m, id, completados) {
    if (completados.has(id)) return 'completado';
    const req = m.entrantes.get(id) || [];
    return req.every(a => completados.has(a.origen)) ? 'disponible' : 'bloqueado';
  }

  /** Alertas de diseño pedagógico. */
  function diagnosticar(m) {
    const alertas = [];
    const { proyecto, nodos } = m;

    // Equilibrio por rama y nivel
    const matriz = proyecto.ramas.map(() => proyecto.niveles.map(() => 0));
    nodos.forEach(n => {
      if (n.tipo === 'proyecto') return;
      matriz[n._rama][n._nivel] += 1;
      n.ramasSecundarias.forEach(r => { matriz[m.ramaIdx.get(r)][n._nivel] += 0.5; });
    });
    proyecto.ramas.forEach((r, i) => {
      const propias = nodos.filter(n => n.tipo !== 'proyecto' && n._rama === i).length;
      if (propias <= 1) {
        alertas.push({
          tipo: 'rama', gravedad: 'alta', rama: r.id,
          texto: `La rama «${r.corto}» tiene ${propias === 0 ? 'ninguna guía propia' : 'solo una guía propia'}.`,
          detalle: 'Aparece sobre todo como eje secundario o en proyectos. ¿Necesita guías dedicadas?'
        });
      }
    });

    // Huérfanos
    nodos.filter(n => n.tipo !== 'proyecto').forEach(n => {
      const entra = m.entrantes.get(n.id).filter(a => a.tipo !== 'proyecto').length;
      const sale = m.salientes.get(n.id).filter(a => a.tipo !== 'proyecto').length;
      if (!entra && !sale) {
        alertas.push({
          tipo: 'huerfano', gravedad: 'media', nodo: n.id,
          texto: `${n.codigo} ${n.titulo} no se conecta con otras guías.`,
          detalle: 'Ninguna habilidad continúa ni viene de otro nivel.'
        });
      }
    });

    // Saltos y retrocesos de rango en cada cadena de mejora
    m.apariciones.forEach(lista => {
      const conRango = lista.filter(o => o.hab.rango !== null && o.hab.rango !== undefined)
        .sort((a, b) => a.nodo._nivel - b.nodo._nivel || compararCodigos(a.nodo.codigo, b.nodo.codigo));
      let maximo = null, desde = null;
      const previoMismoNombre = new Map();
      conRango.forEach(o => {
        const r = o.hab.rango;
        const nombre = normalizar(o.hab.nombre);
        const previo = previoMismoNombre.get(nombre);
        if (maximo === null && r === 2) {
          alertas.push({
            tipo: 'salto', gravedad: 'media', nodo: o.nodo.id,
            texto: `«${o.hab.nombre}» aparece directamente en N2 (${o.nodo.codigo}).`,
            detalle: 'No hay un N0 o N1 previo de esta habilidad.'
          });
        } else if (maximo !== null && r - maximo >= 2) {
          alertas.push({
            tipo: 'salto', gravedad: 'media', nodo: o.nodo.id,
            texto: `«${o.hab.nombre}» salta de ${RANGOS[maximo]} a ${RANGOS[r]} (${desde.codigo} → ${o.nodo.codigo}).`,
            detalle: 'Falta un paso intermedio N1.'
          });
        } else if (previo && r < previo.rango && o.nodo._nivel > previo.nodo._nivel) {
          alertas.push({
            tipo: 'retroceso', gravedad: 'baja', nodo: o.nodo.id,
            texto: `«${o.hab.nombre}» baja de ${RANGOS[previo.rango]} a ${RANGOS[r]} (${previo.nodo.codigo} → ${o.nodo.codigo}).`,
            detalle: 'Puede ser un repaso intencional o un error de etiquetado.'
          });
        }
        if (maximo === null || r > maximo) { maximo = r; desde = o.nodo; }
        if (!previo || r > previo.rango) previoMismoNombre.set(nombre, { rango: r, nodo: o.nodo });
      });
    });

    // Ciclos (solo posibles con prerrequisitos manuales)
    const ciclo = buscarCiclo(m);
    if (ciclo) {
      alertas.push({
        tipo: 'ciclo', gravedad: 'alta', nodo: ciclo[0],
        texto: `Hay un ciclo de prerrequisitos: ${ciclo.join(' → ')}.`,
        detalle: 'Ninguna guía del ciclo podría desbloquearse.'
      });
    }

    const orden = { alta: 0, media: 1, baja: 2 };
    alertas.sort((a, b) => orden[a.gravedad] - orden[b.gravedad]);
    return { alertas, matriz };
  }

  function buscarCiclo(m) {
    const color = new Map(), pila = [];
    let encontrado = null;
    const visitar = id => {
      if (encontrado) return;
      color.set(id, 1); pila.push(id);
      for (const a of m.salientes.get(id)) {
        if (color.get(a.destino) === 1) {
          encontrado = [...pila.slice(pila.indexOf(a.destino)), a.destino];
          return;
        }
        if (!color.get(a.destino)) visitar(a.destino);
        if (encontrado) return;
      }
      color.set(id, 2); pila.pop();
    };
    m.nodos.forEach(n => { if (!color.get(n.id)) visitar(n.id); });
    return encontrado;
  }

  return { RANGOS, HERRAMIENTAS, normalizar, validar, preparar, recorrer, estado, diagnosticar, compararCodigos };
})();
