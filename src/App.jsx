import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState("");
  const [showBody, setShowBody] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  //show the body section automatically for obvious method types
  useEffect(() => {
    if (["POST", "PUT", "PATCH"].includes(method)) {
      setShowBody(true);
    }
  }, [method]);

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
      const result = await invoke("execute_curl", { 
        method, 
        url, 
        headers,
        body: showBody ? body : null
      });
      setResponse(result);
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  }

  const handleCopy = async () => {
    if (!response || response === "CURLing...") return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="container" onClick={() => setIsMethodOpen(false)}>
      <h3>CURLer!</h3>

      <p>Test your APIs without the bloat.</p>

      <form onSubmit={handleRequest} className="form-group">
        {/*<select value={method} onChange={(e) => setMethod(e.target.value)} className="input-field-method">
          <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
        </select>*/}
        {/* CUSTOM DROPDOWN*/}
        <div className="custom-select-container" onClick={(e) => e.stopPropagation()}>
          <div 
            className="input-field custom-select-button" 
            onClick={() => setIsMethodOpen(!isMethodOpen)}
          >
            <span className="custom-select-value">{method}</span>
            {/* Minimal SVG Arrow */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          
          {isMethodOpen && (
            <div className="custom-select-menu">
              {HTTP_METHODS.map((m) => (
                <div 
                  key={m} 
                  className="custom-select-option"
                  onClick={() => {
                    setMethod(m);
                    setIsMethodOpen(false);
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* END CUSTOM DROPDOWN */}
        <input 
          className="input-field url-input"
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
        />
        <button type="submit" className="primary-button">Send</button>
      </form>

      <div className="header-section">
        <div className="section-header">
          <strong>Headers</strong>
        </div>
        {headers.map((h, i) => (
          <div key={i} className="header-row">
            <input 
              placeholder="Key" 
              value={h.key} 
              onChange={(e) => updateHeader(i, "key", e.target.value)} 
              className="input-field"
            />
            <input 
              placeholder="Value" 
              value={h.value} 
              onChange={(e) => updateHeader(i, "value", e.target.value)} 
              className="input-field"
            />
            <button onClick={() => removeHeader(i)} className="delete-button">×</button>
          </div>
        ))}
        <button onClick={addHeader} className="add-button">+ Add Header</button>
      </div>
 
      <div className="body-section">
        <div className="section-header">
          <strong>Body</strong>
          <button
            type="button"
            className="add-button"
            onClick={() => setShowBody(!showBody)}
          >
            {showBody ? "Hide Body" : "Show Body"}
          </button>
        </div>

        {showBody && (
          <textarea
            className="body-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck="false"
            placeholder='{"key": "value"}'
          />
        )}
      </div>

      <div className="response-section">
        <div className="response-header">
          <strong>Response</strong>
          {response && response !== "CURLing..." && (
            <button
              type="button"
              className={`copy-button ${copied ? "success" : ""}`}
              onClick={handleCopy}
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          )}
        </div>
        <pre className="response-box">{response}</pre>
      </div>
    </div>
  );
}

export default App;
