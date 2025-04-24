'use client';

'use client';

import React, { useState } from 'react';

interface CloudflareDeployButtonProps {
  onClose: () => void;
}

const CloudflareDeployButton: React.FC<CloudflareDeployButtonProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [repo, setRepo] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [buttonPreviewUrl, setButtonPreviewUrl] = useState('');

  const handleGenerateButtonCode = () => {
    const deployUrl = `https://deploy.workers.cloudflare.com/?url=https://github.com/${username}/${repo}`;
    const code = `
<center>
  <a href="${deployUrl}">
    <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare Workers" />
  </a>
</center>
    `;
    setEmbedCode(code);
    setButtonPreviewUrl(deployUrl);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };
    



  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Cloudflare Deploy Button</h2>
        <div className="mb-4">
          <label>Username&nbsp;</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub Username"
            className="input-field"
          />
        </div>
        <div className="mb-4">
          <label>Repo&nbsp;</label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="Enter Repository Name"
            className="input-field"
          />
        </div>
        <button onClick={handleGenerateButtonCode}>Generate Button Code</button>
        {embedCode && (
          <div>
            <h3>Embed Code:</h3>
            <textarea readOnly value={embedCode} rows={6} cols={50} />
            <button onClick={handleCopyCode}>Copy Code</button>
          </div>
        )}
        {buttonPreviewUrl && (
          <div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <a href={buttonPreviewUrl}>
                <img
                  src="https://deploy.workers.cloudflare.com/button"
                  alt="Deploy to Cloudflare"
                />
              </a>
            </div>
          </div>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CloudflareDeployButton;
