import React from 'react';
import { Message, Sender } from '../types';
import { SparklesIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

// Advanced renderer to handle Bold text (**text**) and Source citations ([Source: filename])
const renderContent = (text: string) => {
  // 1. Split by Source tags: [Source: filename]
  const sourceParts = text.split(/(\[Source: .*?\])/g);
  
  return sourceParts.map((part, i) => {
    // Handle Source Tag
    if (part.startsWith('[Source: ') && part.endsWith(']')) {
      const fileName = part.replace('[Source: ', '').replace(']', '');
      return (
        <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-medium tracking-tight align-middle select-none" title={`Source: ${fileName}`}>
           <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
           {fileName}
        </span>
      );
    }

    // Handle Markdown Bold
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((subPart, j) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
            return <strong key={`${i}-${j}`} className="font-bold text-indigo-900 bg-indigo-50/50 px-0.5 rounded">{subPart.slice(2, -2)}</strong>;
        }
        return subPart;
    });
  });
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  // Extract Confidence tag if present (e.g. [Confidence: High])
  let confidenceLevel: string | null = null;
  let cleanText = message.text;

  if (!isUser) {
    const match = message.text.match(/^\[Confidence: (High|Medium|Low)\]/i);
    if (match) {
      confidenceLevel = match[1];
      cleanText = message.text.replace(/^\[Confidence: (High|Medium|Low)\]/i, '').trim();
    }
  }

  const getConfidenceBadge = (level: string) => {
    const styles = {
      High: 'bg-green-100 text-green-700 border-green-200',
      Medium: 'bg-amber-100 text-amber-700 border-amber-200',
      Low: 'bg-red-100 text-red-700 border-red-200',
    };
    const style = styles[level as keyof typeof styles] || styles.Medium;

    return (
      <div className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border mb-3 inline-block ${style}`}>
        Confidence: {level}
      </div>
    );
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8 group`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-slate-200' : 'bg-indigo-600 text-white'
        }`}>
          {isUser ? (
            <span className="text-xs font-bold text-slate-600">You</span>
          ) : (
            <SparklesIcon className="w-5 h-5" />
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-6 py-4 rounded-2xl text-sm leading-7 shadow-sm ${
            isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
          } ${message.isError ? 'border-red-300 bg-red-50 text-red-800' : ''}`}>
            
            {/* Confidence Badge (Bot Only) */}
            {!isUser && confidenceLevel && getConfidenceBadge(confidenceLevel)}

            {/* Message Content */}
            <div className="whitespace-pre-wrap">
              {renderContent(cleanText)}
            </div>

          </div>
          <span className="text-[10px] text-slate-400 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};