use std::path::PathBuf;
use tauri::ipc::Response;

struct OpenedFile(Option<PathBuf>);

fn opened_path() -> Option<PathBuf> {
    let path = PathBuf::from(std::env::args_os().nth(1)?);
    let extension = path.extension()?.to_str()?.to_ascii_lowercase();
    if !matches!(extension.as_str(), "stl" | "obj" | "glb" | "3mf") || !path.is_file() {
        return None;
    }
    Some(path)
}

#[tauri::command]
fn opened_file_name(file: tauri::State<'_, OpenedFile>) -> Option<String> {
    file.0.as_ref()?.file_name().map(|name| name.to_string_lossy().into_owned())
}

#[tauri::command]
fn opened_file_bytes(file: tauri::State<'_, OpenedFile>) -> Result<Response, String> {
    let path = file.0.as_ref().ok_or("No se recibió un archivo para abrir.")?;
    std::fs::read(path)
        .map(Response::new)
        .map_err(|error| format!("No se pudo leer el modelo: {error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OpenedFile(opened_path()))
        .append_invoke_initialization_script(include_str!("windows-open.js"))
        .invoke_handler(tauri::generate_handler![opened_file_name, opened_file_bytes])
        .run(tauri::generate_context!())
        .expect("No se pudo iniciar Visor 3D");
}
