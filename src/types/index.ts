export interface ProcessedFile {
  name: string;
  extractedText: string;
  originalFile: File;
  processingTime: number;
}

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  icon: string;
}