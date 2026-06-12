import React, { useState } from 'react';
import { Book, Award, Eye, ClipboardCheck, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { MOTIFS_REGISTRY } from '../data/torahData';

export default function MotifExplorer() {
  const [selectedMotifId, setSelectedMotifId] = useState('Munach-Etnachta');
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'flashcards', 'quiz'

  // Flashcard states
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz states
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [answered, setAnswered] = useState(false);

  const activeMotif = MOTIFS_REGISTRY[selectedMotifId];

  const resetQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setIsQuizComplete(false);
    setAnswered(false);
  };

  const handleQuizAnswer = (optionIdx) => {
    if (answered) return;
    setSelectedOption(optionIdx);
    setAnswered(true);
    if (optionIdx === activeMotif.quizzes[currentQuizIdx].answerIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedOption(null);
    setAnswered(false);
    if (currentQuizIdx < activeMotif.quizzes.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  };

  return (
    <div className="motif-explorer glass-card">
      <div className="panel-header border-b">
        <h4 className="panel-title">
          <Book size={18} className="icon-gold" />
          <span>מאגר מנגינות ומוטיבים (Melodic Motifs Explorer)</span>
        </h4>
      </div>

      <div className="explorer-layout">
        {/* Left Sidebar: List of motifs */}
        <div className="explorer-sidebar border-r">
          <p className="text-xs text-muted px-4 py-2 font-semibold border-b">SELECT A MOTIF</p>
          <div className="motif-list-menu">
            {Object.keys(MOTIFS_REGISTRY).map((id) => {
              const item = MOTIFS_REGISTRY[id];
              const isSelected = selectedMotifId === id;
              return (
                <button
                  key={id}
                  className={`menu-item ${isSelected ? 'menu-item-active' : ''}`}
                  onClick={() => {
                    setSelectedMotifId(id);
                    setActiveTab('info');
                    setCurrentCardIdx(0);
                    setIsFlipped(false);
                    resetQuiz();
                  }}
                >
                  <span className="font-hebrew text-gold text-sm font-bold block">{item.name}</span>
                  <span className="text-xs text-muted block truncate">{item.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area: Learning Tabs */}
        <div className="explorer-content px-6 py-4">
          {activeMotif ? (
            <div className="motif-detail-deck">
              <div className="detail-title-section flex items-center justify-between border-b pb-3 mb-4">
                <div>
                  <h3 className="font-hebrew text-lg font-bold text-gold">{activeMotif.name}</h3>
                  <p className="text-xs text-muted mt-1">{activeMotif.description}</p>
                </div>
                <div className="motif-accents-symbols font-hebrew text-xl bg-dark px-3 py-1 rounded">
                  {activeMotif.id === 'Munach-Etnachta' && '֣ ֑'}
                  {activeMotif.id === 'Munach-Zaqef' && '֣ ֔'}
                  {activeMotif.id === 'Mercha-Tifcha' && '֥ ֖'}
                  {activeMotif.id === 'Mahpach-Pashta' && '֤ ֙'}
                  {activeMotif.id === 'Kadma-Azla' && '֨ ֙'}
                  {activeMotif.id === 'Darga-Tevir' && '֧ ֛'}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="btn-group mb-4">
                <button
                  className={`btn btn-sm ${activeTab === 'info' ? 'btn-active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Gesture Chironomy
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'flashcards' ? 'btn-active' : ''}`}
                  onClick={() => setActiveTab('flashcards')}
                >
                  Flashcards
                </button>
                <button
                  className={`btn btn-sm ${activeTab === 'quiz' ? 'btn-active' : ''}`}
                  onClick={() => setActiveTab('quiz')}
                >
                  Quiz
                </button>
              </div>

              {/* Tab 1: Chironomy & Info */}
              {activeTab === 'info' && (
                <div className="tab-pane-info">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="info-text">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Chironomy Guide</h4>
                      <p className="text-sm font-semibold">{activeMotif.gesture.name}</p>
                      <p className="text-xs text-muted mt-2 leading-relaxed">
                        {activeMotif.gesture.description}
                      </p>
                      <div className="bg-dark p-3 rounded mt-4 text-xs">
                        <span className="font-semibold block mb-1">Syntactic Value:</span>
                        This motif marks the closure of a {activeMotif.id.includes('Etnachta') ? 'verse section' : 'clause'} and governs reading punctuation.
                      </div>
                    </div>

                    <div className="info-visual flex flex-col items-center justify-center bg-dark rounded p-4 border">
                      <svg viewBox="0 0 100 100" className="w-32 h-32 stroke-gold">
                        <path
                          d={activeMotif.gesture.animationPath}
                          fill="none"
                          stroke="var(--color-gold)"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        {activeMotif.gesture.arrowPoints && (
                          <polygon points={activeMotif.gesture.arrowPoints} fill="var(--color-gold)" />
                        )}
                        <circle cx="20" cy="50" r="3" fill="var(--color-gold-dark)" />
                      </svg>
                      <span className="text-xs text-muted mt-2">Chironomy movement path</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Flashcards */}
              {activeTab === 'flashcards' && (
                <div className="tab-pane-flashcards flex flex-col items-center py-4">
                  {activeMotif.flashcards && activeMotif.flashcards.length > 0 ? (
                    <div className="flashcard-deck w-full max-w-sm">
                      <div
                        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        <div className="flashcard-inner">
                          <div className="flashcard-front">
                            <span className="text-xs text-muted uppercase tracking-wider block mb-4">Question</span>
                            <p className="text-sm font-medium text-center">
                              {activeMotif.flashcards[currentCardIdx].front}
                            </p>
                            <span className="text-xs text-muted mt-6 block text-center">Click to reveal answer</span>
                          </div>
                          <div className="flashcard-back">
                            <span className="text-xs text-teal uppercase tracking-wider block mb-4">Answer</span>
                            <p className="text-sm font-medium text-center">
                              {activeMotif.flashcards[currentCardIdx].back}
                            </p>
                            <span className="text-xs text-muted mt-6 block text-center">Click to flip back</span>
                          </div>
                        </div>
                      </div>

                      <div className="deck-controls mt-4 flex items-center justify-between w-full">
                        <button
                          className="btn btn-secondary text-xs"
                          disabled={currentCardIdx === 0}
                          onClick={() => {
                            setCurrentCardIdx(prev => prev - 1);
                            setIsFlipped(false);
                          }}
                        >
                          Previous
                        </button>
                        <span className="text-xs font-mono text-muted">
                          {currentCardIdx + 1} / {activeMotif.flashcards.length}
                        </span>
                        <button
                          className="btn btn-secondary text-xs"
                          disabled={currentCardIdx === activeMotif.flashcards.length - 1}
                          onClick={() => {
                            setCurrentCardIdx(prev => prev + 1);
                            setIsFlipped(false);
                          }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted">No flashcards pre-loaded for this motif.</div>
                  )}
                </div>
              )}

              {/* Tab 3: Practice Quiz */}
              {activeTab === 'quiz' && (
                <div className="tab-pane-quiz flex flex-col items-center w-full">
                  {activeMotif.quizzes && activeMotif.quizzes.length > 0 ? (
                    <div className="quiz-container w-full max-w-md">
                      {!isQuizComplete ? (
                        <div className="quiz-question-box">
                          <div className="flex justify-between items-center text-xs text-muted mb-3">
                            <span>Question {currentQuizIdx + 1} of {activeMotif.quizzes.length}</span>
                            <span className="font-mono">Score: {quizScore}</span>
                          </div>
                          <p className="text-sm font-semibold mb-4">
                            {activeMotif.quizzes[currentQuizIdx].question}
                          </p>

                          <div className="quiz-options-list flex flex-col gap-2">
                            {activeMotif.quizzes[currentQuizIdx].options.map((opt, oIdx) => {
                              const isCorrect = oIdx === activeMotif.quizzes[currentQuizIdx].answerIndex;
                              const isSel = selectedOption === oIdx;
                              let btnClass = 'btn-quiz-option';
                              if (answered) {
                                if (isCorrect) btnClass += ' option-correct';
                                else if (isSel) btnClass += ' option-incorrect';
                                else btnClass += ' option-disabled';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  className={`btn ${btnClass}`}
                                  disabled={answered}
                                  onClick={() => handleQuizAnswer(oIdx)}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {answered && (
                            <div className="quiz-next border-t pt-4 mt-4 flex justify-between items-center">
                              <span className="text-xs text-muted flex items-center gap-1">
                                {selectedOption === activeMotif.quizzes[currentQuizIdx].answerIndex ? (
                                  <span className="text-green font-bold">✓ Correct!</span>
                                ) : (
                                  <span className="text-red font-bold">✗ Incorrect</span>
                                )}
                              </span>
                              <button className="btn btn-gold text-xs flex items-center gap-1" onClick={nextQuizQuestion}>
                                Next Question <ArrowRight size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="quiz-completed text-center py-6">
                          <Award size={48} className="icon-gold animate-bounce mx-auto" />
                          <h4 className="font-bold text-lg mt-2">Quiz Completed!</h4>
                          <p className="text-sm mt-1">
                            Your score: <span className="font-bold text-teal">{quizScore} / {activeMotif.quizzes.length}</span>
                          </p>
                          <p className="text-xs text-muted mt-2">
                            {quizScore === activeMotif.quizzes.length ? 'Master class! You have fully mastered this motif.' : 'Practice makes perfect. Try again!'}
                          </p>
                          <button className="btn btn-primary text-xs mt-6 flex items-center gap-1 mx-auto" onClick={resetQuiz}>
                            <RotateCcw size={14} /> Restart Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-muted">No quizzes pre-loaded for this motif.</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-panel-state py-12 flex flex-col items-center">
              <AlertTriangle size={36} className="icon-muted" />
              <p className="text-muted text-sm mt-2">Select a motif from the sidebar to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
