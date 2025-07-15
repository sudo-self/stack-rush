import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import SplitPane from "split-pane-react";
import JSZip from "jszip";
import "split-pane-react/esm/themes/default.css";
import "./App.css";
import { marked } from "marked";
import { FaHtml5, FaCss3Alt, FaJsSquare, FaMarkdown } from "react-icons/fa";
import CloudflareDeployButton from "./CloudflareDeployButton";
import URLOpener from './URLopener';

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
      type: "html",
      content: `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tailwind CDN Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
  <style>
    .hello {
      color: #8a2be2;
      font-weight: bold;
    }
  </style>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen p-6 space-y-6 transition-colors duration-300">
  <nav class="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <h1 class="text-xl font-bold">Tailwind CSS Demo</h1>
    <button onclick="document.documentElement.classList.toggle('dark')"
      class="bg-gray-800 text-white dark:bg-white dark:text-black px-4 py-2 rounded hover:opacity-80 transition">
      Toggle Dark Mode
    </button>
  </nav>

  <h2 class="text-center text-2xl font-semibold">Text Style Examples in HTML</h2>

  <div class="text-red-500 text-lg p-4">This text is styled with Tailwind CDN.</div>
  <div class="hello text-lg p-4">This text is styled with external file 'style.css'</div>
  <div class="text-lg p-4"><p style="color:green">This text is styled inline with HTML</p></div>
  <div><h2>This text has no CSS applied</h2></div>

  <div class="p-4 rounded-xl text-white text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
    This div has a gradient background (left to right).
  </div>

  <div class="p-4 rounded-lg bg-blue-200 hover:bg-blue-400 transition duration-300">
    Hover over me to change the background color.
  </div>

  <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-300">
    Tailwind Button
  </button>

  <div class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
    Gradient Text Example
  </div>

  <a
    href="https://tailwindcss.com"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed bottom-6 right-6 bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition-all flex items-center justify-center"
  >
    Action
  </a>
</body>
</html>`,
    },
    {
      name: "styles.css",
      content: `.hello { color: #8a2be2; font-weight: bold; }`,
      type: "css",
    },
    {
      name: "script.js",
      content: `console.log("web.JesseJesse.com");`,
      type: "js",
    },
    {
      name: "README.md",
      content: "# Export ZIP for a ready-to-deploy website",
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
  const [showDeployModal, setShowDeployModal] = useState(false);

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
            h1, h2, h3 { font-weight: bold; margin-top: 1em; }
            pre { background: #f3f4f6; padding: 10px; border-radius: 6px; }
            code { background: #e5e7eb; padding: 2px 4px; border-radius: 4px; }
          </style>
        </head>
        <body>${marked(mdContent)}</body>
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

  const handleFileChange = (value: string | undefined) => {
    if (!value) return;
    setFiles(
      files.map((file) =>
        file.name === activeFile.name ? { ...file, content: value } : file
      )
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
          : file
      )
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
    a.download = "Website.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmbed = () => {
    const encoded = encodeURIComponent(JSON.stringify({ files }));
    const projectUrl = `${window.location.origin}${window.location.pathname}?project=${encoded}`;
    const code = `<iframe src="${projectUrl}" style="width:100%;height:500px;border:0;" loading="lazy"></iframe>`;
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

  const sashRender = (_index: number, active: boolean) => (
    <div className={`sash ${active ? "active" : ""}`} />
  );

  return (
    <div className="app-container">
      <SplitPane split="vertical" sizes={sizes} onChange={setSizes} sashRender={sashRender}>
        {/* File List Panel */}
        <div>
          {files.map((file) => (
            <div key={file.name} onClick={() => setActiveFile(file)} style={{ cursor: "pointer", padding: "4px" }}>
              {getFileIcon(file.type)} {file.name}
            </div>
          ))}
          <URLOpener />
        </div>

        {/* Editor + Preview */}
        <SplitPane split="vertical" sizes={[60, 40]} onChange={setSizes} sashRender={sashRender}>
          <div>
            <Editor
              height="100%"
              defaultLanguage={activeFile.type}
              value={activeFile.content}
              onChange={handleFileChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                padding: { top: 30 },
              }}
            />
          </div>
          <div>
            <div style={{ marginBottom: "8px" }}>
              <button onClick={handleShare}>Share</button>
              <button onClick={handleExport} style={{ marginLeft: "8px" }}>Export</button>
              <button onClick={handleEmbed} style={{ marginLeft: "8px" }}>Embed</button>
            </div>
            <iframe srcDoc={preview} sandbox="allow-scripts" width="100%" height="100%" title="preview" />
          </div>
        </SplitPane>
      </SplitPane>

      {showDeployModal && <CloudflareDeployButton onClose={() => setShowDeployModal(false)} />}
      {showEmbedModal && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}>
          <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "6px", width: "90%", maxWidth: "600px" }}>
            <h2>Embed HTML</h2>
            <textarea
              readOnly
              value={embedCode}
              style={{ width: "100%", height: "150px", padding: "8px", fontFamily: "monospace", borderRadius: "4px" }}
            />
            <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setShowEmbedModal(false)}>Close</button>
              <button onClick={() => {
                navigator.clipboard.writeText(embedCode).then(() => alert("Embed code copied!"));
              }}>Copy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



