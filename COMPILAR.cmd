@echo off
setlocal
cd /d "%~dp0"
if exist "%USERPROFILE%\.cargo\bin\cargo.exe" set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"
where node >nul 2>nul
if errorlevel 1 goto missing_node
where cargo >nul 2>nul
if errorlevel 1 goto missing_rust
call npm.cmd run check
if errorlevel 1 goto failed
call npm.cmd test
if errorlevel 1 goto failed
call npm.cmd install
if errorlevel 1 goto failed
call npm.cmd run build
if errorlevel 1 goto failed
echo.
echo Compilacion terminada. Ejecutable: src-tauri\target\release\visor3d.exe
echo Instaladores: src-tauri\target\release\bundle
pause
exit /b 0
:missing_node
echo Falta Node.js. Ver LEEME.md.
goto failed
:missing_rust
echo Falta Rust/Cargo. Ver LEEME.md o usar GitHub Actions.
:failed
echo No se pudo completar la compilacion. Revisar el error anterior y LEEME.md.
pause
exit /b 1
