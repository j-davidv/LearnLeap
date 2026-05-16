import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Lightbulb, Target, Edit2, Check, Trash2, List } from 'lucide-react';
import { QuizQuestion } from '../services/geminiService';

interface QuizProps {
  questions: QuizQuestion[];
  onRetakeMissed?: (missedIds: number[]) => void;
  onUpdateQuestion?: (updatedQuestion: QuizQuestion) => void;
  onDeleteQuestion?: (id: number) => void;
}

export default function Quiz({ questions, onRetakeMissed, onUpdateQuestion, onDeleteQuestion }: QuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [missedIds, setMissedIds] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editExplanation, setEditExplanation] = useState("");

  const currentQuestion = questions[currentIdx] || null;

  if (!questions || questions.length === 0) {
    return <div className="text-center p-8 text-slate-500">No quiz questions available.</div>;
  }

  const startEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setEditQuestion(q.question);
    setEditOptions([...q.options]);
    setEditCorrectAnswer(q.correct_answer);
    setEditExplanation(q.explanation);
  };

  const saveEdit = () => {
    if (onUpdateQuestion && editingId !== null) {
      const q = questions.find(x => x.id === editingId);
      if (q) {
        onUpdateQuestion({
          ...q,
          question: editQuestion,
          options: editOptions,
          correct_answer: editCorrectAnswer,
          explanation: editExplanation
        });
      }
    }
    setEditingId(null);
  };

  if (editMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-2xl text-slate-900 italic">Manage Questions</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (onUpdateQuestion) {
                  const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
                  onUpdateQuestion({
                    id: newId,
                    question: "New Question",
                    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                    correct_answer: "Option 1",
                    explanation: "Add explanation here.",
                    context: "",
                    hint: ""
                  });
                }
              }}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              + Add
            </button>
            <button 
              onClick={() => setEditMode(false)}
              className="text-sm font-bold text-slate-500 hover:text-slate-800"
            >
              Done
            </button>
          </div>
        </div>
        
        {questions.map((q) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            {editingId === q.id ? (
              <div className="space-y-4">
                <input 
                  className="w-full font-semibold text-slate-800 p-2 border border-indigo-200 focus:border-indigo-500 rounded outline-none"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Options (Select radio for correct answer)</label>
                  {editOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input 
                        type="radio" 
                        name="correct_answer" 
                        checked={editCorrectAnswer === opt} 
                        onChange={() => setEditCorrectAnswer(opt)}
                      />
                      <input 
                        className="flex-1 p-2 text-sm border border-slate-200 rounded outline-none w-full focus:border-indigo-400"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editOptions];
                          newOpts[i] = e.target.value;
                          setEditOptions(newOpts);
                          if (editCorrectAnswer === opt) setEditCorrectAnswer(e.target.value);
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Explanation</label>
                  <textarea 
                    className="w-full text-sm p-2 border border-slate-200 rounded outline-none focus:border-indigo-400"
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                  <button onClick={saveEdit} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded"><Check size={14}/> Save</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-slate-800 leading-snug">{q.question}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(q)} className="text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                    {onDeleteQuestion && (
                      <button onClick={() => onDeleteQuestion(q.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                    )}
                  </div>
                </div>
                <div className="text-sm space-y-1 mb-4 text-slate-600">
                  {q.options.map((opt, i) => (
                    <div key={i} className={opt === q.correct_answer ? "text-emerald-600 font-medium" : ""}>
                      • {opt} {opt === q.correct_answer && "(Correct)"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correct_answer) {
      setScore(score + 1);
    } else {
      if (!missedIds.includes(currentQuestion.id)) {
        setMissedIds([...missedIds, currentQuestion.id]);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setMissedIds([]);
    setShowResults(false);
  };

  const gradePercentage = Math.round((score / questions.length) * 100);
  let gradeMessage = "";
  if (gradePercentage >= 90) gradeMessage = "Mastery achieved. You have a solid grasp of these concepts.";
  else if (gradePercentage >= 70) gradeMessage = "Good progress. Periodic review will help cement these ideas.";
  else gradeMessage = "More practice needed. Review your flashcards and try again.";

  if (showResults) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto"
        id="quiz-results"
      >
        <h2 className="font-serif text-3xl text-slate-900 mb-2 italic">Results</h2>
        <div className="text-6xl font-bold text-indigo-600 mb-2 font-mono">
          {score}/{questions.length}
        </div>
        <div className="text-lg font-medium text-slate-400 mb-6 font-sans">
          {gradePercentage}% Grade
        </div>
        <p className="text-slate-500 mb-8 font-sans text-sm leading-relaxed">
          {gradeMessage}
        </p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold text-sm uppercase tracking-widest"
            id="btn-retake-quiz"
          >
            <RotateCcw size={16} />
            Restart Quiz
          </button>
          
          {missedIds.length > 0 && onRetakeMissed && (
            <button
              onClick={() => {
                setShowResults(false);
                onRetakeMissed(missedIds);
              }}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-bold text-sm uppercase tracking-widest"
              id="btn-retake-missed"
            >
              <Target size={16} />
              Retake Missed ({missedIds.length})
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto" id={`quiz-question-${currentIdx}`}>
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setEditMode(true)}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest rounded px-2 py-1"
        >
          <List size={14} /> Edit Questions
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col min-h-[28rem]">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <span className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest block mb-2">Question {String(currentIdx + 1).padStart(2, '0')} of {String(questions.length).padStart(2, '0')}</span>
            <p className="text-2xl font-semibold text-slate-800 leading-snug">
              {currentQuestion.question}
            </p>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: Q-{currentQuestion.id}</div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
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
                {isAnswered && isSelected && !isCorrect && <XCircle size={18} className="ml-auto text-rose-500" />}
              </motion.button>
            );
          })}
        </div>

        <div className="flex-1"></div>

        {!isAnswered && !showHint && currentQuestion.hint && (
          <div className="mb-6 flex justify-start">
            <button 
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <Lightbulb size={12} /> Give me a hint
            </button>
          </div>
        )}

        {showHint && !isAnswered && currentQuestion.hint && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 italic"
          >
            💡 {currentQuestion.hint}
          </motion.div>
        )}

        <div className="flex items-center justify-between border-t border-slate-50 pt-6 mt-auto">
          <div className="flex-1 mr-8">
            <AnimatePresence>
              {isAnswered && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-slate-600 italic font-serif leading-relaxed"
                >
                  <span className="font-bold text-indigo-600 mr-2 not-italic">Explanation:</span> 
                  {currentQuestion.explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className={`flex items-center gap-2 font-bold text-[10px] py-2 uppercase tracking-widest transition-all ${
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
