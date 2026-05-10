import React, { useState } from 'react';
import { Bot } from '../types';
import { BrainIcon, TrashIcon, AcademicCapIcon, UserIcon, LogOutIcon, ChartBarIcon } from './Icons';

interface BotDashboardProps {
  bots: Bot[];
  isInstructor: boolean;
  onSelectBot: (botId: string) => void;
  onCreateBot: (title: string, description: string) => void;
  onDeleteBot: (botId: string) => void;
  onSwitchRole: () => void;
}

export const BotDashboard: React.FC<BotDashboardProps> = ({
  bots,
  isInstructor,
  onSelectBot,
  onCreateBot,
  onDeleteBot,
  onSwitchRole
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBotTitle, setNewBotTitle] = useState('');
  const [newBotDesc, setNewBotDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBotTitle.trim()) {
      onCreateBot(newBotTitle, newBotDesc);
      setNewBotTitle('');
      setNewBotDesc('');
      setShowCreateModal(false);
    }
  };

  const themeColor = isInstructor ? 'indigo' : 'emerald';
  const ThemeIcon = isInstructor ? AcademicCapIcon : UserIcon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${isInstructor ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-600 shadow-emerald-200'}`}>
              <ThemeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">EduBot Dashboard</h1>
              <p className={`text-sm font-medium ${isInstructor ? 'text-indigo-600' : 'text-emerald-600'}`}>
                {isInstructor ? 'Instructor Panel' : 'Student Portal'}
              </p>
            </div>
          </div>
          <button 
            onClick={onSwitchRole}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LogOutIcon className="w-4 h-4" />
            Switch Role
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-slate-800">Available Assessments</h2>
            {isInstructor && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <span>+ Create New Bot</span>
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <BrainIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Assessments Found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  {isInstructor 
                    ? "Get started by creating a new assessment bot for your students." 
                    : "Your instructor hasn't published any assessments yet."}
                </p>
              </div>
            ) : (
              bots.map((bot) => (
                <div 
                  key={bot.id} 
                  onClick={() => onSelectBot(bot.id)}
                  className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer relative flex flex-col h-64"
                >
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                    isInstructor ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                  } group-hover:scale-110 transition-transform duration-300`}>
                    <BrainIcon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{bot.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{bot.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-xs font-medium text-slate-400">
                      {bot.files.length} {bot.files.length === 1 ? 'File' : 'Files'}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isInstructor ? 'text-indigo-600' : 'text-emerald-600'}`}>
                      Open Chat →
                    </span>
                  </div>

                  {isInstructor && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Loading simulated query pattern analytics and conversation logs...\\n\\n(At full build this will show common student confusion points and allow instructor review.)');
                        }}
                        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Analytics & Logs"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Are you sure you want to delete this bot?')) onDeleteBot(bot.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Bot"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Create Assessment Bot</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Econ 101 Midterm"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={newBotTitle}
                  onChange={(e) => setNewBotTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  placeholder="Briefly describe the topic or assessment..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-24"
                  value={newBotDesc}
                  onChange={(e) => setNewBotDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
                >
                  Create Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};