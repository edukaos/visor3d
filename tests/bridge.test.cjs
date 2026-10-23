const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const bridge = fs.readFileSync(path.join(__dirname, '../src-tauri/src/windows-open.js'), 'utf8');

async function run({ name = 'pieza á ñ.stl', bytes = new Uint8Array([1, 2, 3]).buffer, reject = false, origin = 'http://tauri.localhost', concatenated = false, loading = false } = {}) {
  const events = [];
  const calls = [];
  const message = { textContent: '' };
  const input = { files: [], dispatchEvent(event) { events.push(event); } };
  const window = { location: { origin, protocol: 'http:' }, __TAURI__: { core: { async invoke(command) {
    calls.push(command);
    if (command === 'opened_file_name') return name;
    if (reject) throw new Error('Acceso denegado');
    return bytes;
  } } } };
  window.top = window;
  let onReady;
  const context = { window, document: { readyState: loading ? 'loading' : 'complete', addEventListener(name, callback) { if (name === 'DOMContentLoaded') onReady = callback; }, getElementById: id => id === 'file' ? input : message },
    ArrayBuffer, File, Event, console: { error() {} }, DataTransfer: class {
      files = [];
      items = { add: file => this.files.push(file) };
    } };
  // Tauri 2.12.5 concatena este adaptador directamente después de un IIFE sin punto y coma.
  const prefix = concatenated ? '(() => { window.ipcReady = true; })()\n' : '';
  vm.runInNewContext(prefix + bridge, context);
  if (loading) {
    assert.equal(calls.length, 0, 'Debe esperar a que el visor esté preparado');
    onReady();
  }
  await new Promise(resolve => setImmediate(resolve));
  return { calls, input, events, message };
}

test('Entrega nombre Unicode y bytes al selector original', async () => {
  const result = await run();
  assert.equal(result.input.files[0].name, 'pieza á ñ.stl');
  assert.deepEqual([...new Uint8Array(await result.input.files[0].arrayBuffer())], [1, 2, 3]);
  assert.equal(result.events[0].type, 'change');
  assert.equal(result.events[0].bubbles, true);
});
test('Inicio sin argumento conserva el visor vacío', async () => {
  const result = await run({ name: null });
  assert.deepEqual(result.calls, ['opened_file_name']);
  assert.equal(result.events.length, 0);
  assert.equal(result.message.textContent, '');
});
test('Un error de lectura informa sin cargar bytes inválidos', async () => {
  const result = await run({ reject: true });
  assert.equal(result.events.length, 0);
  assert.match(result.message.textContent, /No se pudo/);
});
test('Rechaza archivo vacío', async () => {
  const result = await run({ bytes: new ArrayBuffer(0) });
  assert.equal(result.events.length, 0);
  assert.match(result.message.textContent, /No se pudo/);
});
test('No entrega archivos a páginas remotas', async () => {
  const result = await run({ origin: 'https://example.com' });
  assert.equal(result.calls.length, 0);
});
test('Apertura desde Windows con el script concatenado como en Tauri', async () => {
  const result = await run({ concatenated: true, loading: true });
  assert.deepEqual(result.calls, ['opened_file_name', 'opened_file_bytes']);
  assert.equal(result.input.files[0].name, 'pieza á ñ.stl');
  assert.equal(result.events[0].type, 'change');
});
