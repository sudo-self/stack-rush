import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import SplitPane from 'split-pane-react';
import JSZip from 'jszip';
import 'split-pane-react/esm/themes/default.css';
import './App.css';

type FileType = 'html' | 'css' | 'js';

interface File {
  name: string;
  content: string;
  type: FileType;
}

function App() {
  const [files, setFiles] = useState<File[]>([
    { name: 'index.html', content: '<div class="hello">Hello World</div>', type: 'html' },
    { name: 'styles.css', content: '.hello { color: blue; }', type: 'css' },
    { name: 'script.js', content: 'console.log("Hello from JS!");', type: 'js' }
  ]);
  
  const [activeFile, setActiveFile] = useState<File>(files[0]);
  const [sizes, setSizes] = useState<number[]>([20, 40, 40]);
  const [preview, setPreview] = useState<string>('');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<FileType>('html');

  useEffect(() => {
    const html = files.find(f => f.type === 'html')?.content || '';
    const css = files.find(f => f.type === 'css')?.content || '';
    const js = files.find(f => f.type === 'js')?.content || '';
    
    const combinedContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
    
    setPreview(combinedContent);
  }, [files]);

  const handleFileChange = (value: string | undefined) => {
    if (!value) return;
    
    const updatedFiles = files.map(file => 
      file.name === activeFile.name ? { ...file, content: value } : file
    );
    setFiles(updatedFiles);
  };

  const handleShare = () => {
    const data = {
      files: files.map(({ name, content, type }) => ({ name, content, type }))
    };
    const encodedData = encodeURIComponent(JSON.stringify(data));
    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodedData}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Share URL copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleExport = async () => {
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.name, file.content);
    });
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codepen-clone-project.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmbed = () => {
    const code = `<iframe 
  src="${window.location.href}"
  style="width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden;"
  title="CodePen Clone"
  loading="lazy"
></iframe>`;
    setEmbedCode(code);
    setShowEmbedModal(true);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => alert('Embed code copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleCreateFile = () => {
    if (!newFileName) return;

    const extension = newFileType === 'html' ? '.html' : 
                     newFileType === 'css' ? '.css' : '.js';
    
    const fileName = newFileName.endsWith(extension) ? 
                    newFileName : 
                    `${newFileName}${extension}`;

    const newFile: File = {
      name: fileName,
      content: '',
      type: newFileType
    };

    setFiles([...files, newFile]);
    setActiveFile(newFile);
    setShowNewFileModal(false);
    setNewFileName('');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectData = params.get('project');
    
    if (projectData) {
      try {
        const { files: sharedFiles } = JSON.parse(decodeURIComponent(projectData));
        setFiles(sharedFiles);
        setActiveFile(sharedFiles[0]);
      } catch (err) {
        console.error('Failed to load shared project:', err);
      }
    }
  }, []);

  return (
    <div className="app-container">
      <SplitPane split="vertical" sizes={sizes} onChange={setSizes}>
        <div className="files-panel">
          <h2>
            Files
            <button 
              className="new-file-button" 
              onClick={() => setShowNewFileModal(true)}
              title="Create new file"
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
              {file.name}
            </div>
          ))}
        </div>
        <div className="editor-panel">
          <Editor
            height="100%"
            defaultLanguage={activeFile.type}
            value={activeFile.content}
            onChange={handleFileChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on'
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

      {showEmbedModal && (
        <div className="modal-overlay" onClick={() => setShowEmbedModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Embed Code</h2>
              <button className="modal-close" onClick={() => setShowEmbedModal(false)}>×</button>
            </div>
            <div className="embed-code">{embedCode}</div>
            <button className="copy-button" onClick={handleCopyEmbed}>
              Copy Embed Code
            </button>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="modal-overlay" onClick={() => setShowNewFileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New File</h2>
              <button className="modal-close" onClick={() => setShowNewFileModal(false)}>×</button>
            </div>
            <div className="new-file-form">
              <input
                type="text"
                placeholder="File name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <select
                value={newFileType}
                onChange={(e) => setNewFileType(e.target.value as FileType)}
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="js">JavaScript</option>
              </select>
              <div className="form-buttons">
                <button className="action-button" onClick={handleCreateFile}>Create</button>
                <button className="action-button" onClick={() => setShowNewFileModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;