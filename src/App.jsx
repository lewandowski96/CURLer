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

  return (
    <div style={{ padding: "20px", fontFamily: "JetBrainsMono  Nerd Font" }}>
      <h2>CURLer</h2>

      <form onSubmit={handleRequest} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>

        <input 
          type="text" 
          name="url" 
          value={url}
          onChange={(e) =>  setUrl(e.target.value)}
          style={{ flex: 1, padding:  "5px" }}
        />

        <button type="submit">Send</button>
      </form>

      <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: "15px", overflowX: "auto" }}>
        {response}
      </pre>
    </div>
  );
}

export default App;
