/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Brain, LayoutGrid, ClipboardCheck, ArrowLeft, Loader2, Sparkle, UploadCloud, X } from 'lucide-react';
import { generateStudyMaterials, StudyMaterials } from './services/geminiService';
import Flashcard from './components/Flashcard';
import Quiz from './components/Quiz';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ file: File; base64: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterials | null>(null);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        setSelectedFile({ file, base64: base64String });
        setInputText(''); // Clear text when file is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setIsLoading(true);
    try {
      let result;
      if (selectedFile) {
        result = await generateStudyMaterials({
          type: 'file',
          name: selectedFile.file.name,
          mimeType: selectedFile.file.type || 'application/octet-stream',
          data: selectedFile.base64
        });
      } else {
        result = await generateStudyMaterials({
          type: 'text',
          content: inputText
        });
      }
      setMaterials(result);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate study materials. Please check your text and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleText = () => {
    setInputText(`Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities. This chemical energy is stored in carbohydrate molecules, such as sugars and starches, which are synthesized from carbon dioxide and water. In most cases, oxygen is also released as a waste product. Most plants, algae, and cyanobacteria perform photosynthesis; such organisms are called photoautotrophs. Photosynthesis is largely responsible for producing and maintaining the oxygen content of the Earth's atmosphere, and supplies most of the energy necessary for life on Earth. The first photosynthetic organisms probably evolved early in the evolutionary history of life and most likely used reducing agents such as hydrogen or hydrogen sulfide, rather than water, as sources of electrons.`);
    setSelectedFile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F9FAFB]" id="loading-state">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200"
        >
          <Sparkle className="text-indigo-600 w-12 h-12" />
        </motion.div>
        <h2 className="font-serif text-3xl text-slate-800 mb-2 italic tracking-tight">Analyzing source material...</h2>
        <p className="text-slate-500 font-sans">Our AI is extracting core insights for your study kit.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col h-full overflow-hidden">
      {/* Header */}
      <nav className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight text-lg text-slate-900">Lumos Study <span className="italic font-normal text-indigo-600">AI</span></span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Ready</span>
          </div>
          {materials && (
            <button 
              onClick={() => { setMaterials(null); setInputText(''); }}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
              id="btn-start-over"
            >
              New Generation
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {!materials ? (
            <motion.section 
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F9FAFB]"
              id="input-section"
            >
              <div className="max-w-3xl w-full text-center mb-12">
                <h2 className="font-serif text-5xl md:text-6xl text-slate-900 mb-6 tracking-tight">
                  Focus on the <span className="italic">essence.</span>
                </h2>
                <p className="text-lg text-slate-500 font-sans max-w-xl mx-auto leading-relaxed">
                  Paste your raw study notes or articles. We'll extract the core concepts and craft a professional study kit.
                </p>
              </div>

              <div className="max-w-3xl w-full bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
                {selectedFile ? (
                  <div className="w-full h-80 flex flex-col items-center justify-center p-8 rounded-xl bg-indigo-50/50 border-2 border-dashed border-indigo-200 relative">
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="absolute top-4 right-4 p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-indigo-100 mb-4 text-indigo-600">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1 truncate max-w-xs">{selectedFile.file.name}</h3>
                    <p className="text-sm text-slate-500">{(selectedFile.file.size / 1024 / 1024).toFixed(1)} MB • {selectedFile.file.type || 'Document'}</p>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your source text here..."
                      className="w-full h-80 p-8 pb-16 rounded-xl resize-none font-sans text-lg focus:outline-none placeholder:text-slate-300"
                      id="source-text-input"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 cursor-pointer w-fit transition-colors">
                        <UploadCloud size={16} className="text-indigo-500" />
                        <span>Upload Document</span>
                        <span className="text-xs text-slate-400 font-normal ml-1">(PDF, DOCX, PPTX)</span>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFileUpload} />
                      </label>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-xl">
                  <button 
                    onClick={handleSampleText}
                    className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                    id="btn-sample-text"
                  >
                    Use Sample Text
                  </button>
                  <button 
                    onClick={handleGenerate}
                    disabled={!inputText.trim()}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition-all ${
                      inputText.trim() 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100" 
                        : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                    }`}
                    id="btn-generate"
                  >
                    <Sparkles size={18} />
                    Generate
                  </button>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl">
                {[
                  { icon: Brain, title: "Source Analysis", desc: "AI-driven extraction of key concepts." },
                  { icon: LayoutGrid, title: "Minimal Design", desc: "Non-distracting study environment." },
                  { icon: ClipboardCheck, title: "Efficiency Check", desc: "Instant quiz for knowledge validation." }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 items-start px-4">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                      <feature.icon size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-widest mb-1">{feature.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex overflow-hidden"
              id="results-section"
            >
              {/* Sidebar: Source & Metadata */}
              <aside className="w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0">
                <div className="p-8 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 block">Source Analysis</label>
                  <h2 className="text-2xl font-semibold mb-1 italic font-serif text-slate-800 tracking-tight leading-tight">
                    {materials.metadata.topic}
                  </h2>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Concepts</span>
                      <span className="text-sm font-mono font-bold text-indigo-600">{materials.flashcards.length} Cards</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-sm text-slate-500">Study Time</span>
                      <span className="text-sm font-mono font-bold">{materials.metadata.estimated_study_time}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-500">Quiz</span>
                      <span className="text-sm font-mono font-bold">{materials.quiz.length} Questions</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-8 overflow-hidden flex flex-col">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 block">Navigation</label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveTab('flashcards')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'flashcards' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                      id="tab-flashcards"
                    >
                      <LayoutGrid size={18} />
                      Flashcards
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'quiz' ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
                      id="tab-quiz"
                    >
                      <ClipboardCheck size={18} />
                      Practice Quiz
                    </button>
                  </div>

                  <div className="mt-auto bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest text-center">Study Progress</p>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-1/3" />
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main content Area */}
              <div className="flex-1 bg-[#F3F4F6] p-10 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'flashcards' ? (
                    <motion.div 
                      key="fc-grid"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="max-w-5xl mx-auto"
                      id="flashcards-grid"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Recall Cards</h3>
                        <div className="text-xs text-slate-400">Scroll to view all</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.flashcards.map((card) => (
                          <Flashcard key={card.id} card={card} />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="quiz-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="max-w-3xl mx-auto"
                      id="quiz-view"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Knowledge Validation</h3>
                      </div>
                      <Quiz questions={materials.quiz} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

