import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { Flashcard as FlashcardType } from '../services/geminiService';

interface FlashcardProps {
  card: FlashcardType;
}

export default function Flashcard({ card }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-56 cursor-pointer perspective-1000 group"
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
        <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm group-hover:shadow-md transition-shadow">
          <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-indigo-500 uppercase">Term</span>
          <h2 className="font-sans text-lg md:text-xl font-medium text-slate-800 leading-snug">
            {card.front}
          </h2>
          <div className="absolute bottom-4 right-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <RefreshCw size={14} className="animate-spin-slow" />
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-white border border-indigo-600/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg [transform:rotateY(180deg)]">
          <span className="absolute top-4 left-4 text-[10px] font-bold tracking-widest text-indigo-500 uppercase">Definition</span>
          <p className="font-sans text-base text-slate-700 leading-relaxed italic">
            {card.back}
          </p>
        </div>
      </motion.div>
      
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
