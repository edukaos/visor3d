# Visor 3D — Quirón

Visor de archivos **STL, OBJ, 3MF y GLB** para Windows x64. Proyecto de **Eduardo Gonzalez / Quirón**, en la cuenta [@edukaos](https://github.com/edukaos).

## Descargar e instalar

**[Descargar el paquete completo 1.0.1](https://github.com/edukaos/visor3d/raw/refs/heads/main/descargas/Visor3D-1.0.1-paquete-completo.zip)**

1. Extraer el ZIP.
2. Cerrar el visor si está abierto y ejecutar `Instalar-Visor3D-1.0.1.exe`.
3. Si detecta la instalación MSI anterior, aceptar su desinstalación y continuar.

El paquete incluye el instalador EXE, el ejecutable, el código fuente y las huellas SHA-256. El instalador puede descargar WebView2 si falta. El visor funciona sin conexión con modelos autocontenidos y sus recursos incluidos.

## Versión 1.0.1

Corrige el adaptador que carga los modelos recibidos al abrir un archivo desde Windows. La prueba de regresión y los otros cinco casos del adaptador pasan; queda pendiente la confirmación visual del doble clic con esta versión en una sesión normal de Windows.

## Compilar

Requiere Node.js, Rust MSVC y Visual Studio Build Tools con la carga de C++ y Windows SDK.

```powershell
npm ci
npm run check
npm test
npm run build
```

También se incluye `COMPILAR.cmd` y un workflow de GitHub Actions para compilar en Windows. Las compilaciones correctas generan artefactos descargables desde la pestaña **Actions**.

Consultar [LEEME.md](LEEME.md) para los pasos detallados y [CHANGELOG.md](CHANGELOG.md) para los cambios.
