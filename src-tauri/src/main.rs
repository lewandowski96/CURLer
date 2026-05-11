// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

// exposing the func to react frontent
#[tauri::command]
fn execute_curl(method: &str, url: &str) -> Result<String, String> {
    // exec curl directly
    // using array of arguments prevents command injections.
    let output = Command::new("curl")
        .args([
            "-s", // silent mode aka no progeress barr
            "-i", // incl HTTP headers in the output
            "-X",
            method,
            url
        ])
        .output()
        .map_err(|e| format!("Failed to execute curl: {}", e))?;

    if output.status.success() {
        // return everything to front
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        // return any errors
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn main() {
    //my_curl_client_lib::run()
    tauri::Builder::default()
        // registering the command for frontend to call
        .invoke_handler(tauri::generate_handler![execute_curl])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
