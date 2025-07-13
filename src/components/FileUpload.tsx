import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ProcessedFile } from '../types';
import { extractTextWithProgress, validatePDFFile } from '../utils/pdfProcessor';

interface FileUploadProps {
  onFilesProcessed: (files: ProcessedFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
      setError('Please select valid PDF files only.');
      return;
    }

    if (pdfFiles.length > 10) {
      setError('Maximum 10 files allowed at once.');
      return;
    }

    // Validate all files first
    for (const file of pdfFiles) {
      const validation = validatePDFFile(file);
      if (!validation.isValid) {
        setError(`${file.name}: ${validation.error}`);
        return;
      }
    }

    setError(null);
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Starting PDF processing...');

    try {
      const processedFiles: ProcessedFile[] = [];
      
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        setCurrentFileName(file.name);
        const startTime = Date.now();
        
        try {
          const extractedText = await extractTextWithProgress(
            file,
            (progress, status) => {
              const fileProgress = (i / pdfFiles.length) * 100 + (progress / pdfFiles.length);
              setProcessingProgress(fileProgress);
              setProcessingStatus(`${file.name}: ${status}`);
            }
          );
          
          const processingTime = Date.now() - startTime;
          
          processedFiles.push({
            name: file.name,
            extractedText,
            originalFile: file,
            processingTime
          });
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
          setError(`Failed to process ${file.name}: ${err.message}`);
          setIsProcessing(false);
          return;
        }
      }

      setProcessingStatus('All files processed successfully!');
      onFilesProcessed(processedFiles);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus('');
      setCurrentFileName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Upload className="mr-2 h-5 w-5" />
        Upload PDF Files
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'pointer-events-none opacity-75' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <div>
              <p className="text-gray-600 font-medium">Processing PDF files...</p>
              {currentFileName && (
                <p className="text-sm text-gray-500 mt-1">Current: {currentFileName}</p>
              )}
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{Math.round(processingProgress)}% complete</p>
              {processingStatus && (
                <p className="text-xs text-blue-600 mt-1">{processingStatus}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop PDF files here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports multiple files (max 10), up to 10MB each
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>• Supported format: PDF</p>
        <p>• Maximum file size: 50MB per file</p>
        <p>• Text extraction preserves basic formatting</p>
        <p>• Supports encrypted PDFs (password-protected files may require manual input)</p>
      </div>
    </div>
  );
};

export default FileUpload;