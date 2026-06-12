import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Save, Download, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function AudioIngestionPanel({
  onAddCantor,
  existingCantors
}) {
  const audioRef = useRef(null);

  // Form states
  const [username, setUsername] = useState('cantor-new');
  const [displayName, setDisplayName] = useState('New Cantor');
  const [tradition, setTradition] = useState('Moroccan Fès');
  const [audioUrl, setAudioUrl] = useState('https://www.mechon-mamre.org/mp3/t0101.mp3');

  // Alignment states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [alignments, setAlignments] = useState({
    1: { start: 0, end: 10 },
    2: { start: 10, end: 20 },
    3: { start: 20, end: 30 },
    4: { start: 30, end: 40 },
    5: { start: 40, end: 50 },
    6: { start: 50, end: 60 },
    7: { start: 60, end: 70 },
    8: { start: 70, end: 80 }
  });

  // Tapping alignment assistant states
  const [isTappingMode, setIsTappingMode] = useState(false);
  const [currentTappingVerse, setCurrentTappingVerse] = useState(1);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => alert('Failed to play audio: ' + err.message));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  // Tapping handler: records current timestamp
  const handleTapNext = () => {
    if (!audioRef.current) return;
    const now = parseFloat(audioRef.current.currentTime.toFixed(2));

    if (currentTappingVerse === 1) {
      // Start of verse 1 is assumed 0 (or wherever audio was started)
      setAlignments(prev => ({
        ...prev,
        1: { start: 0, end: now }
      }));
      setCurrentTappingVerse(2);
    } else if (currentTappingVerse <= 8) {
      const prevVerse = currentTappingVerse - 1;
      
      setAlignments(prev => {
        const nextAlignments = { ...prev };
        // Set end of previous verse
        nextAlignments[prevVerse] = { ...nextAlignments[prevVerse], end: now };
        // Set start of current verse
        nextAlignments[currentTappingVerse] = { start: now, end: parseFloat((now + 10).toFixed(2)) };
        return nextAlignments;
      });

      if (currentTappingVerse === 8) {
        // Tapping finished
        setIsTappingMode(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        alert('Verse-by-verse alignment tapping complete! You can fine-tune timestamps in the table below.');
      } else {
        setCurrentTappingVerse(currentTappingVerse + 1);
      }
    }
  };

  const startTappingAlignment = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsTappingMode(true);
    setCurrentTappingVerse(1);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const stopTappingAlignment = () => {
    setIsTappingMode(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  // Handle manual input edits
  const handleAlignmentChange = (verseIdx, field, value) => {
    const numVal = parseFloat(value) || 0;
    setAlignments(prev => ({
      ...prev,
      [verseIdx]: {
        ...prev[verseIdx],
        [field]: numVal
      }
    }));
  };

  const handleSaveCantor = () => {
    if (!username || !displayName || !tradition || !audioUrl) {
      alert('Please fill out all cantor details.');
      return;
    }

    const newCantor = {
      username,
      displayName,
      tradition,
      audioUrl,
      alignments: { ...alignments }
    };

    onAddCantor(newCantor);
    alert(`Cantor "${displayName}" successfully calibrated and saved to active cantors list!`);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      username,
      displayName,
      tradition,
      audioUrl,
      alignments
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${username}_alignment.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="audio-ingestion-panel glass-card">
      <div className="panel-header border-b">
        <h4 className="panel-title">
          <Upload size={18} className="icon-gold" />
          <span>הזנת קורא וכיול פסוקים (Cantor Ingestion & Calibration Workspace)</span>
        </h4>
      </div>

      <div className="ingestion-grid">
        {/* Form settings */}
        <div className="ingestion-form-section px-6 py-4">
          <h5 className="form-subtitle text-xs font-bold uppercase tracking-wider mb-3">1. Cantor Registration Details</h5>
          
          <div className="form-group mb-3">
            <label className="label text-xs text-muted block mb-1">Cantor Username (unique ID)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="form-input text-sm w-full"
              placeholder="e.g. cantor-yosef-fes"
            />
          </div>

          <div className="form-group mb-3">
            <label className="label text-xs text-muted block mb-1">Display Name (UI Name)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input text-sm w-full"
              placeholder="e.g. Cantor Yosef (Moroccan Fès)"
            />
          </div>

          <div className="form-group mb-3">
            <label className="label text-xs text-muted block mb-1">Cantillations Tradition</label>
            <select
              value={tradition}
              onChange={(e) => setTradition(e.target.value)}
              className="form-input text-sm w-full"
            >
              <option value="Moroccan Meknès">Moroccan Meknès</option>
              <option value="Moroccan Fès">Moroccan Fès</option>
              <option value="Moroccan Marrakesh">Moroccan Marrakesh</option>
              <option value="Jerusalem Sephardi">Jerusalem Sephardi</option>
              <option value="Ashkenazi">Ashkenazi</option>
              <option value="Syrian">Syrian</option>
              <option value="Yemenite">Yemenite</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="label text-xs text-muted block mb-1">Audio File URL (.mp3 / .wav)</label>
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="form-input text-sm w-full"
              placeholder="https://example.com/audio/parasha.mp3"
            />
          </div>

          <div className="form-actions border-t pt-4 flex gap-2">
            <button className="btn btn-primary text-xs w-full flex items-center justify-center gap-1" onClick={handleSaveCantor}>
              <Save size={14} /> Add Cantor to List
            </button>
            <button className="btn btn-secondary text-xs w-full flex items-center justify-center gap-1" onClick={handleExportJSON}>
              <Download size={14} /> Export JSON File
            </button>
          </div>
        </div>

        {/* Real-time Tapping Assistant */}
        <div className="ingestion-calibration-section border-l px-6 py-4">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={() => setDuration(audioRef.current.duration)}
            onEnded={() => setIsPlaying(false)}
          />

          <h5 className="form-subtitle text-xs font-bold uppercase tracking-wider mb-3">2. Real-Time Tapping Calibration</h5>

          <div className="tapping-box mb-4">
            {!isTappingMode ? (
              <div className="tapping-starter flex flex-col items-center justify-center py-6 text-center">
                <Clock size={36} className="icon-muted animate-pulse" />
                <p className="text-sm mt-2 font-medium">Ready to Calibrate Verse Timestamps?</p>
                <p className="text-xs text-muted max-w-xs mt-1 mb-4">
                  Listen to the audio and click to mark when each verse starts/ends in real-time.
                </p>
                <button className="btn btn-gold text-xs" onClick={startTappingAlignment}>
                  Start Tapping Alignment
                </button>
              </div>
            ) : (
              <div className="tapping-active py-4 text-center">
                <div className="tapping-status text-xs font-semibold text-gold animate-bounce mb-2">
                  TAPPING ALIGNMENT MODE ACTIVE
                </div>
                <div className="tapping-verse-prompt text-lg font-bold">
                  Now Playing: Verse {currentTappingVerse}
                </div>
                <p className="text-xs text-muted mt-1 mb-4">
                  Audio playhead: <span className="font-mono">{currentTime.toFixed(2)}s</span>
                </p>
                
                <div className="flex gap-2 justify-center">
                  <button className="btn btn-primary py-2 px-6 text-sm font-semibold" onClick={handleTapNext}>
                    {currentTappingVerse === 1 
                      ? 'Mark Start/End of Verse 1' 
                      : currentTappingVerse === 8 
                        ? 'Finish (Mark End of Verse 8)' 
                        : `Mark End of Verse ${currentTappingVerse - 1} / Start of Verse ${currentTappingVerse}`}
                  </button>
                  <button className="btn btn-danger text-xs px-3" onClick={stopTappingAlignment}>
                    Cancel Tapping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp Table */}
          <h5 className="form-subtitle text-xs font-bold uppercase tracking-wider mb-2">3. Manual Fine-Tuning</h5>
          <div className="alignment-table-wrapper max-h-56 overflow-y-auto">
            <table className="alignment-table w-full text-xs">
              <thead>
                <tr className="bg-dark text-left border-b">
                  <th className="p-2">Verse</th>
                  <th className="p-2">Start Time (s)</th>
                  <th className="p-2">End Time (s)</th>
                  <th className="p-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(alignments).map((verseIdxStr) => {
                  const verseIdx = parseInt(verseIdxStr);
                  const align = alignments[verseIdx];
                  const dur = (align.end - align.start).toFixed(1);
                  return (
                    <tr key={verseIdx} className="border-b hover-bg-dark">
                      <td className="p-2 font-bold">Verse {verseIdx}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={align.start}
                          onChange={(e) => handleAlignmentChange(verseIdx, 'start', e.target.value)}
                          className="table-input w-20 font-mono text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={align.end}
                          onChange={(e) => handleAlignmentChange(verseIdx, 'end', e.target.value)}
                          className="table-input w-20 font-mono text-center"
                        />
                      </td>
                      <td className="p-2 text-muted font-mono">{dur}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
