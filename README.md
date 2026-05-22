# CURLer!

> A lightning-fast, bloat-free API client for Linux. Powered by `curl`, built with Tauri.

Are you tired of launching a 500MB Electron application just to send a simple POST request? API testing shouldn't require a Chromium instance. 

This project is a minimalist, native desktop wrapper around your system's `curl` binary. It gives you the visual organization of modern API clients with the raw speed, zero-CORS freedom, and reliability of the command line.

![App Screenshot](./screenshot.png)

## Features

* **Zero Bloat:** Compiles down to a tiny, native executable. No Electron, no heavy frameworks.
* **Wayland First:** Runs natively on modern Linux compositors (Hyprland, Sway) via WebKitGTK.
* **CORS? Never heard of her:** Because requests are executed at the system level via `curl`, browser security policies will never block your API calls.
* **Intelligent Parsing:** Automatically parses raw HTTP responses, extracts status codes, and pretty-prints JSON payloads.
* **Rosé Pine Aesthetic:** Carefully themed using the low-contrast, minimal Rosé Pine (Dark) color palette for late-night hacking sessions.

## How it Works

Under the hood, the Tauri (Rust) backend intercepts your UI inputs and constructs a secure `std::process::Command` array, spawning the `curl` binary already installed on your system. It captures standard output, parses the HTTP spec, and serves it back to a clean React frontend.

## Installation & Build (Arch Linux)

This application is designed with Linux in mind. To compile it from source on Arch-based distributions:

### 1. Install System Dependencies
Ensure you have Rust, Node.js, and the WebKitGTK development packages installed:
````
sudo pacman -S base-devel curl rustup nodejs npm webkit2gtk-4.1
rustup default stable
````
### 2. Clone and Build
````
git clone https://github.com/lewandowski96/CURLer.git
cd CURLer

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev

# Or compile the final native release binary!
npm run tauri build
````
The compiled executable will be located in `src-tauri/target/release/`

## Contributing

Contributions are welcome! If you want to add features (like saving request history, environment variables, or auth token management) while maintaining the strict "no-bloat" philosophy, feel free to open a PR.

    1. Fork the Project
    2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
    3. Commit your Changes (git commit -m 'Add some AmazingFeature')
    4. Push to the Branch (git push origin feature/AmazingFeature)
    5. Open a Pull Request

## License

Distributed under the MIT License. See LICENSE for more information.

Crafted by KSanjnN for the Linux developer community.
