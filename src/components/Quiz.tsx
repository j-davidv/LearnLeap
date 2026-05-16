import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { QuizQuestion } from '../services/geminiService';

interface QuizProps {
  questions: QuizQuestion[];
}

export default function Quiz({ questions }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto"
        id="quiz-results"
      >
        <h2 className="font-serif text-3xl text-slate-900 mb-2 italic">Results</h2>
        <div className="text-6xl font-bold text-indigo-600 mb-6 font-mono">
          {score}/{questions.length}
        </div>
        <p className="text-slate-500 mb-8 font-sans text-sm leading-relaxed">
          {score === questions.length ? "Mastery achieved. You have a solid grasp of these concepts." : "Good progress. Periodic review will help cement these ideas."}
        </p>
        <button
          onClick={resetQuiz}
          className="flex items-center justify-center gap-2 mx-auto px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm uppercase tracking-widest"
          id="btn-retake-quiz"
        >
          <RotateCcw size={16} />
          Restart Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto" id={`quiz-question-${currentQuestion.id}`}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest block mb-2">Question {String(currentIdx + 1).padStart(2, '0')} of {String(questions.length).padStart(2, '0')}</span>
            <p className="text-2xl font-semibold text-slate-800 leading-snug">
              {currentQuestion.question}
            </p>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: Q-{currentQuestion.id}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-10">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = option === currentQuestion.correct_answer;
            const isSelected = option === selectedOption;
            const alphabet = String.fromCharCode(65 + idx);
            
            let btnStyle = "border-slate-200 hover:border-indigo-600 bg-white";
            let indicatorStyle = "bg-slate-50 border-slate-200 text-slate-500";
            
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = "border-emerald-500 bg-emerald-50/50";
                indicatorStyle = "bg-emerald-500 border-emerald-500 text-white";
              } else if (isSelected) {
                btnStyle = "border-rose-500 bg-rose-50/50";
                indicatorStyle = "bg-rose-500 border-rose-500 text-white";
              } else {
                btnStyle = "border-slate-100 bg-white opacity-40";
                indicatorStyle = "bg-slate-50 border-slate-100 text-slate-300";
              }
            }

            return (
              <motion.button
                key={idx}
                whileHover={!isAnswered ? { x: 2 } : {}}
                onClick={() => handleOptionSelect(option)}
                disabled={isAnswered}
                className={`flex items-center gap-4 p-4 border rounded-xl text-left transition-all group ${btnStyle}`}
                id={`quiz-option-${idx}`}
              >
                <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${indicatorStyle}`}>
                  {alphabet}
                </span>
                <span className="text-slate-700 font-medium text-sm leading-relaxed">{option}</span>
                {isAnswered && isCorrect && <CheckCircle2 size={18} className="ml-auto text-emerald-500" />}
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-slate-50 pt-8 mt-auto">
          <div className="flex-1 mr-8">
            <AnimatePresence>
              {isAnswered && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-slate-400 italic font-serif leading-relaxed"
                >
                  Explanation: {currentQuestion.explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-all ${
              isAnswered 
                ? "text-indigo-600 hover:text-indigo-800" 
                : "text-slate-200 cursor-not-allowed"
            }`}
            id="btn-next-question"
          >
            {currentIdx === questions.length - 1 ? "Finish" : "Next Question"}
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
