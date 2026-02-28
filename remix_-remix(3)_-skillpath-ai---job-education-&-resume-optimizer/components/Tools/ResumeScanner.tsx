
import React, { useState, useRef } from 'react';
import Markdown from 'react-markdown';
import { analyzeResume } from '../../services/geminiService';
import { ResumeScanResult } from '../../types';

const ResumeScanner: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ResumeScanResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setSelectedFile({
          name: file.name,
          data: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    if ((!resumeText && !selectedFile) || !jobTitle) return;
    setScanning(true);
    try {
      const resumeData = selectedFile 
        ? { file: { data: selectedFile.data, mimeType: selectedFile.mimeType } }
        : { text: resumeText };
        
      const analysis = await analyzeResume(resumeData, jobTitle);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      alert('Scanning failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Resume AI Optimizer</h2>
        <p className="text-gray-500 mb-8 text-lg">Upload your resume PDF or paste content to find missing gaps for your dream job.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Job Role</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Senior Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Resume Document</label>
            
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-medium text-gray-700">Click to upload PDF resume</p>
                <p className="text-sm text-gray-400 mt-1">or drag and drop your file here</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">
                    PDF
                  </div>
                  <div>
                    <p className="font-bold text-indigo-900 truncate max-w-[200px] md:max-w-xs">{selectedFile.name}</p>
                    <p className="text-xs text-indigo-600">Ready for AI analysis</p>
                  </div>
                </div>
                <button 
                  onClick={removeFile}
                  className="p-2 text-indigo-400 hover:text-red-500 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {!selectedFile && (
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">OR PASTE TEXT</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>
            )}

            {!selectedFile && (
              <textarea
                className="w-full h-40 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Paste your professional experience, skills, and summary if you don't have a PDF..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={scanning || (!resumeText && !selectedFile) || !jobTitle}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:-translate-y-1 ${
              scanning ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {scanning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is reading your resume...
              </span>
            ) : 'Analyze Resume'}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-medium mb-4">Job Match Score</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="#4f46e5" strokeWidth="12" 
                  strokeDasharray={`${2 * Math.PI * 70}`} 
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.score / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-4xl font-black text-gray-800">{result.score}%</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gaps Detected</h3>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? result.missingSkills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                  {skill}
                </span>
              )) : <p className="text-gray-400 italic">No major skill gaps identified!</p>}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 md:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Step-by-Step Improvements</h3>
            <ul className="space-y-4">
              {result.improvementTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">{i+1}</div>
                  <div className="text-gray-600 leading-relaxed markdown-body">
                    <Markdown>{tip}</Markdown>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeScanner;
