# Visor 3D para Windows — Quirón

Proyecto Tauri 2 preparado para generar `visor3d.exe`, instalador NSIS `.exe` e instalador `.msi` de Windows x64.

La entrega completa 1.0.1 incluye el instalador **NSIS EXE**, el ejecutable y el código fuente. Para actualizar, cerrar el visor y ejecutar `Instalar-Visor3D-1.0.1.exe`; aceptar la eliminación de la instalación MSI anterior cuando el asistente la detecte. El instalador contenido se verificó extrayendo su ejecutable y comparándolo por SHA-256 con la compilación corregida. No se incluye un MSI 1.0.1: la sesión restringida no puede ejecutar su validación mediante Windows Installer.

## Estado de esta entrega

**Versión 1.0.1 para Windows x64.** Corrige la apertura de modelos al hacer doble clic en Windows. El script IPC de Tauri termina en una función autoejecutable sin punto y coma; concatenar inmediatamente el adaptador anterior provocaba un TypeError antes de registrar la apertura. Se agregó un separador explícito, manteniendo el HTML original intacto. La prueba de regresión reprodujo el fallo en 1.0.0 y pasó con la corrección; pasan los seis casos del adaptador. Se conservan package-lock.json y Cargo.lock. El usuario confirmó que la ventana y la apertura manual funcionaban en 1.0.0. Queda pendiente confirmar visualmente el doble clic en 1.0.1 fuera de la sesión restringida, cuyo intento de arranque anterior dio Acceso denegado (os error 5).

## Opción A: GitHub Actions (sin instalar compiladores en tu PC)

1. Crear un repositorio privado en GitHub, o usar uno destinado a este proyecto.
2. Subir **el contenido de esta carpeta**, incluyendo `.github/workflows/build-windows.yml`. `package.json` debe quedar en la raíz del repositorio. No subir únicamente el ZIP.
3. La subida a la rama `main` inicia la compilación; también puede iniciarse desde **Actions → Compilar Visor 3D para Windows → Run workflow**.
4. Cuando termine correctamente, abrir la ejecución y descargar **Visor-3D-Windows-x64** desde **Artifacts**.
5. Extraer el ZIP. El ejecutable suelto es `visor3d.exe`; los instaladores están dentro de `bundle/nsis` y `bundle/msi`. Para instalar, elegir uno de los dos instaladores.

El workflow solo compila y guarda artefactos; no crea releases ni publica una web. Utiliza un equipo Windows x64 de GitHub. La primera compilación resuelve dependencias Tauri 2 y guarda `package-lock.json` y `Cargo.lock` como artefacto aparte. Conservar esos archivos en el repositorio permite fijar las versiones en futuras compilaciones.

## Opción B: compilar en Windows

Instalar primero:

- Node.js LTS: https://nodejs.org/
- Rust (toolchain MSVC): https://rustup.rs/
- Visual Studio Build Tools, seleccionando **Desarrollo para el escritorio con C++**, incluyendo MSVC y Windows SDK: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- WebView2 Runtime si no está instalado: https://developer.microsoft.com/microsoft-edge/webview2/

Cerrar y abrir la terminal después de instalar. En la carpeta del proyecto ejecutar en este orden:

```powershell
node --version
cargo --version
rustc --version
npm.cmd run check
npm.cmd test
npm.cmd install
npm.cmd run tauri dev
```

Cerrar la ventana de prueba y ejecutar:

```powershell
npm.cmd run tauri build
```

También se incluye `COMPILAR.cmd`: verifica Node/Cargo, valida y compila. No instala automáticamente herramientas del sistema.

Resultados esperados:

- `src-tauri/target/release/visor3d.exe`
- `src-tauri/target/release/bundle/nsis/*-setup.exe`
- `src-tauri/target/release/bundle/msi/*.msi`

## Qué se preparó

- `src/index.html`: copia byte por byte de tu `visor3d.html`, sin cambiar diseño ni funciones.
- `original.sha256`: huella del HTML para comprobar que siga intacto.
- `package.json`: comandos npm y CLI de Tauri 2.
- `src-tauri/Cargo.toml`, `build.rs`, `src/main.rs` y `src/lib.rs`: aplicación nativa y lectura del archivo recibido desde Windows.
- `src-tauri/src/windows-open.js`: adaptador externo que pasa ese modelo al selector de archivos original. El HTML recibido **no incluía** `__TAURI__`, `opened_file_name` ni `opened_file_bytes`, pese a lo que indicaban las instrucciones. Este adaptador resuelve esa diferencia sin editar el HTML.
- `src-tauri/tauri.conf.json`: ventana de 1100 × 750, arrastre HTML habilitado, asociaciones STL/OBJ/GLB/3MF e instaladores.
- `src-tauri/capabilities/default.json`: permisos básicos de la ventana local.
- `src-tauri/icons/`: icono geométrico de cubo para Windows.
- `.github/workflows/build-windows.yml`: compilación alternativa en Windows.
- `scripts/check.cjs`, `tests/bridge.test.cjs`: validaciones y pruebas del adaptador.
- `COMPILAR.cmd`: acceso directo a la compilación.

El backend solo lee la ruta recibida al iniciar la app. Cada doble clic inicia su propia instancia; no se agregó comportamiento de instancia única. No se incorporó el plugin opener porque este visor no lo necesita.

## Prueba final después de compilar

1. Abrir `visor3d.exe`: debe verse el texto original para arrastrar o abrir un modelo.
2. Abrir y arrastrar modelos válidos de cada formato: STL, OBJ, GLB y 3MF. Probar órbita, paneo y zoom; también Ctrl+O y cambio de tamaño de la ventana.
3. Probar un nombre con espacios y acentos y una ruta larga.
4. Probar desde PowerShell: `& '.\src-tauri\target\release\visor3d.exe' 'C:\Modelos\pieza.stl'`.
5. Instalar con NSIS o MSI; usar **Abrir con → Visor 3D**. Si Windows ya tiene otra aplicación predeterminada, elegir Visor 3D y marcar la opción para usarlo siempre. No se fuerza el cambio de predeterminados.
6. Desconectar internet y volver a abrir modelos autocontenidos. El visor incluye sus librerías; archivos con recursos externos conservan las limitaciones del HTML original.

El ejecutable suelto necesita WebView2 y no registra asociaciones. El instalador puede descargar WebView2 si falta; esa instalación inicial requiere conexión. Después, el visor funciona con sus recursos incluidos.

## Errores y soluciones

- `cargo` no encontrado: instalar Rust MSVC y volver a abrir la terminal.
- `link.exe` o Windows SDK faltante: completar la carga de C++ en Visual Studio Build Tools.
- Error al descargar npm/crates/NSIS/WiX: permitir el acceso de las herramientas de compilación a internet o compilar con GitHub Actions.
- Error de MSI relacionado con VBScript: habilitar la característica opcional VBScript de Windows, o compilar solo NSIS con `npm.cmd run tauri build -- --bundles nsis`.
- Archivo abre otra aplicación: seleccionar Visor 3D mediante **Abrir con**, después de instalarlo.
- Pantalla vacía: comprobar WebView2 y aceleración gráfica. No se ha ejecutado aún la prueba visual de este paquete.

No se ha aplicado firma digital. Windows SmartScreen puede mostrar una advertencia al ejecutar el instalador en otra PC.

Documentación oficial consultada: https://v2.tauri.app/start/prerequisites/ · https://v2.tauri.app/reference/config/ · https://v2.tauri.app/distribute/pipelines/github/
