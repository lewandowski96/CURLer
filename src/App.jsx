import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import AppIcon from "./assets/AppIcon.jsx";

function App() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState("");
  const [showBody, setShowBody] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [responseTab, setResponseTab] = useState("body");

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
    setIsMethodOpen(false);
    try {
      // call rust backend
      const result = await invoke("execute_curl", { 
        method, 
        url, 
        headers,
        body: showBody ? body : null
      });
      setResponse(result);
      setResponseTab("body");
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
  }

  const handleCopy = async (textToCopy) => {
    if (!textToCopy || response === "CURLing...") return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  let parsedHeaders = "";
  let parsedBody = "";
  let statusCode = "";
  let statusText = "";
  let isErrorStatus = false;

  if (response && response !== "CURLing..." && !response.startsWith("Error:")) {
    // seperate headers and body
    const parts = response.split(/\r?\n\r?\n/);
    
    // in case of '100 Continue'
    if (parts.length >= 2) {
      parsedHeaders = parts.slice(0, -1).join("\n\n");
      let rawBody = parts[parts.length - 1];

      // Extract status code from the first line of headers
      const firstLine = parsedHeaders.split('\n')[0];
      const match = firstLine.match(/HTTP\/\S+\s+(\d+)\s+(.*)/);
      if (match) {
        statusCode = match[1];
        statusText = match[2];
        isErrorStatus = parseInt(statusCode) >= 400;
      }

      // format JSON beautifully
      try {
        parsedBody = JSON.stringify(JSON.parse(rawBody), null, 2);
      } catch (error) {
        parsedBody = rawBody;
      }
    } else {
      parsedBody = response;
    }
  } else {
    parsedBody = response;
  }

  const displayContent = responseTab === "body" ? parsedBody : parsedHeaders;

  return (
    <div className="container" onClick={() => setIsMethodOpen(false)}>
      <div className="app-title-container">
        <AppIcon size={28} />
        <h3>CURLer!</h3>
      </div>

      <p>Just test your APIs without the bloat.</p>

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
        </div>
        <div className="response-controls">
          <div className="response-tabs">
            <button
              type="button"
              className={`tab-button ${responseTab === "body" ? "active" : ""}`}
              onClick={() => setResponseTab("body")}
            >
              Body
            </button>
            <button
              type="button"
              className={`tab-button ${responseTab === "headers" ? "active" : ""}`}
              onClick={() => setResponseTab("headers")}
            >
              Headers
            </button>
          </div>

          <div className="response-actions">
            {statusCode && (
              <div className={`status-badge ${isErrorStatus ? "error" : "success"}`}>
                {statusCode} {statusText}
              </div>
            )}

            {response && response !== "CURLing..." && (
              <button
                type="button"
                className={`copy-button ${copied ? "success" : ""}`}
                onClick={() => handleCopy(displayContent)}
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            )}
          </div>
        </div>
        <pre className="response-box">{displayContent}</pre>
      </div>
    </div>
  );
}

export default App;
