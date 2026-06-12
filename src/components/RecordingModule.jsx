import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Award, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';

export default function RecordingModule({
  activeVerse,
  selectedCantor,
  motifsInVerse
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioPlaybackRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  // Scorecard states
  const [evaluations, setEvaluations] = useState({});
  const [timingDiff, setTimingDiff] = useState(null);

  // Clean up on verse change
  useEffect(() => {
    setAudioUrl(null);
    setRecordedChunks([]);
    setRecordingDuration(0);
    setEvaluations({});
    setTimingDiff(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeVerse]);

  // Request mic and start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordedChunks(chunks);
        calculatePerformance(chunks);
      };

      setRecordedChunks([]);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);

      mediaRecorderRef.current.start();
    } catch (err) {
      alert('Microphone access denied or unsupported: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks in stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Calculate timing diff vs cantor
  const calculatePerformance = (chunks) => {
    if (!selectedCantor) return;
    const align = selectedCantor.alignments[activeVerse.verseIndex];
    if (!align) return;

    const cantorDur = align.end - align.start;
    // Get actual recording duration from the timer state
    const studentDur = parseFloat(recordingDuration.toFixed(1));
    const diff = studentDur - cantorDur;

    setTimingDiff({
      cantorDuration: parseFloat(cantorDur.toFixed(1)),
      studentDuration: studentDur,
      difference: parseFloat(diff.toFixed(1))
    });
  };

  // Draw simulated waveforms on a canvas for comparison
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const midY1 = h / 4;
    const midY2 = (3 * h) / 4;

    // Draw partition line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // 1. Draw Cantor Waveform (Top half)
    ctx.fillStyle = 'var(--color-gold)';
    const barWidth = 3;
    const gap = 2;
    const barCount = w / (barWidth + gap);

    for (let i = 0; i < barCount; i++) {
      // Generate a voice envelope simulation
      const factor = Math.sin(i * 0.15) * Math.cos(i * 0.05);
      const amp = Math.max(2, Math.abs(factor) * (h / 4.5) * (0.8 + Math.random() * 0.2));
      
      ctx.fillRect(i * (barWidth + gap), midY1 - amp / 2, barWidth, amp);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px sans-serif';
    ctx.fillText('CANTOR GUIDE WAVEFORM', 10, 20);

    // 2. Draw Student Waveform (Bottom half)
    if (audioUrl) {
      ctx.fillStyle = '#64dfdf';
      for (let i = 0; i < barCount; i++) {
        // Generate simulated voice envelope slightly different from cantor
        const factor = Math.sin(i * 0.14 + 0.5) * Math.cos(i * 0.04);
        const amp = Math.max(2, Math.abs(factor) * (h / 4.5) * (0.7 + Math.random() * 0.3));
        
        ctx.fillRect(i * (barWidth + gap), midY2 - amp / 2, barWidth, amp);
      }
      ctx.fillStyle = '#e0fbfc';
      ctx.fillText('YOUR RECORDED WAVEFORM', 10, h / 2 + 20);
    } else if (isRecording) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '10px sans-serif';
      ctx.fillText('RECORDING MIC LIVE INPUT...', 10, h / 2 + 20);
      
      // Live animation bar
      const offset = (Date.now() / 50) % 20;
      ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
      ctx.fillRect(0, h / 2, w, h / 2);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillText('Awaiting student recording...', 10, h / 2 + 20);
    }
  }, [audioUrl, isRecording, recordingDuration, activeVerse]);

  const toggleEval = (motifId) => {
    setEvaluations(prev => ({
      ...prev,
      [motifId]: !prev[motifId]
    }));
  };

  const getPercentMastered = () => {
    if (!motifsInVerse || motifsInVerse.length === 0) return 0;
    const checked = Object.values(evaluations).filter(v => v === true).length;
    return Math.round((checked / motifsInVerse.length) * 100);
  };

  return (
    <div className="recording-module glass-card">
      <div className="panel-header border-b">
        <h4 className="panel-title">
          <Mic size={18} className="icon-gold" />
          <span>הקלטה והשוואת קריאה (Practice, Record & Align)</span>
        </h4>
      </div>

      <div className="recording-container">
        {/* Waveform visual comparison */}
        <div className="waveform-box">
          <canvas ref={canvasRef} width="600" height="160" className="waveform-canvas" />
        </div>

        {/* Action Controls */}
        <div className="recording-controls border-b py-4 px-6 flex items-center justify-between">
          <div className="rec-status-group flex items-center gap-3">
            {!isRecording ? (
              <button className="btn btn-danger btn-rec flex items-center gap-1" onClick={startRecording}>
                <Mic size={16} /> Record Voice
              </button>
            ) : (
              <button className="btn btn-danger btn-stop-rec flex items-center gap-1 animate-pulse" onClick={stopRecording}>
                <Square size={16} /> Stop ({recordingDuration.toFixed(1)}s)
              </button>
            )}

            {audioUrl && (
              <button
                className="btn btn-primary btn-play-rec flex items-center gap-1"
                onClick={() => {
                  if (audioPlaybackRef.current) {
                    audioPlaybackRef.current.play();
                  }
                }}
              >
                <Play size={16} /> Play Recording
              </button>
            )}

            <audio ref={audioPlaybackRef} src={audioUrl} />
          </div>

          {/* Timing analysis */}
          {timingDiff && (
            <div className="timing-results-card text-xs">
              <div className="flex gap-4">
                <div>
                  <span className="text-muted block">Cantor Pace:</span>
                  <span className="font-mono font-bold">{timingDiff.cantorDuration}s</span>
                </div>
                <div>
                  <span className="text-muted block">Your Pace:</span>
                  <span className="font-mono font-bold text-teal">{timingDiff.studentDuration}s</span>
                </div>
                <div>
                  <span className="text-muted block">Difference:</span>
                  <span className={`font-mono font-bold ${Math.abs(timingDiff.difference) > 1.5 ? 'text-red' : 'text-green'}`}>
                    {timingDiff.difference > 0 ? `+${timingDiff.difference}` : timingDiff.difference}s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phrase-level checkcard / self-assessment */}
        <div className="phrase-self-eval px-6 py-4">
          <h5 className="form-subtitle text-xs font-bold uppercase tracking-wider mb-2 flex justify-between items-center">
            <span>Phrase-Level Accuracy Checklist</span>
            <span className="badge-percent bg-teal-dark">{getPercentMastered()}% Done</span>
          </h5>

          {motifsInVerse && motifsInVerse.length > 0 ? (
            <div className="self-eval-list">
              <p className="text-xs text-muted mb-3">
                Review your recording. Check off the melodic motifs you chanted correctly:
              </p>
              <div className="checkbox-grid">
                {motifsInVerse.map((motif) => {
                  const isChecked = !!evaluations[motif.id];
                  return (
                    <label key={motif.id} className={`eval-checkbox-item ${isChecked ? 'item-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEval(motif.id)}
                        className="mr-2"
                      />
                      <span className="text-sm font-semibold font-hebrew text-gold">
                        {motif.name}
                      </span>
                      <span className="text-xs text-muted ml-2">
                        ({motif.words.map(w => w.cleanText).join(' ')})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 text-xs text-muted border border-dashed rounded">
              <AlertCircle size={16} />
              No identifiable motifs in this verse yet. Check your cantillation parser.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
