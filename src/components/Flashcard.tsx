import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Lightbulb, FileText, Edit2, Check, Trash2 } from 'lucide-react';
import { Flashcard as FlashcardType } from '../services/geminiService';

interface FlashcardProps {
  card: FlashcardType;
  onUpdate?: (updatedCard: FlashcardType) => void;
  onDelete?: () => void;
}

export default function Flashcard({ card, onUpdate, onDelete }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState(card.front);
  const [editBack, setEditBack] = useState(card.back);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      onUpdate({ ...card, front: editFront, back: editBack });
    }
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  if (isEditing) {
    return (
      <div className="relative w-full h-auto min-h-[14rem] bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Front (Term)</label>
        <textarea 
          className="w-full p-2 text-sm border border-slate-200 rounded focus:border-indigo-400 focus:outline-none resize-none"
          value={editFront}
          onChange={e => setEditFront(e.target.value)}
          rows={2}
        />
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Back (Definition)</label>
        <textarea 
          className="w-full p-2 text-sm border border-slate-200 rounded focus:border-indigo-400 focus:outline-none resize-none"
          value={editBack}
          onChange={e => setEditBack(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-2 mt-auto">
          <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded">Cancel</button>
          <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded"><Check size={14}/> Save</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-[22rem] perspective-1000 group flex flex-col"
    >
      <div className="flex justify-end gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handleEditClick} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
          <Edit2 size={14} />
        </button>
        <button onClick={handleDeleteClick} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
      <div 
        className="relative flex-1 w-full cursor-pointer h-56"
        onClick={() => setIsFlipped(!isFlipped)}
        id={`flashcard-${card.id}`}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-indigo-500 uppercase">Term</span>
            <h2 className="font-sans text-lg md:text-xl font-medium text-slate-800 leading-snug">
              {card.front}
            </h2>
            <div className="absolute bottom-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
              <RefreshCw size={14} className="animate-spin-slow" />
            </div>
            
            {showHint && card.hint && (
              <div className="absolute bottom-12 left-4 right-4 bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800 italic" onClick={e => e.stopPropagation()}>
                💡 {card.hint}
              </div>
            )}
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-white border border-indigo-600/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg [transform:rotateY(180deg)] overflow-y-auto">
            <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-indigo-500 uppercase">Definition</span>
            <p className="font-sans text-base text-slate-700 leading-relaxed italic mt-4">
              {card.back}
            </p>
            
            {showContext && card.context && (
              <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 text-left" onClick={e => e.stopPropagation()}>
                <span className="font-bold text-slate-400 block mb-1">Source Context:</span>
                "{card.context}"
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        {!isFlipped ? (
           card.hint && (
             <button 
               onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
               className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors"
             >
               <Lightbulb size={12} /> {showHint ? "Hide Hint" : "Give me a hint"}
             </button>
           )
        ) : (
           card.context && (
             <button 
               onClick={(e) => { e.stopPropagation(); setShowContext(!showContext); }}
               className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
             >
               <FileText size={12} /> {showContext ? "Hide Context" : "Show Context"}
             </button>
           )
        )}
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
