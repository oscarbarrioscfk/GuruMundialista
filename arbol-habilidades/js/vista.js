/*
 * Vista: dibuja el árbol en SVG con D3. Dos disposiciones (radial y póster) que
 * comparten los mismos nodos, zoom semántico (lejos · medio · cerca) y capas de
 * resaltado (selección, filtros, foco de rama, trayectorias, modo estudiante).
 */
const Vista = (() => {
  const C = {
    ciruela: '#4F2B63', morado: '#662B80', azul: '#6898D0', texto: '#58595B',
    banda: '#F4F6FB', linea: '#D9DCE8', blanco: '#FFFFFF'
  };
  // Radial
  const HUECO = 30 * Math.PI / 180;     // hueco superior para las etiquetas de nivel
  const R0 = 230, DR = 74, R_RAIZ = 110;
  // Póster
  const COL_X0 = 320, COL_W = 238, TARJ_W = 214, FILA_Y0 = 78, FILA_MIN = 120;
  // Zoom semántico
  const UMBRAL_MEDIO = 0.55, UMBRAL_CERCA = 1.5;

  const ESTILO_SVG = `
    svg { font-family: 'Nunito Sans', 'Basic Sans', system-ui, sans-serif; }
    text { fill: ${C.texto}; }
    .fondo-anillo-par { fill: ${C.blanco}; }
    .fondo-anillo-impar { fill: ${C.banda}; }
    .anillo { fill: none; stroke: ${C.azul}; stroke-width: 1.2; stroke-dasharray: 1.5 5; stroke-linecap: round; opacity: .8; }
    .separador { stroke: ${C.linea}; stroke-width: 1; }
    .pildora text, .encabezado-col text { fill: #fff; font-weight: 900; text-anchor: middle; dominant-baseline: central; }
    .raiz-circulo { fill: ${C.ciruela}; }
    .raiz-aro { fill: none; stroke: ${C.azul}; stroke-width: 6; }
    .raiz text { fill: #fff; font-weight: 900; text-anchor: middle; font-size: 24px; }
    .tronco { fill: none; stroke-width: 5; stroke-linecap: round; opacity: .55; }
    .insignia-fondo { fill: #fff; stroke: ${C.azul}; stroke-width: 1.3; }
    .insignia-arco { fill: none; stroke: ${C.azul}; stroke-width: 4; stroke-linecap: round; }
    .insignia-icono { fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .insignia-icono .relleno { stroke: none; }
    .rotulo-rama { font-weight: 900; font-size: 38px; fill: #3A3A3C; }
    .rotulo-rama-conteo { font-size: 22px; font-weight: 800; }
    .rotulo-fila { font-weight: 900; font-size: 15px; fill: #3A3A3C; }
    .banda-fila { fill: ${C.banda}; }
    .divisor-fila { stroke: ${C.morado}; stroke-width: 1; opacity: .6; }
    .borde-col { fill: none; stroke-width: 1.4; stroke-dasharray: 1.5 4.5; stroke-linecap: round; }

    .arista { fill: none; stroke-width: 1.3; vector-effect: non-scaling-stroke; opacity: .34; transition: opacity .25s, stroke-width .25s; }
    .arista.tipo-indispensable { stroke-width: 1.6; opacity: .42; }
    .arista.tipo-deseable { stroke-dasharray: 6 5; opacity: .38; }
    .arista.tipo-habilidad { opacity: .3; }
    .fuente-ambas .arista.tipo-habilidad { stroke-dasharray: 1 4; stroke-linecap: round; stroke-width: 1.6; }
    .arista.tipo-proyecto { stroke-dasharray: 3 4; }
    .arista.atras { stroke: ${C.azul} !important; stroke-width: 1.4; opacity: .4 !important; }
    .arista.atras.directa { stroke-width: 3; opacity: .95 !important; }
    .arista.adelante { stroke: ${C.morado} !important; stroke-width: 1.4; opacity: .4 !important; }
    .arista.adelante.directa { stroke-width: 3; opacity: .95 !important; }
    .arista.contigua { opacity: .8; stroke-width: 2.2; }
    .hay-seleccion .arista:not(.atras):not(.adelante) { opacity: .05; }
    .hay-filtro .arista, .hay-foco .arista { opacity: .1; }
    .hay-foco .arista.en-foco { opacity: .5; }
    .hay-ruta .arista { opacity: .04 !important; }
    .arista.a-proyecto:not(.atras):not(.adelante) { opacity: 0 !important; }

    .ruta-linea { fill: none; stroke: ${C.morado}; stroke-width: 4; vector-effect: non-scaling-stroke; stroke-linecap: round; opacity: .9; stroke-dasharray: 14 10; animation: avanzar 1.4s linear infinite; }
    .ruta-sombra { fill: none; stroke: ${C.azul}; stroke-width: 13; vector-effect: non-scaling-stroke; stroke-linecap: round; opacity: .22; }
    @keyframes avanzar { to { stroke-dashoffset: -24; } }

    .nodo { cursor: pointer; transition: opacity .25s; }
    .nodo .cuerpo { fill: #fff; stroke: var(--c); stroke-width: 3.2; }
    .nodo.tipo-proyecto .cuerpo { fill: ${C.ciruela}; stroke: ${C.ciruela}; }
    .nodo .codigo { font-weight: 900; font-size: 9px; text-anchor: middle; dominant-baseline: central; fill: var(--c); pointer-events: none; }
    .nodo.tipo-proyecto .codigo { fill: #fff; }
    .nodo .halo { fill: none; stroke: transparent; stroke-width: 5; }
    .nodo:hover .halo, .nodo.seleccionado .halo { stroke: var(--c); opacity: .35; }
    .nodo.seleccionado .cuerpo { stroke-width: 4.5; }
    .nodo .marca-sec { stroke: #fff; stroke-width: 1.2; }
    .nodo .etiqueta { pointer-events: none; }
    .etiqueta .fondo-etq { fill: #fff; opacity: .88; }
    .etiqueta .t { font-size: 12px; font-weight: 900; text-anchor: middle; fill: #3A3A3C; }
    .etiqueta .h { font-size: 10px; text-anchor: middle; fill: ${C.texto}; }
    .etiqueta .h tspan.r { fill: var(--c); font-weight: 900; }
    .nodo .tarjeta { display: none; }
    .nodo .orden { display: none; }
    .nodo.en-ruta .orden { display: inline; }
    .orden circle { fill: ${C.morado}; stroke: #fff; stroke-width: 2; }
    .orden text { fill: #fff; font-size: 9px; font-weight: 900; text-anchor: middle; dominant-baseline: central; }

    .vista-radial.zoom-lejos .nodo .codigo { display: none; }

    .vista-poster .nodo .tarjeta { display: inline; }
    .tarjeta rect.caja { fill: #fff; stroke: ${C.linea}; stroke-width: 1; }
    .nodo:hover .tarjeta rect.caja, .nodo.seleccionado .tarjeta rect.caja { stroke: var(--c); stroke-width: 1.8; }
    .tarjeta rect.franja { fill: var(--c); }
    .tarjeta .t { font-size: 11px; font-weight: 900; fill: #3A3A3C; }
    .tarjeta .h { font-size: 9.5px; }
    .tarjeta .h tspan.r { fill: var(--c); font-weight: 900; }
    .tipo-proyecto .tarjeta rect.caja { fill: #EEE8F3; }

    .hay-seleccion .nodo:not(.seleccionado):not(.requisito):not(.desbloquea) { opacity: .16; }
    .hay-seleccion .nodo.requisito:not(.directo), .hay-seleccion .nodo.desbloquea:not(.directo) { opacity: .5; }
    .nodo.requisito .cuerpo { stroke: ${C.azul}; }
    .hay-filtro .nodo:not(.coincide) { opacity: .1; }
    .hay-foco .nodo:not(.en-foco) { opacity: .12; }
    .hay-ruta .nodo:not(.en-ruta) { opacity: .14; }

    .modo-estudiante .nodo.estado-bloqueado { opacity: .38; filter: grayscale(1); }
    .modo-estudiante .nodo.estado-completado .cuerpo { fill: var(--c); }
    .modo-estudiante .nodo.estado-completado .codigo { fill: #fff; }
    .modo-estudiante .nodo.estado-disponible .halo { stroke: ${C.azul}; opacity: .9; stroke-width: 4; animation: latir 1.6s ease-in-out infinite; }
    @keyframes latir { 50% { stroke-width: 9; opacity: .35; } }
  `;

  const polar = (ang, r) => ({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  const recortar = (t, n) => (t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t);
  function envolver(texto, max) {
    const lineas = [];
    let actual = '';
    String(texto).split(/\s+/).forEach(p => {
      if ((actual + ' ' + p).trim().length > max && actual) { lineas.push(actual); actual = p; }
      else actual = (actual + ' ' + p).trim();
    });
    if (actual) lineas.push(actual);
    return lineas;
  }
  const puntosRango = r => (r === null || r === undefined ? '' : '●'.repeat(r + 1) + '○'.repeat(2 - r));

  // ── Disposiciones ───────────────────────────────────────────────
  function disponerRadial(m) {
    const nN = m.proyecto.niveles.length;
    const celdas = d3.group(m.nodos, n => `${n._rama}|${n._nivel}`);
    // Cada rama recibe un ángulo proporcional a su densidad (con un mínimo),
    // para que las ramas con muchas guías no queden apretadas.
    const pesos = m.proyecto.ramas.map((r, i) => {
      const propios = m.nodos.filter(n => n._rama === i);
      const maxCelda = d3.max(propios, n => celdas.get(`${i}|${n._nivel}`).length) || 0;
      return 1 + 0.5 * maxCelda + 0.05 * propios.length;
    });
    const total = d3.sum(pesos), util = 2 * Math.PI - HUECO;
    const anchos = pesos.map(p => util * p / total);
    const inicios = anchos.map((_, i) => -Math.PI / 2 + HUECO / 2 + d3.sum(anchos.slice(0, i)));
    const angRama = i => inicios[i] + anchos[i] / 2;
    const anchoRama = i => anchos[i];
    const radio = j => R0 + j * DR;
    celdas.forEach(lista => {
      lista.sort((x, y) => Modelo.compararCodigos(x.codigo, y.codigo));
      const r = radio(lista[0]._nivel), centro = angRama(lista[0]._rama), k = lista.length;
      const a = anchoRama(lista[0]._rama);
      const paso = Math.min((a * 0.78) / Math.max(k - 1, 1), 62 / r);
      const apretado = paso * r < 46;
      lista.forEach((n, i) => {
        const ang = centro + (i - (k - 1) / 2) * paso;
        const dr = apretado && k > 2 ? (i % 2 ? 20 : -20) : 0;
        n._pos = n._pos || {};
        n._pos.radial = polar(ang, r + dr);
        n._ang = ang;
      });
    });
    const rMax = radio(nN - 1);
    return { anchoRama, angRama, radio, rMax, rRotulo: rMax + DR * 0.5 + 120 };
  }

  function lineasPoster(n) {
    return envolver(n.titulo, 30).slice(0, 2);
  }
  const inicioHabilidades = n => Math.max(28, 14 * lineasPoster(n).length + 8);
  function altoTarjeta(n) {
    const k = n.habilidades.length;
    return 18 + (k ? inicioHabilidades(n) + 13 * (k - 1) + 9 : Math.max(18, 14 * lineasPoster(n).length + 8));
  }

  function disponerPoster(m) {
    const { ramas, niveles } = m.proyecto;
    const filas = [];
    let y = FILA_Y0;
    ramas.forEach((r, i) => {
      const enFila = m.nodos.filter(n => n._rama === i);
      const porNivel = d3.group(enFila, n => n._nivel);
      let alto = FILA_MIN;
      porNivel.forEach(lista => {
        const total = d3.sum(lista, altoTarjeta) + 12 * (lista.length - 1) + 32;
        alto = Math.max(alto, total);
      });
      porNivel.forEach((lista, j) => {
        lista.sort((x, z) => Modelo.compararCodigos(x.codigo, z.codigo));
        let yy = y + 16;
        lista.forEach(n => {
          n._pos = n._pos || {};
          n._pos.poster = { x: COL_X0 + j * COL_W + 26, y: yy + 18 };
          yy += altoTarjeta(n) + 12;
        });
      });
      filas.push({ rama: r, i, y, alto });
      y += alto;
    });
    return { filas, ancho: COL_X0 + niveles.length * COL_W + 20, alto: y + 30 };
  }

  // ── Geometría de aristas ────────────────────────────────────────
  function caminoRadial(p1, p2) {
    const a1 = Math.atan2(p1.y, p1.x), a2 = Math.atan2(p2.y, p2.x);
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const r1 = Math.hypot(p1.x, p1.y), r2 = Math.hypot(p2.x, p2.y);
    const f = 1 - 0.5 * Math.min(1, Math.abs(d) / Math.PI);
    const c = polar(a1 + d / 2, ((r1 + r2) / 2) * f);
    return `M${p1.x},${p1.y}Q${c.x},${c.y} ${p2.x},${p2.y}`;
  }
  function caminoPoster(p1, p2) {
    if (p2.x - p1.x > 20) {
      const dx = Math.max(50, (p2.x - p1.x) / 2);
      return `M${p1.x},${p1.y}C${p1.x + dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`;
    }
    const dx = 70 + Math.abs(p2.y - p1.y) * 0.08;
    return `M${p1.x},${p1.y}C${p1.x - dx},${p1.y} ${p2.x - dx},${p2.y} ${p2.x},${p2.y}`;
  }

  function insignia(g, rama, radio) {
    g.append('circle').attr('class', 'insignia-fondo').attr('r', radio);
    g.append('path').attr('class', 'insignia-arco')
      .attr('d', d3.arc()({ innerRadius: radio + 2, outerRadius: radio + 2, startAngle: Math.PI * 0.95, endAngle: Math.PI * 1.75 }))
      .attr('transform', 'translate(-2,1)');
    const t = radio * 1.05;
    g.append('use').attr('href', `#ico-${rama.icono || 'generico'}`)
      .attr('class', 'insignia-icono').attr('x', -t / 2).attr('y', -t / 2).attr('width', t).attr('height', t)
      .attr('stroke', C.morado).attr('fill', C.morado);
  }

  // ── Fábrica ─────────────────────────────────────────────────────
  function crear(svgEl, eventos) {
    const svg = d3.select(svgEl);
    svg.append('defs').html(`<style>${ESTILO_SVG}</style>`);
    const mundo = svg.append('g').attr('class', 'mundo');
    const capaRadial = mundo.append('g').attr('class', 'fondo-radial');
    const capaPoster = mundo.append('g').attr('class', 'fondo-poster').style('opacity', 0).style('display', 'none');
    const capaAristas = mundo.append('g').attr('class', 'aristas');
    const capaRuta = mundo.append('g').attr('class', 'ruta');
    const capaNodos = mundo.append('g').attr('class', 'nodos');

    let m = null, vista = 'radial', geoR = null, geoP = null, nivelZoom = null;
    let selNodos = null, selAristas = null;

    const zoom = d3.zoom().scaleExtent([0.1, 5])
      .on('zoom', e => {
        mundo.attr('transform', e.transform);
        etiquetar(e.transform.k);
        const nivel = e.transform.k < UMBRAL_MEDIO ? 'lejos' : e.transform.k < UMBRAL_CERCA ? 'medio' : 'cerca';
        if (nivel !== nivelZoom) {
          nivelZoom = nivel;
          svg.classed('zoom-lejos', nivel === 'lejos').classed('zoom-medio', nivel === 'medio').classed('zoom-cerca', nivel === 'cerca');
          eventos.onNivelZoom && eventos.onNivelZoom(nivel);
        }
      });
    svg.call(zoom).on('dblclick.zoom', null);
    svg.on('click', e => { if (!e.target.closest('.nodo')) eventos.onFondo && eventos.onFondo(); });
    svg.classed('vista-radial', true);

    const pos = n => n._pos[vista];
    const camino = (p1, p2) => (vista === 'radial' ? caminoRadial(p1, p2) : caminoPoster(p1, p2));

    function dibujar(modelo) {
      m = modelo;
      svg.classed('fuente-equipo fuente-habilidades fuente-ambas', false).classed(`fuente-${m.fuente}`, true);
      geoR = disponerRadial(m);
      geoP = disponerPoster(m);
      dibujarFondoRadial();
      dibujarFondoPoster();
      dibujarAristas();
      dibujarNodos();
      capaRuta.selectAll('*').remove();
      etiquetar();
    }

    function dibujarFondoRadial() {
      capaRadial.selectAll('*').remove();
      const { niveles, ramas } = m.proyecto;
      const anillo = d3.arc().startAngle(0).endAngle(2 * Math.PI);
      niveles.forEach((nv, j) => {
        capaRadial.append('path').attr('class', j % 2 ? 'fondo-anillo-impar' : 'fondo-anillo-par')
          .attr('d', anillo({ innerRadius: geoR.radio(j) - DR / 2, outerRadius: geoR.radio(j) + DR / 2 }));
      });
      niveles.forEach((nv, j) => capaRadial.append('circle').attr('class', 'anillo').attr('r', geoR.radio(j)));
      const rIn = geoR.radio(0) - DR / 2, rOut = geoR.rMax + DR / 2;
      ramas.forEach((r, i) => {
        const ang = geoR.angRama(i) - geoR.anchoRama(i) / 2;
        const p1 = polar(ang, rIn), p2 = polar(ang, rOut);
        capaRadial.append('line').attr('class', 'separador').attr('x1', p1.x).attr('y1', p1.y).attr('x2', p2.x).attr('y2', p2.y);
      });
      const angFin = geoR.angRama(ramas.length - 1) + geoR.anchoRama(ramas.length - 1) / 2;
      const ultimo = polar(angFin, rIn), fin = polar(angFin, rOut);
      capaRadial.append('line').attr('class', 'separador').attr('x1', ultimo.x).attr('y1', ultimo.y).attr('x2', fin.x).attr('y2', fin.y);

      // Troncos: de la raíz a cada rama
      ramas.forEach((r, i) => {
        const ang = geoR.angRama(i);
        const p2 = polar(ang, rIn + 6), c = polar(ang - 0.15, R_RAIZ + 50);
        const p1 = polar(ang, R_RAIZ - 4);
        capaRadial.append('path').attr('class', 'tronco').attr('stroke', r.color)
          .attr('d', `M${p1.x},${p1.y}Q${c.x},${c.y} ${p2.x},${p2.y}`);
      });

      // Píldoras de nivel en el hueco superior (alternan morado / azul como el póster)
      niveles.forEach((nv, j) => {
        const g = capaRadial.append('g').attr('class', 'pildora').attr('transform', `translate(0,${-geoR.radio(j)})`);
        const w = Math.max(48, nv.corto.length * 15 + 22);
        g.append('rect').attr('x', -w / 2).attr('y', -16).attr('width', w).attr('height', 32).attr('rx', 5)
          .attr('fill', j % 2 ? C.morado : C.azul);
        g.append('text').attr('font-size', 19).text(nv.corto);
      });

      // Rótulos de rama
      ramas.forEach((r, i) => {
        const ang = geoR.angRama(i), p = polar(ang, geoR.rRotulo);
        const g = capaRadial.append('g').attr('class', 'rotulo').attr('transform', `translate(${p.x},${p.y})`)
          .style('cursor', 'pointer').on('click', e => { e.stopPropagation(); eventos.onRama && eventos.onRama(r.id); });
        insignia(g, r, 58);
        const derecha = Math.cos(ang) >= -0.15;
        const izquierda = Math.cos(ang) < -0.15;
        const arriba = Math.sin(ang) < -0.8, abajo = Math.sin(ang) > 0.8;
        const lineas = envolver(r.corto, 12);
        const tx = arriba || abajo ? 0 : derecha ? 80 : -80;
        const ty = arriba ? -100 - lineas.length * 40 : abajo ? 110 : -(lineas.length - 1) * 20 - 4;
        const anchor = arriba || abajo ? 'middle' : izquierda ? 'end' : 'start';
        const t = g.append('text').attr('class', 'rotulo-rama').attr('text-anchor', anchor).attr('x', tx).attr('y', ty);
        lineas.forEach((l, k) => t.append('tspan').attr('x', tx).attr('dy', k ? 40 : 0).text(l));
        const cuantos = m.nodos.filter(n => n._rama === i && n.tipo !== 'proyecto').length;
        g.append('text').attr('class', 'rotulo-rama-conteo').attr('text-anchor', anchor).attr('x', tx)
          .attr('y', ty + (lineas.length - 1) * 40 + 32).attr('fill', r.color)
          .text(`${cuantos} ${cuantos === 1 ? 'guía' : 'guías'}`);
      });

      // Raíz
      const raiz = capaRadial.append('g').attr('class', 'raiz');
      raiz.append('circle').attr('class', 'raiz-aro').attr('r', R_RAIZ + 6);
      raiz.append('circle').attr('class', 'raiz-circulo').attr('r', R_RAIZ);
      const lineas = envolver(m.proyecto.vocabulario?.raiz || m.proyecto.titulo, 13);
      const t = raiz.append('text').attr('y', -(lineas.length - 1) * 14 + 8);
      lineas.forEach((l, k) => t.append('tspan').attr('x', 0).attr('dy', k ? 28 : 0).text(l));
    }

    function dibujarFondoPoster() {
      capaPoster.selectAll('*').remove();
      const { niveles } = m.proyecto;
      geoP.filas.forEach(f => {
        if (f.i % 2) capaPoster.append('rect').attr('class', 'banda-fila').attr('x', 0).attr('y', f.y).attr('width', geoP.ancho).attr('height', f.alto);
        capaPoster.append('line').attr('class', 'divisor-fila').attr('x1', 20).attr('x2', COL_X0 - 30).attr('y1', f.y).attr('y2', f.y);
        const g = capaPoster.append('g').attr('transform', `translate(58,${f.y + Math.min(f.alto / 2, 70)})`)
          .style('cursor', 'pointer').on('click', e => { e.stopPropagation(); eventos.onRama && eventos.onRama(f.rama.id); });
        insignia(g, f.rama, 24);
        const lineas = envolver(f.rama.nombre, 20).slice(0, 4);
        const t = g.append('text').attr('class', 'rotulo-fila').attr('x', 38).attr('y', -(lineas.length - 1) * 9 + 5);
        lineas.forEach((l, k) => t.append('tspan').attr('x', 38).attr('dy', k ? 18 : 0).text(l));
      });
      capaPoster.append('line').attr('class', 'divisor-fila').attr('x1', 20).attr('x2', COL_X0 - 30)
        .attr('y1', geoP.alto - 30).attr('y2', geoP.alto - 30);
      niveles.forEach((nv, j) => {
        const x = COL_X0 + j * COL_W, color = j % 2 ? C.morado : C.azul;
        capaPoster.append('rect').attr('class', 'borde-col').attr('stroke', color)
          .attr('x', x + 4).attr('y', 38).attr('width', COL_W - 14).attr('height', geoP.alto - 60).attr('rx', 6);
        const g = capaPoster.append('g').attr('class', 'encabezado-col').attr('transform', `translate(${x + COL_W / 2 - 3},38)`);
        g.append('rect').attr('x', -62).attr('y', -18).attr('width', 124).attr('height', 36).attr('fill', color);
        g.append('text').attr('font-size', 17).text(nv.nombre);
      });
    }

    function dibujarAristas() {
      selAristas = capaAristas.selectAll('path.arista').data(m.aristas, a => a.id).join('path')
        .attr('class', a => `arista tipo-${a.tipo}${a.aProyecto ? ' a-proyecto' : ''}`)
        .attr('stroke', a => m.ramaPorId.get(m.porId.get(a.origen).rama).color)
        .attr('d', a => camino(pos(m.porId.get(a.origen)), pos(m.porId.get(a.destino))));
    }

    function dibujarNodos() {
      capaNodos.selectAll('*').remove();
      selNodos = capaNodos.selectAll('g.nodo').data(m.nodos, n => n.id).join('g')
        .attr('class', n => `nodo tipo-${n.tipo}`)
        .attr('data-id', n => n.id)
        .attr('style', n => `--c:${m.ramaPorId.get(n.rama).color}`)
        .attr('transform', n => `translate(${pos(n).x},${pos(n).y})`)
        .on('click', (e, n) => { e.stopPropagation(); eventos.onNodo && eventos.onNodo(n.id); })
        .on('mouseenter', (e, n) => { resaltarContiguas(n.id, true); eventos.onHover && eventos.onHover(n, e); })
        .on('mousemove', (e, n) => eventos.onHover && eventos.onHover(n, e))
        .on('mouseleave', (e, n) => { resaltarContiguas(n.id, false); eventos.onHover && eventos.onHover(null, e); });

      selNodos.each(function (n) {
        const g = d3.select(this);
        // Tarjeta (vista póster)
        const tj = g.append('g').attr('class', 'tarjeta');
        const alto = altoTarjeta(n);
        tj.append('rect').attr('class', 'caja').attr('x', -18).attr('y', -18).attr('width', TARJ_W).attr('height', alto).attr('rx', 8);
        tj.append('rect').attr('class', 'franja').attr('x', -18).attr('y', -18).attr('width', 4).attr('height', alto).attr('rx', 2);
        const lt = lineasPoster(n);
        const tt = tj.append('text').attr('class', 't').attr('x', 22).attr('y', -3);
        lt.forEach((l, k) => tt.append('tspan').attr('x', 22).attr('dy', k ? 14 : 0).text(l));
        n.habilidades.forEach((hab, k) => {
          const th = tj.append('text').attr('class', 'h').attr('x', -6).attr('y', inicioHabilidades(n) + 13 * k);
          if (hab.rango !== null && hab.rango !== undefined) th.append('tspan').attr('class', 'r').text(puntosRango(hab.rango) + ' ');
          else th.append('tspan').text('• ');
          th.append('tspan').text(recortar(hab.nombre, 34));
        });

        g.append('circle').attr('class', 'halo').attr('r', 21);
        if (n.tipo === 'proyecto') {
          const r = 17;
          g.append('path').attr('class', 'cuerpo')
            .attr('d', d3.range(6).map(k => polar(-Math.PI / 2 + k * Math.PI / 3, r)).map((p, k) => `${k ? 'L' : 'M'}${p.x},${p.y}`).join('') + 'Z');
        } else {
          g.append('circle').attr('class', 'cuerpo').attr('r', 15);
        }
        g.append('text').attr('class', 'codigo').text(n.codigo);

        n.ramasSecundarias.forEach((rid, k) => {
          const p = polar(-Math.PI / 4 + k * 0.62, 17);
          g.append('circle').attr('class', 'marca-sec').attr('cx', p.x).attr('cy', p.y).attr('r', 4.2)
            .attr('fill', m.ramaPorId.get(rid).color);
        });

        // Etiquetas de la vista radial: tamaño fijo en pantalla (se reescalan con el
        // zoom) y se muestran solo si caben sin chocar con otras.
        const etq = g.append('g').attr('class', 'etiqueta').attr('display', 'none');
        const corta = etq.append('g').attr('class', 'etq-corta');
        const tituloCorto = recortar(n.titulo, 22);
        corta.append('rect').attr('class', 'fondo-etq').attr('rx', 4)
          .attr('x', -tituloCorto.length * 3.4 - 4).attr('y', 0).attr('width', tituloCorto.length * 6.8 + 8).attr('height', 17);
        corta.append('text').attr('class', 't').attr('y', 13).text(tituloCorto);
        n._etqCorta = { w: tituloCorto.length * 6.8 + 8, h: 17 };

        const larga = etq.append('g').attr('class', 'etq-larga');
        const lineas = envolver(n.titulo, 22).slice(0, 3);
        const habs = n.habilidades.map(hab => ({ hab, texto: recortar(hab.nombre, 30) }));
        const ancho = Math.max(...lineas.map(l => l.length * 6.8), ...habs.map(x => x.texto.length * 5.5 + 26), 40) + 10;
        const altoEtq = 6 + lineas.length * 14 + habs.length * 12.5 + 2;
        larga.append('rect').attr('class', 'fondo-etq').attr('rx', 5).attr('x', -ancho / 2).attr('y', 0).attr("width", ancho).attr("height", altoEtq);
        const t = larga.append('text').attr('class', 't').attr('y', 15);
        lineas.forEach((l, k) => t.append('tspan').attr('x', 0).attr('dy', k ? 14 : 0).text(l));
        habs.forEach((x, k) => {
          const th = larga.append('text').attr('class', 'h').attr('y', 15 + lineas.length * 14 + k * 12.5);
          if (x.hab.rango !== null && x.hab.rango !== undefined) th.append('tspan').attr('class', 'r').text(puntosRango(x.hab.rango) + ' ');
          th.append('tspan').text(x.texto);
        });
        n._etqLarga = { w: ancho, h: altoEtq };

        const o = g.append('g').attr('class', 'orden').attr('transform', 'translate(-15,-15)');
        o.append('circle').attr('r', 9);
        o.append('text');
      });
    }

    // Coloca etiquetas por prioridad evitando solapes (en coordenadas de pantalla).
    let prioridad = new Map();   // id → etiqueta forzada ('larga' | 'corta')
    function etiquetar(k = d3.zoomTransform(svgEl).k) {
      if (!selNodos) return;
      const nivel = k < UMBRAL_MEDIO ? 'lejos' : k < UMBRAL_CERCA ? 'medio' : 'cerca';
      if (vista !== 'radial') { selNodos.select('.etiqueta').attr('display', 'none'); return; }
      const ocupado = m.nodos.map(n => {
        const p = n._pos.radial, r = 17 * k;
        return { x: p.x * k - r, y: p.y * k - r, w: 2 * r, h: 2 * r, id: n.id };
      });
      const choca = c => ocupado.some(o => o.id !== c.id && c.x < o.x + o.w && c.x + c.w > o.x && c.y < o.y + o.h && c.y + c.h > o.y);
      const orden = [...m.nodos].sort((a, b) => (prioridad.has(b.id) - prioridad.has(a.id))
        || (a.tipo === 'proyecto') - (b.tipo === 'proyecto') || b.habilidades.length - a.habilidades.length);
      const eleccion = new Map();
      orden.forEach(n => {
        const forzar = prioridad.get(n.id) === 'larga';
        const preferida = prioridad.has(n.id);
        if (nivel === 'lejos' && !preferida) return;
        const opciones = forzar ? ['larga'] : nivel === 'cerca' ? ['larga', 'corta'] : ['corta'];
        const p = n._pos.radial, y0 = p.y * k + 18 * k;
        for (const op of opciones) {
          const d = op === 'larga' ? n._etqLarga : n._etqCorta;
          const caja = { x: p.x * k - d.w / 2, y: y0, w: d.w, h: d.h, id: n.id };
          if (forzar || !choca(caja)) { ocupado.push({ ...caja, id: null }); eleccion.set(n.id, op); break; }
        }
      });
      selNodos.select('.etiqueta')
        .attr('display', n => (eleccion.has(n.id) ? null : 'none'))
        .attr('transform', `translate(0,18) scale(${1 / k})`);
      selNodos.select('.etq-larga').attr('display', n => (eleccion.get(n.id) === 'larga' ? null : 'none'));
      selNodos.select('.etq-corta').attr('display', n => (eleccion.get(n.id) === 'corta' ? null : 'none'));
    }
    function priorizar(ids, tipo = 'corta') { prioridad = new Map(ids.map(id => [id, tipo])); etiquetar(); }

    function resaltarContiguas(id, activo) {
      selAristas.classed('contigua', a => activo && (a.origen === id || a.destino === id));
    }

    function cambiarVista(nueva) {
      if (!m || nueva === vista) return;
      const anterior = vista;
      vista = nueva;
      svg.classed('vista-radial', vista === 'radial').classed('vista-poster', vista === 'poster');
      const dur = 850;
      const mostrar = vista === 'radial' ? capaRadial : capaPoster;
      const ocultar = vista === 'radial' ? capaPoster : capaRadial;
      ocultar.transition().duration(dur / 2).style('opacity', 0).on('end', () => ocultar.style('display', 'none'));
      mostrar.style('display', null).transition().delay(dur / 3).duration(dur / 2).style('opacity', 1);
      selNodos.transition().duration(dur).ease(d3.easeCubicInOut)
        .attr('transform', n => `translate(${pos(n).x},${pos(n).y})`);
      selAristas.transition().duration(dur).ease(d3.easeCubicInOut)
        .attrTween('d', a => {
          const o = m.porId.get(a.origen), d = m.porId.get(a.destino);
          const io = d3.interpolateObject(o._pos[anterior], o._pos[vista]);
          const id = d3.interpolateObject(d._pos[anterior], d._pos[vista]);
          return t => camino(io(t), id(t));
        });
      selNodos.select('.etiqueta').attr('display', 'none');
      redibujarRuta();
      encuadrar(null, dur);
      setTimeout(() => etiquetar(), dur + 20);
    }

    // ── Estados de resaltado ─────────────────────────────────────
    function seleccionar(id) {
      if (!id) {
        svg.classed('hay-seleccion', false);
        selNodos.classed('seleccionado requisito desbloquea directo', false);
        selAristas.classed('atras adelante directa', false);
        priorizar(rutaActual || []);
        return;
      }
      const atras = Modelo.recorrer(m, id, 'atras'), adelante = Modelo.recorrer(m, id, 'adelante');
      svg.classed('hay-seleccion', true);
      selNodos.classed('seleccionado', n => n.id === id)
        .classed('requisito', n => atras.nodos.has(n.id))
        .classed('desbloquea', n => adelante.nodos.has(n.id));
      const directas = new Set([...m.entrantes.get(id), ...m.salientes.get(id)].map(a => a.id));
      const vecinos = new Set([...m.entrantes.get(id).map(a => a.origen), ...m.salientes.get(id).map(a => a.destino)]);
      selNodos.classed('directo', n => vecinos.has(n.id));
      selAristas.classed('atras', a => atras.aristas.has(a.id)).classed('adelante', a => adelante.aristas.has(a.id))
        .classed('directa', a => directas.has(a.id));
      selAristas.filter('.directa').raise();
      capaNodos.select(`g.nodo[data-id="${CSS.escape(id)}"]`).raise();
      priorizar([id], 'larga');
    }

    function filtrar(coincide) {
      svg.classed('hay-filtro', !!coincide);
      selNodos.classed('coincide', n => !!coincide && coincide.has(n.id));
    }

    function enfocarRama(ramaId) {
      svg.classed('hay-foco', !!ramaId);
      const en = n => n.rama === ramaId || n.ramasSecundarias.includes(ramaId);
      selNodos.classed('en-foco', n => !!ramaId && en(n));
      selAristas.classed('en-foco', a => !!ramaId && en(m.porId.get(a.origen)) && en(m.porId.get(a.destino)));
      if (ramaId) {
        const ids = m.nodos.filter(en).map(n => n.id);
        encuadrar(ids, 750, vista === 'radial' ? [{ x: 0, y: 0 }] : []);
      }
    }

    let rutaActual = null;
    function mostrarRuta(ids) {
      rutaActual = ids && ids.length ? ids.filter(id => m.porId.has(id)) : null;
      svg.classed('hay-ruta', !!rutaActual);
      selNodos.classed('en-ruta', n => !!rutaActual && rutaActual.includes(n.id));
      selNodos.select('.orden text').text(n => (rutaActual ? rutaActual.indexOf(n.id) + 1 : ''));
      redibujarRuta();
      priorizar(rutaActual || []);
    }
    function redibujarRuta() {
      capaRuta.selectAll('*').remove();
      if (!rutaActual || rutaActual.length < 2) return;
      const d = rutaActual.slice(1).map((id, i) => {
        const p1 = pos(m.porId.get(rutaActual[i])), p2 = pos(m.porId.get(id));
        return camino(p1, p2);
      }).join('');
      capaRuta.append('path').attr('class', 'ruta-sombra').attr('d', d);
      capaRuta.append('path').attr('class', 'ruta-linea').attr('d', d);
    }

    function aplicarEstudiante(activo, estados) {
      svg.classed('modo-estudiante', activo);
      selNodos.classed('estado-completado', n => activo && estados.get(n.id) === 'completado')
        .classed('estado-disponible', n => activo && estados.get(n.id) === 'disponible')
        .classed('estado-bloqueado', n => activo && estados.get(n.id) === 'bloqueado');
    }

    // ── Cámara ───────────────────────────────────────────────────
    function limitesContenido() {
      if (vista === 'radial') {
        const rx = geoR.rRotulo + 380, ry = geoR.rRotulo + 190;
        return [[-rx, -ry], [rx, ry]];
      }
      return [[0, 0], [geoP.ancho, geoP.alto]];
    }
    function encuadrar(ids, dur = 650, extra = []) {
      if (!m) return;
      let lim;
      if (ids && ids.length) {
        const pts = ids.map(id => pos(m.porId.get(id))).concat(extra);
        const margen = vista === 'radial' ? 90 : 240;
        lim = [[d3.min(pts, p => p.x) - margen, d3.min(pts, p => p.y) - margen],
          [d3.max(pts, p => p.x) + margen, d3.max(pts, p => p.y) + margen]];
      } else lim = limitesContenido();
      const { width, height } = svgEl.getBoundingClientRect();
      const w = lim[1][0] - lim[0][0], h = lim[1][1] - lim[0][1];
      const k = Math.min(4, 0.94 * Math.min(width / w, height / h));
      const t = d3.zoomIdentity.translate(width / 2, height / 2).scale(k)
        .translate(-(lim[0][0] + w / 2), -(lim[0][1] + h / 2));
      svg.transition().duration(dur).call(zoom.transform, t);
    }
    function centrarEn(id, k) {
      const p = pos(m.porId.get(id));
      const { width, height } = svgEl.getBoundingClientRect();
      const escala = Math.max(k || 1.8, d3.zoomTransform(svgEl).k);
      const t = d3.zoomIdentity.translate(width / 2, height / 2).scale(escala).translate(-p.x, -p.y);
      svg.transition().duration(650).call(zoom.transform, t);
    }
    const acercar = f => svg.transition().duration(300).call(zoom.scaleBy, f);

    // ── Exportación ──────────────────────────────────────────────
    function exportarSVG() {
      const lim = limitesContenido();
      const w = lim[1][0] - lim[0][0], h = lim[1][1] - lim[0][1];
      const copia = svgEl.cloneNode(true);
      copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      copia.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      copia.setAttribute('viewBox', `${lim[0][0]} ${lim[0][1]} ${w} ${h}`);
      copia.setAttribute('width', Math.round(w));
      copia.setAttribute('height', Math.round(h));
      copia.classList.remove('zoom-lejos', 'zoom-cerca');
      copia.classList.add('zoom-medio');
      copia.querySelector('.mundo').removeAttribute('transform');
      copia.querySelectorAll('.fondo-radial, .fondo-poster').forEach(g => {
        if (g.style.display === 'none') g.remove();
      });
      // Los íconos viven fuera del SVG: se copian sus símbolos para que el archivo sea autónomo.
      const defs = copia.querySelector('defs');
      document.querySelectorAll('body > svg symbol').forEach(s => defs.appendChild(s.cloneNode(true)));
      const fondo = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      Object.entries({ x: lim[0][0], y: lim[0][1], width: w, height: h, fill: '#fff' }).forEach(([k, v]) => fondo.setAttribute(k, v));
      copia.insertBefore(fondo, copia.querySelector('.mundo'));
      return { texto: new XMLSerializer().serializeToString(copia), ancho: w, alto: h };
    }

    return {
      dibujar, cambiarVista, seleccionar, filtrar, enfocarRama, mostrarRuta, aplicarEstudiante,
      encuadrar, centrarEn, acercar, exportarSVG,
      get vista() { return vista; }
    };
  }

  return { crear, puntosRango, envolver };
})();
