import React, { useCallback, useRef } from 'react';
import { UploadedFile } from '../types';
import { UploadIcon } from './Icons';
import * as mammoth from 'mammoth/mammoth.browser';

interface FileUploaderProps {
  onFilesAdded: (files: UploadedFile[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesAdded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const uploadedFiles: UploadedFile[] = [];

      for (const file of files) {
        // Basic validation
        if (file.size > 20 * 1024 * 1024) { // 20MB limit per file for demo
           alert(`File ${file.name} is too large. Max 20MB.`);
           continue;
        }

        try {
          let base64Data = '';
          let mimeType = file.type || 'application/octet-stream';

          if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
            try {
              const arrayBuffer = await file.arrayBuffer();
              const result = await mammoth.extractRawText({ arrayBuffer });
              const text = result.value || ' ';
              
              // Base64 encode utf-8 string
              base64Data = btoa(unescape(encodeURIComponent(text)));
              mimeType = 'text/plain';
            } catch (err) {
              console.error("Failed to extract DOCX", err);
              alert(`Failed to parse DOCX document: ${file.name}`);
              continue;
            }
          } else {
            base64Data = await readFileAsBase64(file);
          }

          uploadedFiles.push({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            mimeType: mimeType,
            data: base64Data,
            size: file.size
          });
        } catch (err) {
          console.error("Error reading file", file.name, err);
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesAdded(uploadedFiles);
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onFilesAdded]);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as string'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="p-4 bg-slate-100 border-b border-slate-200">
      <div 
        className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors duration-200"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept=".pdf,.txt,.md,.json,.doc,.docx" 
          onChange={handleFileChange}
        />
        <UploadIcon className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">Click to upload knowledge base</p>
        <p className="text-xs text-slate-400 mt-1">Supported: PDF, TXT, MD, JSON, DOC, DOCX</p>
      </div>
    </div>
  );
};