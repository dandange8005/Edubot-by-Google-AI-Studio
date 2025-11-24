import React from 'react';
import { UploadedFile } from '../types';
import { FileIcon, TrashIcon, BrainIcon, LogOutIcon } from './Icons';
import { FileUploader } from './FileUploader';

interface SidebarProps {
  files: UploadedFile[];
  activeBotTitle: string;
  onRemoveFile: (id: string) => void;
  onFilesAdded: (files: UploadedFile[]) => void;
  isInstructor: boolean;
  onBackToDashboard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  activeBotTitle,
  onRemoveFile, 
  onFilesAdded, 
  isInstructor,
  onBackToDashboard 
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const k = 1024;
    const sizes = ['KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-xl z-10 hidden md:flex text-white transition-all duration-300">
      <div className="p-6 border-b border-slate-800">
        <button 
           onClick={onBackToDashboard}
           className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 text-xs font-medium transition-colors"
        >
           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
           Back to Dashboard
        </button>
        
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${isInstructor ? 'bg-indigo-600 shadow-indigo-900/50' : 'bg-emerald-600 shadow-emerald-900/50'}`}>
            <BrainIcon className="w-6 h-6 text-white" />
            </div>
            <div>
            <h1 className="font-bold text-white text-lg leading-tight tracking-tight truncate w-48" title={activeBotTitle}>
                {activeBotTitle}
            </h1>
            <p className={`text-xs font-medium ${isInstructor ? 'text-indigo-300' : 'text-emerald-300'}`}>
                {isInstructor ? 'Instructor View' : 'Student View'}
            </p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Knowledge Base</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isInstructor ? 'bg-indigo-900/50 text-indigo-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                    {isInstructor ? 'Editable' : 'Read Only'}
                </span>
            </div>
            
            {files.length === 0 ? (
                <div className="text-center py-10 px-4 border border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                    <p className="text-sm text-slate-400 mb-2 font-medium">No materials available</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {isInstructor ? "Upload syllabi, textbooks, or lecture notes for this assessment." : "Your instructor hasn't uploaded any materials yet."}
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                {files.map((file) => (
                    <li key={file.id} className="group flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all">
                    <FileIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isInstructor ? 'text-indigo-400' : 'text-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatSize(file.size)} • {file.mimeType.split('/')[1].toUpperCase()}</p>
                    </div>
                    {isInstructor && (
                        <button 
                            onClick={() => onRemoveFile(file.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded-md text-slate-500 hover:text-red-400 transition-all"
                            title="Remove file"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                    </li>
                ))}
                </ul>
            )}
        </div>
      </div>

      {isInstructor ? (
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <FileUploader onFilesAdded={onFilesAdded} />
          </div>
      ) : (
          <div className="p-6 bg-slate-800/50 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center">
                You are in student view. <br/>Only instructors can manage files.
            </p>
          </div>
      )}
    </div>
  );
};