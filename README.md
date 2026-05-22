# ⚡️ CURLer!

> A lightning-fast, bloat-free API client for Linux. Powered by `curl`, built with Tauri.

Are you tired of launching a 500MB Electron application just to send a simple POST request? API testing shouldn't require a Chromium instance. 

This project is a minimalist, native desktop wrapper around your system's `curl` binary. It gives you the visual organization of modern API clients with the raw speed, zero-CORS freedom, and reliability of the command line.

![App Screenshot](./screenshot.png)

## ✨ Features

* **Zero Bloat:** Compiles down to a tiny, native executable. No Electron, no heavy frameworks.
* **Wayland First:** Runs natively on modern Linux compositors (Hyprland, Sway) via WebKitGTK.
* **CORS? Never heard of her:** Because requests are executed at the system level via `curl`, browser security policies will never block your API calls.
* **Intelligent Parsing:** Automatically parses raw HTTP responses, extracts status codes, and pretty-prints JSON payloads.
* **Rosé Pine Aesthetic:** Carefully themed using the low-contrast, minimal Rosé Pine (Dark) color palette for late-night hacking sessions.

## 🚀 How it Works

Under the hood, the Tauri (Rust) backend intercepts your UI inputs and constructs a secure `std::process::Command` array, spawning the `curl` binary already installed on your system. It captures standard output, parses the HTTP spec, and serves it back to a clean React frontend.

## 🛠️ Installation & Build (Arch Linux)

This application is designed with Linux in mind. To compile it from source on Arch-based distributions:

### 1. Install System Dependencies
Ensure you have Rust, Node.js, and the WebKitGTK development packages installed:
````

```bash
sudo pacman -S base-devel curl rustup nodejs npm webkit2gtk-4.1
rustup default stable
