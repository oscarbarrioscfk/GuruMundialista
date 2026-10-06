/*
 * Hoja: lectura de hojas de cálculo (.xlsx, .xltx, .xlsm, .csv) y escritura de
 * .xlsx sin librerías externas. Devuelve todas las hojas como [{ nombre, filas }],
 * donde filas es una matriz de textos. Usa DecompressionStream del navegador.
 */
const Hoja = (() => {
  const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  async function leer(archivo) {
    if (/\.(csv|txt|tsv)$/i.test(archivo.name)) return [{ nombre: archivo.name.replace(/\.[^.]+$/, ''), filas: leerCSV(await archivo.text()) }];
    return leerXLSX(new Uint8Array(await archivo.arrayBuffer()));
  }

  // ── CSV ─────────────────────────────────────────────────────────
  function leerCSV(texto) {
    texto = texto.replace(/^﻿/, '');
    const primera = texto.split(/\r?\n/)[0] || '';
    const sep = [';', '\t', ','].sort((a, b) => primera.split(b).length - primera.split(a).length)[0];
    const filas = [];
    let fila = [], celda = '', comillas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (comillas) {
        if (c === '"' && texto[i + 1] === '"') { celda += '"'; i++; }
        else if (c === '"') comillas = false;
        else celda += c;
      } else if (c === '"') comillas = true;
      else if (c === sep) { fila.push(celda); celda = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        fila.push(celda); filas.push(fila); fila = []; celda = '';
      } else celda += c;
    }
    if (celda || fila.length) { fila.push(celda); filas.push(fila); }
    return filas.map(f => f.map(x => x.trim()));
  }

  // ── ZIP ─────────────────────────────────────────────────────────
  async function entradasZip(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let fin = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { fin = i; break; }
    }
    if (fin < 0) throw new Error('El archivo no parece una hoja de cálculo de Excel (.xlsx).');
    const total = dv.getUint16(fin + 10, true);
    let p = dv.getUint32(fin + 16, true);
    const archivos = new Map();
    const dec = new TextDecoder();
    for (let k = 0; k < total; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const metodo = dv.getUint16(p + 10, true);
      const tam = dv.getUint32(p + 20, true);
      const lNombre = dv.getUint16(p + 28, true), lExtra = dv.getUint16(p + 30, true), lComent = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const nombre = dec.decode(bytes.subarray(p + 46, p + 46 + lNombre));
      archivos.set(nombre, { metodo, tam, local });
      p += 46 + lNombre + lExtra + lComent;
    }
    return {
      tiene: n => archivos.has(n),
      async texto(nombre) {
        const e = archivos.get(nombre);
        if (!e) return null;
        const ini = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true);
        const datos = bytes.subarray(ini, ini + e.tam);
        if (e.metodo === 0) return dec.decode(datos);
        if (e.metodo !== 8) throw new Error('Compresión no soportada en el archivo.');
        const flujo = new Blob([datos]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
        return dec.decode(await new Response(flujo).arrayBuffer());
      }
    };
  }

  // ── XLSX ────────────────────────────────────────────────────────
  const xml = t => new DOMParser().parseFromString(t, 'application/xml');
  const columna = ref => [...ref.replace(/\d+/g, '')].reduce((n, l) => n * 26 + l.charCodeAt(0) - 64, 0) - 1;
  // Excel guarda los números como texto; recorta los artefactos de coma flotante (6.1 → "6.0999999999").
  const numero = v => (/^-?\d+\.\d{9,}$/.test(v) ? String(parseFloat(Number(v).toPrecision(12))) : v);

  async function leerXLSX(bytes) {
    const zip = await entradasZip(bytes);
    const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
    let hojas = [{ nombre: 'Hoja1', ruta: 'xl/worksheets/sheet1.xml' }];
    const libro = await zip.texto('xl/workbook.xml');
    const rels = await zip.texto('xl/_rels/workbook.xml.rels');
    if (libro && rels) {
      const relaciones = [...xml(rels).getElementsByTagName('Relationship')];
      const encontradas = [...xml(libro).getElementsByTagName('sheet')].map(h => {
        const rid = h.getAttribute('r:id') || h.getAttributeNS(NS_R, 'id');
        const rel = relaciones.find(r => r.getAttribute('Id') === rid);
        if (!rel) return null;
        const destino = rel.getAttribute('Target').replace(/^\//, '');
        return { nombre: h.getAttribute('name'), ruta: destino.startsWith('xl/') ? destino : `xl/${destino}` };
      }).filter(Boolean);
      if (encontradas.length) hojas = encontradas;
    }
    const compartidas = [];
    const ss = await zip.texto('xl/sharedStrings.xml');
    if (ss) {
      [...xml(ss).getElementsByTagName('si')].forEach(si => {
        compartidas.push([...si.getElementsByTagName('t')].map(t => t.textContent).join(''));
      });
    }
    const resultado = [];
    for (const h of hojas) {
      const hojaXml = await zip.texto(h.ruta);
      if (hojaXml) resultado.push({ nombre: h.nombre, filas: filasDeHoja(hojaXml, compartidas) });
    }
    if (!resultado.length) throw new Error('No encontré ninguna hoja dentro del archivo.');
    return resultado;
  }

  function filasDeHoja(hojaXml, compartidas) {
    const filas = [];
    [...xml(hojaXml).getElementsByTagName('row')].forEach(r => {
      const i = (+r.getAttribute('r') || filas.length + 1) - 1;
      const fila = [];
      [...r.getElementsByTagName('c')].forEach((c, k) => {
        const j = c.getAttribute('r') ? columna(c.getAttribute('r')) : k;
        const t = c.getAttribute('t');
        const v = c.getElementsByTagName('v')[0]?.textContent ?? '';
        let valor;
        if (t === 's') valor = compartidas[+v] ?? '';
        else if (t === 'inlineStr') valor = [...c.getElementsByTagName('t')].map(x => x.textContent).join('');
        else if (t === 'b') valor = v === '1' ? 'VERDADERO' : 'FALSO';
        else valor = numero(v);
        fila[j] = String(valor).trim();
      });
      filas[i] = Array.from(fila, x => x ?? '');
    });
    return Array.from(filas, f => f || []);
  }

  // ── Escritura .xlsx (sin compresión) ────────────────────────────
  const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return datos => { let c = 0xFFFFFFFF; for (const b of datos) c = t[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  })();
  const escXml = s => String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const letra = j => { let s = ''; j++; while (j) { const r = (j - 1) % 26; s = String.fromCharCode(65 + r) + s; j = Math.floor((j - 1) / 26); } return s; };

  /** hojas: [{ nombre, filas }] (o una sola matriz de filas). */
  function xlsx(hojas, nombreHoja = 'Hoja1') {
    if (Array.isArray(hojas) && (!hojas.length || Array.isArray(hojas[0]))) hojas = [{ nombre: nombreHoja, filas: hojas }];
    const archivos = {};
    hojas.forEach((h, k) => { archivos[`xl/worksheets/sheet${k + 1}.xml`] = xmlHoja(h.filas); });
    return empaquetar(hojas, archivos);
  }

  function xmlHoja(filas) {
    const anchos = (filas[0] || []).map((_, j) => Math.min(60, Math.max(10, ...filas.map(f => String(f[j] ?? '').length + 2))));
    const hoja = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${anchos.length ? `<cols>${anchos.map((w, j) => `<col min="${j + 1}" max="${j + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : ''}<sheetData>${
  filas.map((f, i) => `<row r="${i + 1}">${f.map((v, j) => (v === '' || v === null || v === undefined ? ''
    : `<c r="${letra(j)}${i + 1}" t="inlineStr"${i === 0 ? ' s="1"' : ''}><is><t xml:space="preserve">${escXml(v)}</t></is></c>`)).join('')}</row>`).join('')
}</sheetData></worksheet>`;
    return hoja;
  }

  function empaquetar(hojas, hojasXml) {
    const nombres = new Set();
    const nombreUnico = n => { let x = escXml(String(n).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)) || 'Hoja'; let k = 2; while (nombres.has(x)) x = `${x.slice(0, 28)} ${k++}`; nombres.add(x); return x; };
    const archivos = {
      '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${hojas.map((_, k) => `<Override PartName="/xl/worksheets/sheet${k + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
      '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${hojas.map((h, k) => `<sheet name="${nombreUnico(h.nombre)}" sheetId="${k + 1}" r:id="rId${k + 1}"/>`).join('')}</sheets></workbook>`,
      'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hojas.map((_, k) => `<Relationship Id="rId${k + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${k + 1}.xml"/>`).join('')}<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
      'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4F2B63"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
      ...hojasXml
    };
    const enc = new TextEncoder();
    const partes = [], central = [];
    let desplazamiento = 0;
    Object.entries(archivos).forEach(([nombre, contenido]) => {
      const n = enc.encode(nombre), d = enc.encode(contenido), crc = CRC(d);
      const loc = new DataView(new ArrayBuffer(30));
      [[0, 0x04034b50, 4], [4, 20, 2], [8, 0, 2], [10, 0, 2], [12, 33, 2], [14, crc, 4], [18, d.length, 4], [22, d.length, 4], [26, n.length, 2]]
        .forEach(([o, v, t]) => (t === 4 ? loc.setUint32(o, v, true) : loc.setUint16(o, v, true)));
      partes.push(new Uint8Array(loc.buffer), n, d);
      const cen = new DataView(new ArrayBuffer(46));
      [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [14, 33, 2], [16, crc, 4], [20, d.length, 4], [24, d.length, 4], [28, n.length, 2], [42, desplazamiento, 4]]
        .forEach(([o, v, t]) => (t === 4 ? cen.setUint32(o, v, true) : cen.setUint16(o, v, true)));
      central.push(new Uint8Array(cen.buffer), n);
      desplazamiento += 30 + n.length + d.length;
    });
    const tamCentral = central.reduce((s, x) => s + x.length, 0);
    const fin = new DataView(new ArrayBuffer(22));
    const cuantos = Object.keys(archivos).length;
    [[0, 0x06054b50, 4], [8, cuantos, 2], [10, cuantos, 2], [12, tamCentral, 4], [16, desplazamiento, 4]]
      .forEach(([o, v, t]) => (t === 4 ? fin.setUint32(o, v, true) : fin.setUint16(o, v, true)));
    return new Blob([...partes, ...central, new Uint8Array(fin.buffer)], { type: TIPO_XLSX });
  }

  return { leer, leerCSV, xlsx };
})();
