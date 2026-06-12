import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, User, HelpCircle } from 'lucide-react';
import { MOTIFS_REGISTRY } from '../data/torahData';

export default function CoachingPanel({
  cantors,
  selectedCantor,
  onSelectCantor,
  activeVerseIndex,
  onSelectVerse,
  activeVerse, // active parsed verse
  motifsInVerse, // motifs in active verse
  onHoverWord,
  onHoverPhrase,
  isPlaying,
  setIsPlaying,
  resetTrigger
}) {
  const audioRef = useRef(null);
  const pathRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Interpolated active states
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [activeMotif, setActiveMotif] = useState(null);
  const [gestureProgress, setGestureProgress] = useState(0);

  // Update duration when audio is loaded or cantor changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedCantor]);

  // Sync play/pause commands from parent
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.log('Audio play failed: ', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Sync reset commands from parent
  useEffect(() => {
    if (resetTrigger > 0 && audioRef.current && selectedCantor) {
      const alignment = selectedCantor.alignments[activeVerseIndex];
      audioRef.current.currentTime = alignment ? alignment.start : 0;
      setCurrentTime(audioRef.current.currentTime);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  }, [resetTrigger]);

  // Sync verse selection clicks with audio time
  useEffect(() => {
    if (!audioRef.current || !selectedCantor) return;
    const alignment = selectedCantor.alignments[activeVerseIndex];
    if (alignment) {
      const cur = audioRef.current.currentTime;
      if (cur < alignment.start || cur > alignment.end) {
        audioRef.current.currentTime = alignment.start;
        setCurrentTime(alignment.start);
      }
    }
  }, [activeVerseIndex, selectedCantor]);

  // Interpolation logic for words and motifs within the active verse
  useEffect(() => {
    if (!selectedCantor || !activeVerse) return;
    const alignment = selectedCantor.alignments[activeVerseIndex];
    if (!alignment) {
      setActiveWordIndex(-1);
      setActiveMotif(null);
      return;
    }

    const verseStart = alignment.start;
    const verseEnd = alignment.end;
    const verseDuration = verseEnd - verseStart;

    if (currentTime < verseStart || currentTime > verseEnd) {
      return;
    }

    // Relative progress within this verse (0 to 1)
    const relativeProgress = (currentTime - verseStart) / (verseDuration || 1);

    // 1. Interpolate active word
    const totalWords = activeVerse.words.length;
    const wordIdx = Math.floor(relativeProgress * totalWords);
    if (wordIdx >= 0 && wordIdx < totalWords) {
      const activeWord = activeVerse.words[wordIdx];
      setActiveWordIndex(activeWord.index);
      onHoverWord(activeWord.id);
    }

    // 2. Interpolate active motif
    if (motifsInVerse && motifsInVerse.length > 0) {
      let currentMotif = null;
      for (let motif of motifsInVerse) {
        const firstWordIdx = motif.wordIndices[0];
        const lastWordIdx = motif.wordIndices[motif.wordIndices.length - 1];
        
        const motifStartProgress = firstWordIdx / totalWords;
        const motifEndProgress = (lastWordIdx + 1) / totalWords;

        if (relativeProgress >= motifStartProgress && relativeProgress < motifEndProgress) {
          currentMotif = motif;
          const mProgress = (relativeProgress - motifStartProgress) / (motifEndProgress - motifStartProgress);
          setGestureProgress(mProgress);
          break;
        }
      }
      setActiveMotif(currentMotif);
    }
  }, [currentTime, activeVerseIndex, activeVerse, motifsInVerse, selectedCantor]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    // Sync active verse based on timestamps
    if (selectedCantor) {
      for (let vIdxStr in selectedCantor.alignments) {
        const vIdx = parseInt(vIdxStr);
        const align = selectedCantor.alignments[vIdx];
        if (cur >= align.start && cur < align.end) {
          if (activeVerseIndex !== vIdx) {
            onSelectVerse(vIdx);
          }
          break;
        }
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveWordIndex(-1);
    setActiveMotif(null);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const registryMotif = activeMotif ? MOTIFS_REGISTRY[activeMotif.type] : null;
  const gesture = registryMotif?.gesture;

  const getHandPosition = () => {
    if (!pathRef.current) return { x: 50, y: 50 };
    try {
      const pathLength = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(pathLength * gestureProgress);
      return { x: point.x, y: point.y };
    } catch (e) {
      return { x: 50, y: 50 };
    }
  };

  const handPos = getHandPosition();

  return (
    <div className="coaching-panel glass-card">
      <div className="panel-header border-b">
        <h4 className="panel-title">
          <Volume2 size={18} className="icon-gold" />
          <span>אימון קול ותנועות (Audio & Chironomy Coach)</span>
        </h4>
        
        <div className="cantor-select-wrapper">
          <User size={14} className="text-muted mr-1" />
          <select
            value={selectedCantor.username}
            onChange={(e) => {
              const cantor = cantors.find(c => c.username === e.target.value);
              if (cantor) onSelectCantor(cantor);
            }}
            className="cantor-select font-sans text-xs"
          >
            {cantors.map(c => (
              <option key={c.username} value={c.username}>
                {c.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="coaching-grid">
        {/* Playback controls */}
        <div className="playback-controls-section">
          <audio
            ref={audioRef}
            src={selectedCantor.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={() => setDuration(audioRef.current.duration)}
            onEnded={handleAudioEnded}
          />

          <div className="player-verse-info">
            <span className="text-xs text-muted">Reading tradition:</span>
            <span className="text-sm font-semibold">{selectedCantor.tradition}</span>
            <span className="badge-active-verse mt-1 text-xs">
              Verse {activeVerseIndex}
            </span>
          </div>

          <div className="player-timeline-wrapper">
            <span className="time-display">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = val;
                  setCurrentTime(val);
                }
              }}
              className="player-slider"
            />
            <span className="time-display">{formatTime(duration)}</span>
          </div>

          <div className="player-buttons">
            <button className="btn btn-circle btn-reset" onClick={() => setIsPlaying(false)} title="Pause audio">
              <Pause size={16} />
            </button>
            <button className="btn btn-circle btn-play-large" onClick={handlePlayPause}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
          </div>
        </div>

        {/* Chironomy Gesture Coach */}
        <div className="chironomy-section border-l">
          <div className="chironomy-header">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Visual Gesture (Chironomy Coach)
            </h5>
            <span className="gesture-tradition text-xs font-bold text-gold">
              {gesture?.tradition || 'Moroccan'} tradition
            </span>
          </div>

          <div className="chironomy-display">
            {gesture ? (
              <div className="gesture-canvas-wrapper">
                <svg viewBox="0 0 100 100" className="gesture-svg">
                  <path
                    ref={pathRef}
                    d={gesture.animationPath}
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.2)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d={gesture.animationPath}
                    fill="none"
                    stroke="var(--color-gold)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (gestureProgress * 100)}
                  />

                  {gesture.arrowPoints && (
                    <polygon
                      points={gesture.arrowPoints}
                      fill="var(--color-gold)"
                      opacity="0.8"
                    />
                  )}

                  <g transform={`translate(${handPos.x}, ${handPos.y})`}>
                    <circle r="6" fill="var(--color-gold)" className="ping-circle" />
                    <circle r="4" fill="var(--color-gold-dark)" />
                    <path
                      d="M -2,-2 C -4,-6 -8,-6 -10,-4 C -12,-2 -10,2 -6,4 L -2,4"
                      fill="none"
                      stroke="var(--color-gold)"
                      strokeWidth="1"
                    />
                  </g>
                </svg>

                <div className="gesture-indicator-badge">
                  {activeMotif?.name || 'Chants'}
                </div>
              </div>
            ) : (
              <div className="gesture-placeholder">
                <HelpCircle size={40} className="icon-muted animate-pulse" />
                <span className="text-xs text-muted mt-2">
                  No active motif. Start playback to view hand gestures.
                </span>
              </div>
            )}
          </div>

          <div className="gesture-text-desc px-4 py-2 text-xs">
            <span className="font-semibold block">Gesture instruction:</span>
            {gesture?.description || 'Follow the conductor\'s hand to shape the musical phrase.'}
          </div>
        </div>
      </div>
    </div>
  );
}
