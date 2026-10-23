# Cambios

## 1.0.1 — 22/10/2026

- Corregida la concatenación del adaptador de archivos con el script IPC de Tauri. La ausencia de un separador impedía ejecutar la apertura del modelo recibido desde Windows.
- Nueva prueba de regresión que concatena los scripts como Tauri y simula el evento DOMContentLoaded.
- El HTML y las asociaciones de archivos permanecen sin cambios.

La entrega completa incluye el instalador NSIS `.exe` y el ejecutable 1.0.1. El instalador detecta la instalación MSI anterior de Visor 3D por nombre/editor y solicita quitarla antes de instalar la nueva versión. Cerrar el visor y ejecutar `Instalar-Visor3D-1.0.1.exe`. No hace falta copiar archivos a Program Files manualmente. Se verificó que el ejecutable extraído del instalador coincide por SHA-256 con el compilado corregido. No se incluye un MSI nuevo, porque su validación necesita un servicio no accesible desde la sesión restringida.
