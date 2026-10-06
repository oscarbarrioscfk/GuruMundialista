/*
 * Compartir: empaqueta un proyecto (y la vista elegida) dentro de un enlace.
 * El JSON se comprime con deflate y se codifica en base64url; va en el «#» del
 * enlace, así que no se envía a ningún servidor.
 */
const Compartir = (() => {
  const VERSION = 1;

  function aBase64url(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function deBase64url(texto) {
    const b = atob(texto.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) bytes[i] = b.charCodeAt(i);
    return bytes;
  }
  async function transformar(bytes, flujo) {
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(flujo)).arrayBuffer());
  }

  /** { proyecto, capas, vista, fuente, rutas } → texto para el enlace. */
  async function codificar(datos) {
    const json = new TextEncoder().encode(JSON.stringify({ v: VERSION, ...datos }));
    return aBase64url(await transformar(json, new CompressionStream('deflate-raw')));
  }

  /** Texto del enlace → datos. Lanza un error legible si el enlace está dañado. */
  async function decodificar(texto) {
    let datos;
    try {
      const json = await transformar(deBase64url(texto), new DecompressionStream('deflate-raw'));
      datos = JSON.parse(new TextDecoder().decode(json));
    } catch (e) {
      throw new Error('El enlace está incompleto o dañado. Pide a quien lo compartió que lo copie de nuevo completo.');
    }
    const errores = Modelo.validar(datos.proyecto);
    if (errores.length) throw new Error('El enlace no contiene un proyecto válido: ' + errores.join(' '));
    return datos;
  }

  /** Enlace de solo lectura a partir de la dirección actual de la herramienta. */
  function enlace(codigo) {
    const base = location.href.split(/[?#]/)[0];
    return `${base}?lectura#ver=${codigo}`;
  }

  return { codificar, decodificar, enlace };
})();
