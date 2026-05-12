// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Deserialize;
use std::process::Command;

#[derive(Deserialize)]
struct HttpHeader {
    key: String,
    value: String
}

// exposing the func to react frontent
#[tauri::command]
fn execute_curl(method: &str, url: &str, headers: Vec<HttpHeader>) -> Result<String, String> {

    let mut args = vec![
        "-s".to_string(),
        "-i".to_string(),
        "-X".to_string(),
        method.to_string(),
    ];

    for header in headers {
        if !header.key.is_empty() {
            args.push("-H".to_string());
            args.push(format!("{}: {}", header.key, header.value));
        }
    }

    args.push(url.to_string());

    // using array of arguments prevents command injections.
    let output = Command::new("curl")
        .args(&args)
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
