'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function URLOpener() {
  const [url, setUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = event.clipboardData.getData('text');
    setUrl(pastedUrl);
  };

  const openURL = () => {
    setIsOpen(true);
  };

  const closeURL = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, [isOpen, url]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <h4 className="text-2xl font-semibold mb-4 text-gray-800">WebViewer</h4>

        <div className="mb-4">
          <input
            type="url"
            id="url"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://"
            value={url}
            onChange={handleInputChange}
            onPaste={handlePaste}
          />
        </div>

        <div className="flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            onClick={openURL}
            disabled={!url}
          >
            Open URL
          </button>
        </div>
      </div>

      {isOpen && (
                  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-7xl h-[90%] flex flex-col">
                      <div className="p-4 flex justify-between items-center bg-gray-100 rounded-t-xl">
                        <h2 className="text-lg font-semibold text-gray-800">Webview</h2>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded focus:outline-none"
                          onClick={closeURL}
                        >
                          Close
                        </button>
                      </div>
                      <iframe
                        ref={iframeRef}
                        title="WebViewer"
                        className="w-full h-full rounded-b-xl"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  </div>

      )}
    </div>
  );
}

