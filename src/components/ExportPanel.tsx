import React, { useState } from 'react';
import { Download, FileText, FileCode, File } from 'lucide-react';
import { saveAs } from 'file-saver';
import { ExportFormat } from '../types';

interface ExportPanelProps {
  text: string;
  filename: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({ text, filename }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const exportFormats: ExportFormat[] = [
    {
      id: 'txt',
      name: 'Plain Text',
      extension: 'txt',
      mimeType: 'text/plain',
      icon: 'FileText'
    },
    {
      id: 'html',
      name: 'HTML Document',
      extension: 'html',
      mimeType: 'text/html',
      icon: 'FileCode'
    },
    {
      id: 'docx',
      name: 'Word Document',
      extension: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      icon: 'File'
    }
  ];

  const exportAsText = (format: ExportFormat) => {
    let content = text;
    let blob: Blob;

    switch (format.id) {
      case 'txt':
        blob = new Blob([content], { type: format.mimeType });
        break;
      case 'html':
        content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <h1>${filename}</h1>
    <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>`;
        blob = new Blob([content], { type: format.mimeType });
        break;
      case 'docx':
        // Simple DOCX creation using HTML
        const htmlContent = `
          <html>
            <head>
              <meta charset="utf-8">
              <title>${filename}</title>
            </head>
            <body>
              <h1>${filename}</h1>
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${text}</pre>
            </body>
          </html>
        `;
        blob = new Blob(['\ufeff', htmlContent], { type: format.mimeType });
        break;
      default:
        blob = new Blob([content], { type: 'text/plain' });
    }

    saveAs(blob, `${filename}.${format.extension}`);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format.id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
      exportAsText(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText;
      case 'FileCode':
        return FileCode;
      case 'File':
        return File;
      default:
        return FileText;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Download className="mr-2 h-5 w-5" />
        Export Options
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportFormats.map((format) => {
          const IconComponent = getIcon(format.icon);
          const isLoading = isExporting === format.id;

          return (
            <button
              key={format.id}
              onClick={() => handleExport(format)}
              disabled={isLoading || !text.trim()}
              className={`group relative p-4 border-2 border-gray-200 rounded-lg transition-all duration-200 ${
                !text.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-blue-300 hover:shadow-md cursor-pointer'
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-full mb-3 transition-colors duration-200 ${
                  !text.trim() 
                    ? 'bg-gray-100' 
                    : 'bg-gray-100 group-hover:bg-blue-100'
                }`}>
                  <IconComponent className={`h-6 w-6 ${
                    !text.trim() 
                      ? 'text-gray-400' 
                      : 'text-gray-600 group-hover:text-blue-600'
                  }`} />
                </div>
                <h4 className="font-medium text-gray-800 mb-1">{format.name}</h4>
                <p className="text-sm text-gray-500">.{format.extension}</p>
              </div>
            </button>
          );
        })}
      </div>

      {!text.trim() && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Upload and process a PDF file to enable export options
        </p>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Export Information</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Plain Text: Basic text format, preserves line breaks</li>
          <li>• HTML: Web-friendly format with basic styling</li>
          <li>• Word Document: Compatible with Microsoft Word and similar applications</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportPanel;