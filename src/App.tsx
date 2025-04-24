import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import SplitPane from "split-pane-react";
import JSZip from "jszip";
import "split-pane-react/esm/themes/default.css";
import "./App.css";
import { marked } from "marked";
import { FaHtml5, FaCss3Alt, FaJsSquare, FaMarkdown } from "react-icons/fa";

// types
type FileType = "html" | "css" | "js" | "md";


interface File {
  name: string;
  content: string;
  type: FileType;
}

function App() {
  const [files, setFiles] = useState<File[]>([
    {
      name: "index.html",
      content: '<div class="hello">Welcome to stack-rush!</div>',
      type: "html",
    },
    { name: "styles.css", content: ".hello { color: blue; }", type: "css" },
    {
      name: "script.js",
      content: 'console.log("stack-rush from JS!");',
      type: "js",
    },
    {
      name: "README.md",
      content: "\n\n# Export ZIP for a ready-to-deploy website!",
      type: "md",
    },
  ]);
  const [activeFile, setActiveFile] = useState<File>(files[0]);
  const [sizes, setSizes] = useState<number[]>([20, 40, 40]);
  const [preview, setPreview] = useState<string>("");
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [renameFile, setRenameFile] = useState<string | null>(null);
  const [newFileNameForRename, setNewFileNameForRename] = useState<string>("");
  const [theme, setTheme] = useState("vs-dark");
  const [isDragging, setIsDragging] = useState(false);


    useEffect(() => {
      const htmlContent = files.find((f) => f.type === "html")?.content || "";
      const cssContent = files.find((f) => f.type === "css")?.content || "";
      const jsContent = files.find((f) => f.type === "js")?.content || "";
      const mdContent = files.find((f) => f.type === "md")?.content || "";

      let combined = "";

      if (activeFile.type === "md") {
        combined = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { font-family: sans-serif; padding: 20px; }
                h1, h2, h3, h4, h5, h6 { font-weight: bold; margin-top: 1em; }
                pre { background: #f3f4f6; padding: 10px; border-radius: 6px; }
                code { background: #e5e7eb; padding: 2px 4px; border-radius: 4px; }
              </style>
            </head>
            <body>
              ${marked(mdContent)}
            </body>
          </html>
        `;
      } else {
        combined = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <script src="https://cdn.tailwindcss.com"></script>
              <style>${cssContent}</style>
            </head>
            <body>
              ${htmlContent}
              <script>${jsContent}</script>
            </body>
          </html>
        `;
      }

      setPreview(combined);
    }, [files, activeFile]);


  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "html":
        return <FaHtml5 />;
      case "css":
        return <FaCss3Alt />;
      case "js":
        return <FaJsSquare />;
      case "md":
        return <FaMarkdown />;
      default:
        return <span>?</span>;
    }
  };

  const handleFileChange = (value: string | undefined) => {
    if (!value) return;
    setFiles(
      files.map((file) =>
        file.name === activeFile.name ? { ...file, content: value } : file,
      ),
    );
  };

  const handleShare = () => {
    const encoded = encodeURIComponent(JSON.stringify({ files }));
    const url = `${window.location.origin}${window.location.pathname}?project=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert("Share URL copied!"));
  };

  const handleDeleteFile = (fileName: string) => {
    const updated = files.filter((f) => f.name !== fileName);
    setFiles(updated);
    if (activeFile.name === fileName) setActiveFile(updated[0] || files[0]);
  };

  const handleRenameFile = (fileName: string) => {
    setRenameFile(fileName);
    const fileToRename = files.find((f) => f.name === fileName);
    if (fileToRename) setNewFileNameForRename(fileToRename.name);
  };

  const handleSaveRename = () => {
    if (!newFileNameForRename.trim()) return;
    setFiles(
      files.map((file) =>
        file.name === renameFile
          ? { ...file, name: newFileNameForRename }
          : file,
      ),
    );
    setRenameFile(null);
  };

  const handleExport = async () => {
    const zip = new JSZip();
    files.forEach((f) => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MyWebsite.zip";
    a.click();
    URL.revokeObjectURL(url);
  };
    
    const handleEmbed = () => {
   
      const encoded = encodeURIComponent(JSON.stringify({ files }));
      const projectUrl = `${window.location.origin}${window.location.pathname}?project=${encoded}`;

      const code = `<!-- stack-rush.vercel.app -->
      <iframe 
        src="${projectUrl}"
        style="width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden;"
        title="stack-rush"
        loading="lazy"
      ></iframe>
      <!-- stack-rush.vercel.app -->`;
      
      setEmbedCode(code);
      setShowEmbedModal(true);
    };



  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const project = params.get("project");
    if (project) {
      try {
        const { files: loaded } = JSON.parse(decodeURIComponent(project));
        setFiles(loaded);
        setActiveFile(loaded[0]);
      } catch (err) {
        console.error("Invalid shared project:", err);
      }
    }
  }, []);

  const sashRender = (_index: number, active: boolean) => {
    return <div className={`sash ${active ? "active" : ""}`} />;
  };

  return (
    <div className="app-container">
          <div
            className="theme-switcher"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px",
            }}
          >
          <img
            src="/Computer.svg"
            alt="computer"
            style={{
              width: "30px",
              marginLeft: "10px",
              verticalAlign: "middle",
            }}
          />

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontWeight: "500" }}>stack-rush.vercel.app</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>



      <SplitPane
        split="vertical"
        sizes={sizes}
        onChange={setSizes}
        sashRender={sashRender}
      >
          <div
            className={`files-panel ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFiles = Array.from(e.dataTransfer.files);

              for (const file of droppedFiles) {
                const extension = file.name.split(".").pop()?.toLowerCase();
                const type = extension as FileType;

                if (!["html", "css", "js", "md"].includes(type)) {
                  alert(`Unsupported file type: ${file.name}`);
                  continue;
                }

                const text = await file.text();
                setFiles((prev) => [
                  ...prev,
                  {
                    name: file.name,
                    content: text,
                    type: type as FileType,
                  },
                ]);
              }
            }}
          >

            <h2>Project Files</h2>
          <div
            className="drag-drop-zone"
            style={{
              border: "2px dashed #999",
              padding: "1rem",
              marginBottom: "1rem",
              textAlign: "center",
              borderRadius: "8px",
              backgroundColor: isDragging ? "#f0f0f0" : "transparent",
              transition: "background-color 0.2s ease",
            }}
          >
            Drop your files here
          </div>

            {files.map((file) => (
              <div
                key={file.name}
                className={`file-item ${file.name === activeFile.name ? "active" : ""}`}
                onClick={() => setActiveFile(file)}
              >
                {renameFile === file.name ? (
                  <div className="rename-input">
                    <input
                      type="text"
                      value={newFileNameForRename}
                      onChange={(e) => setNewFileNameForRename(e.target.value)}
                    />
                    <button onClick={handleSaveRename}>Save</button>
                  </div>
                ) : (
                  <>
                    <span
                      className="file-name"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {getFileIcon(file.type)} {file.name}
                    </span>
                    <div className="file-actions">
                      <button
                        onClick={() => handleRenameFile(file.name)}
                        className="rename-btn"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.name)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          


        <SplitPane
          split="vertical"
          sizes={[60, 40]}
          onChange={setSizes}
          sashRender={sashRender}
        >
          <div className="editor-panel">
            <Editor
              height="100%"
              defaultLanguage={activeFile.type}
              value={activeFile.content}
              onChange={handleFileChange}
              theme={theme}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                padding: { top: 30 },
              }}
            />
          </div>
          <div className="preview-panel">
          <div className="button-panel">
            <button className="action-button" onClick={handleShare}>
              Share
            </button>
            <button className="action-button" onClick={handleExport}>
              Export
            </button>
            <button className="action-button" onClick={handleEmbed}>
              Embed
            </button>

          <img
            src="/react.svg"
            alt="React Logo"
            style={{
              width: "30px",
              marginLeft: "10px",
              verticalAlign: "middle",
            }}
          />
          <img
            src="/typescript.svg"
            alt="TypeScript Logo"
            style={{
              width: "30px",
              marginLeft: "10px",
              verticalAlign: "middle",
            }}
          />
          </div>
            <iframe
              srcDoc={preview}
              title="preview"
              sandbox="allow-scripts"
              width="100%"
              height="100%"
            />
          </div>
        </SplitPane>
      </SplitPane>

      {showEmbedModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Embed HTML</h2>
            <textarea
              readOnly
              value={embedCode}
              style={{
                width: "100%",
                height: "150px",
                padding: "8px",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            />
            <div className="button-container">
              <button onClick={() => setShowEmbedModal(false)}>Close</button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(embedCode).then(() => {
                    alert("Embed code copied to clipboard!");
                  });
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

