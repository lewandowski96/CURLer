import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [response, setResponse] = useState("");

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);

  const updateHeader = (index, field, val) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = val;
    setHeaders(newHeaders);
  };

  const removeHeader = (index) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  async function  handleRequest(e) {
    e.preventDefault();
    setResponse("CURLing...");

    try {
      // call rust backend
      const result = await invoke("execute_curl", { method, url, headers });
      setResponse(result);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  }

  return (
    <div style={styles.container}>
      <h3>Postman Lite (Powered by Curl)</h3>
      
      <form onSubmit={handleRequest} style={styles.form}>
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={styles.input}>
          <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
        </select>
        <input 
          style={{ ...styles.input, flex: 1 }} 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
        />
        <button type="submit" style={styles.button}>Send</button>
      </form>

      <div style={styles.headerSection}>
        <p><strong>Headers</strong></p>
        {headers.map((h, i) => (
          <div key={i} style={styles.headerRow}>
            <input 
              placeholder="Key" 
              value={h.key} 
              onChange={(e) => updateHeader(i, "key", e.target.value)} 
              style={styles.input}
            />
            <input 
              placeholder="Value" 
              value={h.value} 
              onChange={(e) => updateHeader(i, "value", e.target.value)} 
              style={styles.input}
            />
            <button onClick={() => removeHeader(i)} style={styles.delBtn}>×</button>
          </div>
        ))}
        <button onClick={addHeader} style={styles.addBtn}>+ Add Header</button>
      </div>

      <pre style={styles.responseBox}>{response}</pre>
    </div>    
  );
}

const styles = {
  container: { padding: "20px", background: "#121212", color: "#eee", minHeight: "100vh", fontFamily: "monospace" },
  form: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: { background: "#222", border: "1px solid #444", color: "#fff", padding: "8px" },
  button: { background: "#007acc", color: "#fff", border: "none", padding: "8px 15px", cursor: "pointer" },
  headerSection: { marginBottom: "20px", borderTop: "1px solid #333", paddingTop: "10px" },
  headerRow: { display: "flex", gap: "5px", marginBottom: "5px" },
  addBtn: { background: "none", border: "1px dashed #555", color: "#888", cursor: "pointer", marginTop: "5px" },
  delBtn: { background: "#442222", color: "#ff8888", border: "none", cursor: "pointer" },
  responseBox: { background: "#000", padding: "15px", border: "1px solid #333", overflow: "auto", maxHeight: "400px" }
};

export default App;
