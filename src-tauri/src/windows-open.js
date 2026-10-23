// Adaptador de Windows. El HTML original se conserva sin modificaciones.
;(() => {
  if (window.top !== window) return;
  const localOrigins = new Set(['http://tauri.localhost', 'https://tauri.localhost']);
  if (!localOrigins.has(window.location.origin) && window.location.protocol !== 'tauri:') return;

  async function openWindowsFile() {
    try {
      const invoke = window.__TAURI__?.core?.invoke;
      if (!invoke) throw new Error('No está disponible la conexión con Windows.');
      const name = await invoke('opened_file_name');
      if (!name) return;
      const bytes = await invoke('opened_file_bytes');
      if (!(bytes instanceof ArrayBuffer) || bytes.byteLength === 0) {
        throw new Error('El archivo está vacío o no se pudo leer.');
      }
      const input = document.getElementById('file');
      if (!input) throw new Error('No se encontró el selector de modelos.');
      const transfer = new DataTransfer();
      transfer.items.add(new File([bytes], name, { type: 'application/octet-stream' }));
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (error) {
      console.error('Apertura desde Windows:', error);
      const message = document.getElementById('msg');
      if (message) message.textContent = 'No se pudo abrir el modelo desde Windows. Probá arrastrarlo al visor.';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', openWindowsFile, { once: true });
  } else {
    void openWindowsFile();
  }
})();
