import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import TextEditor from './components/TextEditor';
import ExportPanel from './components/ExportPanel';
import { ProcessedFile } from './types';

function App() {
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  const handleFilesProcessed = (files: ProcessedFile[]) => {
    setProcessedFiles(files);
    setActiveFileIndex(0);
  };

  const handleTextChange = (newText: string) => {
    if (processedFiles.length > 0) {
      const updatedFiles = [...processedFiles];
      updatedFiles[activeFileIndex] = {
        ...updatedFiles[activeFileIndex],
        extractedText: newText
      };
      setProcessedFiles(updatedFiles);
    }
  };

  const activeFile = processedFiles[activeFileIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            PDF to Text Converter
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload your PDF documents and convert them to editable text with export options for Word, HTML, and plain text formats.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <FileUpload onFilesProcessed={handleFilesProcessed} />
            
            {/* File Navigation */}
            {processedFiles.length > 1 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Processed Files</h3>
                <div className="space-y-2">
                  {processedFiles.map((file, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFileIndex(index)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        index === activeFileIndex
                          ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {file.extractedText.length} characters
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Editor Section */}
          <div className="lg:col-span-2">
            {activeFile ? (
              <>
                <TextEditor
                  text={activeFile.extractedText}
                  filename={activeFile.name}
                  onTextChange={handleTextChange}
                />
                <div className="mt-6">
                  <ExportPanel
                    text={activeFile.extractedText}
                    filename={activeFile.name.replace('.pdf', '')}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No PDF Selected
                </h3>
                <p className="text-gray-500">
                  Upload a PDF file to start extracting and editing text
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;