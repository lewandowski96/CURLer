import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";
import "./App.css";
import AppIcon from "./assets/AppIcon.jsx";

const store = new LazyStore("settings.json");

function App() {
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json" },
  ]);
  const [body, setBody] = useState("{}");
  const [response, setResponse] = useState("");
  const [showBody, setShowBody] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [responseTab, setResponseTab] = useState("body");

  // New state for persistence
  const [savedRequests, setSavedRequests] = useState([]);
  const isInitialized = useRef(false);

  const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

  // Load saved requests on mount
  useEffect(() => {
    async function initStorage() {
      console.log("Storage: Initializing...");
      try {
        // Try to load from native store first
        let saved = await store.get("savedRequests");
        console.log("Storage: Loaded from native store:", saved);

        // Migration: if nothing in native store, check localStorage
        if (!saved) {
          const local = localStorage.getItem("savedRequests");
          if (local) {
            console.log("Storage: Found data in localStorage, migrating...");
            try {
              saved = JSON.parse(local);
              await store.set("savedRequests", saved);
              await store.save();
              console.log("Storage: Migration successful");
            } catch (e) {
              console.error("Storage: Failed to parse localStorage data", e);
            }
          }
        }

        if (saved) {
          setSavedRequests(saved);
        } else {
          console.log("Storage: No saved data found anywhere");
        }
      } catch (err) {
        console.error("Storage: Failed to initialize store", err);
      } finally {
        isInitialized.current = true;
        console.log("Storage: Initialization complete");
      }
    }
    initStorage();
  }, []);

  // Sync to native store
  useEffect(() => {
    async function syncStorage() {
      if (!isInitialized.current) {
        console.log("Storage: Sync skipped (not initialized)");
        return;
      }

      console.log("Storage: Syncing to disk...", savedRequests);
      try {
        await store.set("savedRequests", savedRequests);
        await store.save();
        console.log("Storage: Sync successful");
      } catch (err) {
        console.error("Storage: Sync failed", err);
      }
    }
    syncStorage();
  }, [savedRequests]);
  const saveRequest = () => {
    const name = prompt("Enter a name for this request:");
    if (!name) return;
    const newRequest = {
      id: Date.now().toString(),
      name: name,
      method,
      url,
      headers,
      body,
    };
    setSavedRequests([...savedRequests, newRequest]);
  };

  const loadRequest = (request) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setBody(request.body);
  };

  const deleteRequest = (id) => {
    setSavedRequests(savedRequests.filter((r) => r.id !== id));
  };

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

  const handleBodyKeyDown = (e) => {
    const target = e.target;
    const { selectionStart, selectionEnd, value } = target;

    // 1. Tab Indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const tabStr = "  "; // 2 spaces

      if (!e.shiftKey) {
        // Indent: Insert 2 spaces
        const newValue =
          value.substring(0, selectionStart) +
          tabStr +
          value.substring(selectionEnd);
        
        setBody(newValue);
        
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = selectionStart + tabStr.length;
        }, 0);
      } else {
        // Outdent: Remove 2 spaces of leading indentation on the current line
        const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
        const lineText = value.substring(lineStart, selectionStart);
        
        if (lineText.startsWith(tabStr)) {
          const newValue =
            value.substring(0, lineStart) +
            lineText.substring(tabStr.length) +
            value.substring(selectionStart);
            
          setBody(newValue);
          
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = Math.max(
              lineStart,
              selectionStart - tabStr.length
            );
          }, 0);
        }
      }
      return;
    }

    // 2. Auto-close brackets/braces/quotes
    const pairs = {
      "{": "}",
      "[": "]",
      "(": ")",
      '"': '"',
      "'": "'",
      "`": "`",
    };

    if (pairs[e.key] !== undefined) {
      e.preventDefault();
      const openChar = e.key;
      const closeChar = pairs[openChar];

      // If typing a quote/bracket and cursor is already right before the matching closing character, just move cursor forward
      if (
        (openChar === '"' || openChar === "'" || openChar === "`" || openChar === "}" || openChar === "]" || openChar === ")") &&
        value.charAt(selectionStart) === openChar
      ) {
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = selectionStart + 1;
        }, 0);
        return;
      }

      const selection = value.substring(selectionStart, selectionEnd);
      const newValue =
        value.substring(0, selectionStart) +
        openChar +
        selection +
        closeChar +
        value.substring(selectionEnd);

      setBody(newValue);

      setTimeout(() => {
        target.selectionStart = selectionStart + 1;
        target.selectionEnd = selectionEnd + 1;
      }, 0);
      return;
    }

    // Move cursor past closing character if typed directly
    const closingChars = ["}", "]", ")"];
    if (closingChars.includes(e.key) && value.charAt(selectionStart) === e.key) {
      e.preventDefault();
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }

    // 3. Backspace pair deletion
    if (e.key === "Backspace") {
      const charBefore = value.charAt(selectionStart - 1);
      const charAfter = value.charAt(selectionStart);
      
      const isPair = 
        (charBefore === "{" && charAfter === "}") ||
        (charBefore === "[" && charAfter === "]") ||
        (charBefore === "(" && charAfter === ")") ||
        (charBefore === '"' && charAfter === '"') ||
        (charBefore === "'" && charAfter === "'") ||
        (charBefore === "`" && charAfter === "`");
        
      if (isPair && selectionStart === selectionEnd) {
        e.preventDefault();
        const newValue =
          value.substring(0, selectionStart - 1) +
          value.substring(selectionStart + 1);
        setBody(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = selectionStart - 1;
        }, 0);
        return;
      }
    }

    // 4. Auto-indent on Enter
    if (e.key === "Enter") {
      e.preventDefault();
      
      // Find the current line start
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      
      // Get the leading whitespace of the current line
      const whitespaceMatch = currentLine.match(/^\s*/);
      const whitespace = whitespaceMatch ? whitespaceMatch[0] : "";
      
      // Check if cursor is between a matching pair
      const charBefore = value.charAt(selectionStart - 1);
      const charAfter = value.charAt(selectionStart);
      const isBetweenPair = 
        (charBefore === "{" && charAfter === "}") ||
        (charBefore === "[" && charAfter === "]") ||
        (charBefore === "(" && charAfter === ")");
        
      if (isBetweenPair) {
        const extraIndent = "  ";
        const insertion = "\n" + whitespace + extraIndent + "\n" + whitespace;
        const newValue =
          value.substring(0, selectionStart) +
          insertion +
          value.substring(selectionEnd);
          
        setBody(newValue);
        
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = selectionStart + whitespace.length + extraIndent.length + 1;
        }, 0);
      } else {
        // Check if current line ends with opening bracket/brace to auto-indent further
        const trimmedLine = currentLine.trim();
        let extraIndent = "";
        if (
          trimmedLine.endsWith("{") ||
          trimmedLine.endsWith("[") ||
          trimmedLine.endsWith("(")
        ) {
          extraIndent = "  ";
        }

        const insertion = "\n" + whitespace + extraIndent;
        const newValue =
          value.substring(0, selectionStart) +
          insertion +
          value.substring(selectionEnd);
          
        setBody(newValue);
        
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = selectionStart + insertion.length;
        }, 0);
      }
      return;
    }
  };

  async function handleRequest(e) {
    e.preventDefault();
    setResponse("CURLing...");
    setIsMethodOpen(false);
    try {
      // call rust backend
      const result = await invoke("execute_curl", {
        method,
        url,
        headers,
        body: showBody ? body : null,
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
      const firstLine = parsedHeaders.split("\n")[0];
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

      {/* Persistence UI */}
      <form onSubmit={handleRequest} className="form-group">
        {/* CUSTOM DROPDOWN*/}
        <div
          className="custom-select-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="input-field custom-select-button"
            onClick={() => setIsMethodOpen(!isMethodOpen)}
          >
            <span className="custom-select-value">{method}</span>
            {/* Minimal SVG Arrow */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--subtle)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        <button type="submit" className="primary-button">
          Send
        </button>
        <button type="button" onClick={saveRequest} className="primary-button">
          Save
        </button>
      </form>

      <div className="persistence-section">
        <strong>Saved Requests</strong>
        <div className="saved-requests-list">
          {savedRequests.map((req) => (
            <div key={req.id} className="saved-request-item">
              <button onClick={() => loadRequest(req)}>{req.name}</button>
              <button
                onClick={() => deleteRequest(req.id)}
                className="delete-button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

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
            <button onClick={() => removeHeader(i)} className="delete-button">
              ×
            </button>
          </div>
        ))}
        <button onClick={addHeader} className="add-button">
          + Add Header
        </button>
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
            onKeyDown={handleBodyKeyDown}
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
              <div
                className={`status-badge ${isErrorStatus ? "error" : "success"}`}
              >
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
