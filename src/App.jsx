import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [method, setMethod] = useState("GET");
  const [response, setResponse] = useState("");

  async function  handleRequest(e) {
    e.preventDefault();
    setResponse("Loading...");

    try {
      // call rust backend
      const result = await invoke("execute_curl", { method, url });
      setResponse(result);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  }
}

export default App;
