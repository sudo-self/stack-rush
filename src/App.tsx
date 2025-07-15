import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import SplitPane from "split-pane-react";
import JSZip from "jszip";
import "split-pane-react/esm/themes/default.css";
import "./App.css";
import { marked } from "marked";
import { FaHtml5, FaCss3Alt, FaJsSquare, FaMarkdown } from "react-icons/fa";
import CloudflareDeployButton from "./CloudflareDeployButton";
import URLOpener from "./URLopener";

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
      content: <!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tailwind CDN Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = { darkMode: 'class' }</script>
  <style>
    .hello { color: #8a2be2; font-weight: bold; }
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
</html>,
    },
    {
      name: "styles.css",
      type: "css",
      content: .hello { color: #8a2be2; font-weight: bold; },
    },
    {
      name: "script.js",
      type: "js",
      content: console.log("web.JesseJesse.com");,
    },
    {
      name: "README.md",
      type: "md",
      content: "# Export ZIP for a ready-to-deploy website",
    },
  ]);

  const [activeFile, setActiveFile] = useState<File>(files[0]);
  const [sizes, setSizes] = useState<number[]>([20, 40, 40]);
  const [preview, setPreview] = useState<string>("");
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCode, setEmbedCode] = useState("");
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    const html = files.find((f) => f.type === "html")?.content || "";
    const css = files.find((f) => f.type === "css")?.content || "";
    const js = files.find((f) => f.type === "js")?.content || "";
    const md = files.find((f) => f.type === "md")?.content || "";

    const result =
      activeFile.type === "md"
        ? <!DOCTYPE html><html><head><meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>body { font-family: sans-serif; padding: 20px; }</style>
          </head><body>${marked(md)}</body></html>
        : <!DOCTYPE html><html><head><meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${css}</style></head><body>${html}<script>${js}</script></body></html>;

    setPreview(result);
  }, [files, activeFile]);

  const handleFileChange = (value?: string) => {
    if (!value) return;
    setFiles(
      files.map((f) =>
        f.name === activeFile.name ? { ...f, content: value } : f
      )
    );
  };

  const handleShare = () => {
    const encoded = encodeURIComponent(JSON.stringify({ files }));
    const url = ${window.location.origin}${window.location.pathname}?project=${encoded};
    navigator.clipboard.writeText(url).then(() => alert("Share URL copied!"));
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
    const projectUrl = ${window.location.origin}${window.location.pathname}?project=${encoded};
    setEmbedCode(
      <iframe src="${projectUrl}" style="width:100%;height:500px;border:0;" loading="lazy"></iframe>
    );
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
        console.error("Failed to load shared project:", err);
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
    <div className={sash ${active ? "active" : ""}} />
  );

  return (
    <div className="app-container">
      <SplitPane split="vertical" sizes={sizes} onChange={setSizes} sashRender={sashRender}>
        <div>
          {files.map((file) => (
            <div
              key={file.name}
              onClick={() => setActiveFile(file)}
              style={{ cursor: "pointer", padding: "4px" }}
            >
              {getFileIcon(file.type)} {file.name}
            </div>
          ))}
          <URLOpener />
        </div>

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
        <div className="modal-overlay">
          <div className="modal">
            <h2>Embed HTML</h2>
            <textarea
              readOnly
              value={embedCode}
              style={{
                width: "100%",
                height: "150px",
                padding: "8px",
                fontFamily: "monospace",
                borderRadius: "4px",
              }}
            />
            <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => setShowEmbedModal(false)}>Close</button>
              <button onClick={() => navigator.clipboard.writeText(embedCode).then(() => alert("Copied!"))}>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;  html: <!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Edit Text Style</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    // Enable dark mode via class strategy
    tailwind.config = {
      darkMode: 'class'
    }
  </script>
  <style>
    .hello {
      color: #8a2be2;
      font-weight: bold;
    }
  </style>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen p-6 space-y-6 transition-colors duration-300">
     </script>  <style>    .hello {      color: #25b387;      font-weight: bold;    \}  </style></head> <body class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen p-6 space-y-6 transition-colors duration-300"> 

  <nav class="flex items-center justify-between p-4 bg-gray-100 dark:bg-cyan-800 rounded-lg">
    <h1 class="text-xl font-bold">Tailwind CDN</h1>
    <button onclick="document.documentElement.classList.toggle('dark')"
      class="bg-gray-800 text-white dark:bg-white dark:text-black px-4 py-2 rounded hover:opacity-80 transition">
     Dark Mode Toggle
    </button>
  </nav>

  <h2 class="text-center text-indigo-300 text-2xl font-semibold">Edit Text Styles with CSS</h2>
  <p>
  <div class="text-red-500 text-lg p-4">
    This text is styled with Tailwind CDN.
  </div>
  <div class="hello text-lg p-4 font-">
    This text is styled with external ./style.css
  </div>
  <div class="text-lg p-4">
    <p style="color:yellow">This text is styled inline with HTML</p>
  </div>
  <div>
    <h2>This text has no CSS applied</h2>
  </div>
  <div class="p-4 rounded-xl text-white text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
    This div has a gradient background left to right.
  </div>
  <div class="p-4 rounded-lg bg-indigo-500 hover:bg-orange-500 transition duration-300">
    Hover over me to change the background color.
  </div>
  <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-300">
    Tailwind Button
  </button>
  <div class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
    Gradient Text Example
  </div>
</body>
</html>







