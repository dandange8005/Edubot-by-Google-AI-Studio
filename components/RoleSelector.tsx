import React from 'react';
import { AcademicCapIcon, UserIcon, BrainIcon } from './Icons';

interface RoleSelectorProps {
  onSelectRole: (role: 'student' | 'instructor') => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-6">
          <BrainIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Welcome to EduBot</h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Your privacy-first academic AI assistant. Please select your role to continue.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Student Card */}
        <button 
          onClick={() => onSelectRole('student')}
          className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">I am a Student</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Get instant answers to coursework questions based on uploaded materials. 
              Access 24/7 support without waiting for office hours.
            </p>
            <div className="mt-6 flex items-center text-emerald-600 font-semibold text-sm">
              Start Learning 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </button>

        {/* Instructor Card */}
        <button 
          onClick={() => onSelectRole('instructor')}
          className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">I am an Instructor</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload course materials, syllabi, and FAQs. 
              Manage the knowledge base and ensure academic integrity.
            </p>
            <div className="mt-6 flex items-center text-indigo-600 font-semibold text-sm">
              Manage Course
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </button>
      </div>
      
      <p className="mt-12 text-xs text-slate-400 text-center max-w-lg space-y-2">
        <span>EduBot ensures data privacy by processing queries contextually without training on student data.</span>
        <br/>
        <span>🌍 <strong>Sustainability Note:</strong> We use lightweight AI models to minimize this system's environmental footprint.</span>
        <br/><br/>
        <span>By selecting a role, you agree to participate in this prototype test. <a href="#" onClick={(e) => { e.preventDefault(); alert("Opt-out recorded. You may close this window."); }} className="underline hover:text-slate-600">Opt-out here</a>.</span>
        <br/>
        <span className="text-slate-300">Version 1.0.0 MVP</span>
      </p>
    </div>
  );
};
