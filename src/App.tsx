import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import SplitPane from 'split-pane-react';
import JSZip from 'jszip';
import 'split-pane-react/esm/themes/default.css';
import './App.css';
import { marked } from 'marked';

type FileType = 'html' | 'css' | 'js' | 'md';

interface File {
  name: string;
  content: string;
  type: FileType;
}

function App() {
  const [files, setFiles] = useState<File[]>([
    { name: 'index.html', content: '<div class="hello">Welcome to Stack Rush by JR!</div>', type: 'html' },
    { name: 'styles.css', content: '.hello { color: blue; }', type: 'css' },
    { name: 'script.js', content: 'console.log("stack-rush from JS!");', type: 'js' },
    { name: 'README.md', content: '# Stack Rush\n\nExport ZIP for a ready-to-deploy website!', type: 'md' },
  ]);

  const [activeFile, setActiveFile] = useState<File>(files[0]);
  const [sizes, setSizes] = useState<number[]>([20, 40, 40]);
  const [preview, setPreview] = useState<string>('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('html');
  const [theme, setTheme] = useState('vs-dark');
  const [renameFile, setRenameFile] = useState<string | null>(null);
  const [newFileNameForRename, setNewFileNameForRename] = useState<string>('');

  useEffect(() => {
    const html = files.find(f => f.type === 'html')?.content || '';
    const css = files.find(f => f.type === 'css')?.content || '';
    const js = files.find(f => f.type === 'js')?.content || '';
    const md = files.find(f => f.type === 'md')?.content || '';

    let combined = '';

    if (activeFile.type === 'md') {
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
            ${marked(md)}
          </body>
        </html>
      `;
    } else {
      combined = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>${js}</script>
          </body>
        </html>
      `;
    }

    setPreview(combined);
  }, [files, activeFile]);

  const handleFileChange = (value: string | undefined) => {
    if (!value) return;
    setFiles(files.map(file =>
      file.name === activeFile.name ? { ...file, content: value } : file
    ));
  };

  const handleShare = () => {
    const encoded = encodeURIComponent(JSON.stringify({ files }));
    const url = `${window.location.origin}${window.location.pathname}?project=${encoded}`;
    navigator.clipboard.writeText(url).then(() => alert('Share URL copied!'));
  };

  const handleDeleteFile = (fileName: string) => {
    const updated = files.filter(f => f.name !== fileName);
    setFiles(updated);
    if (activeFile.name === fileName) setActiveFile(updated[0] || files[0]);
  };

  const handleRenameFile = (fileName: string) => {
    setRenameFile(fileName);
    const fileToRename = files.find(f => f.name === fileName);
    if (fileToRename) setNewFileNameForRename(fileToRename.name);
  };

  const handleSaveRename = () => {
    if (!newFileNameForRename.trim()) return;
    setFiles(files.map(file =>
      file.name === renameFile ? { ...file, name: newFileNameForRename } : file
    ));
    setRenameFile(null);
  };

  const handleExport = async () => {
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyWebsite.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmbed = () => {
    const code = `<iframe 
  src="${window.location.href}"
  style="width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden;"
  title="stack-rush"
  loading="lazy"
></iframe>`;
    setEmbedCode(code);
    setShowEmbedModal(true);
  };

  const handleCreateFile = () => {
    if (!newFileName) return;
    const ext = newFileType === 'html' ? '.html' : newFileType === 'css' ? '.css' : newFileType === 'js' ? '.js' : '.md';
    const fullName = newFileName.endsWith(ext) ? newFileName : `${newFileName}${ext}`;
    const newFile: File = { name: fullName, content: '', type: newFileType };
    setFiles([...files, newFile]);
    setActiveFile(newFile);
    setShowNewFileModal(false);
    setNewFileName('');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const project = params.get('project');
    if (project) {
      try {
        const { files: loaded } = JSON.parse(decodeURIComponent(project));
        setFiles(loaded);
        setActiveFile(loaded[0]);
      } catch (err) {
        console.error('Invalid shared project:', err);
      }
    }
  }, []);

  return (
    <div className="app-container">
      <div className="theme-switcher" style={{ padding: '8px', textAlign: 'right' }}>
        <label style={{ marginRight: '8px' }}>Welcome to Stack Rush!&nbsp;</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="vs-dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <SplitPane
        split="vertical"
        sizes={sizes}
        onChange={setSizes}
        sashRender={(_, active) => (
          <div
            style={{
              width: '4px',
              background: active ? '#007bff' : '#ccc',
              cursor: 'col-resize'
            }}
          />
        )}
      >
        <div className="files-panel">
          <h2>
            Project Files
            <button
              className="new-file-button"
              onClick={() => setShowNewFileModal(true)}
              title="Add New File"
            >
              +
            </button>
          </h2>
          {files.map(file => (
            <div
              key={file.name}
              className={`file-item ${file.name === activeFile.name ? 'active' : ''}`}
              onClick={() => setActiveFile(file)}
            >
              {renameFile === file.name ? (
                <div>
                  <input
                    type="text"
                    value={newFileNameForRename}
                    onChange={(e) => setNewFileNameForRename(e.target.value)}
                  />
                  <button onClick={handleSaveRename}>Save</button>
                </div>
              ) : (
                <>
                  {file.name}
                  <button onClick={() => handleRenameFile(file.name)}>&nbsp;&nbsp;Rename</button>&nbsp;&nbsp;
                  <button onClick={() => handleDeleteFile(file.name)}>&nbsp;&nbsp;Delete</button>
                </>
              )}
            </div>
          ))}
        </div>

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
              wordWrap: 'on',
              padding: { top: 30 },
            }}
          />
        </div>

        <div className="preview-panel">
          <div className="button-panel">
            <button className="action-button" onClick={handleShare}>Share</button>
            <button className="action-button" onClick={handleExport}>Export</button>
            <button className="action-button" onClick={handleEmbed}>Embed</button>
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

      <footer style={{ textAlign: 'center', padding: '12px', fontSize: '14px' }}>
        <a
          href="https://stack-rush.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          web.JesseJesse.com
        </a>
      </footer>

      {/* Modal for creating a new file */}
      {showNewFileModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New File</h2>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name"
            />
            <select
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value as FileType)}
            >
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="js">JavaScript</option>
              <option value="md">Markdown</option>
            </select>
            <button onClick={handleCreateFile}>Create</button>
            <button onClick={() => setShowNewFileModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Modal for embedding */}
      {showEmbedModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Embed Code</h2>
            <textarea
              rows={4}
              value={embedCode}
              readOnly
            />
            <button onClick={() => setShowEmbedModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;





