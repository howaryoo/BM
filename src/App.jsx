import React, { useState, useEffect } from 'react';
import { PORTIONS_DATA, PRELOADED_CANTORS, ALIYOT_REFS } from './data/torahData';
import { parseVerse, detectMotifs } from './utils/cantillationParser';
import TorahViewer from './components/TorahViewer';
import SyntaxTreePanel from './components/SyntaxTreePanel';
import CoachingPanel from './components/CoachingPanel';
import AudioIngestionPanel from './components/AudioIngestionPanel';
import RecordingModule from './components/RecordingModule';
import MotifExplorer from './components/MotifExplorer';
import Dashboard from './components/Dashboard';
import { BookOpen, HelpCircle, BarChart3, Upload, Milestone, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

// Clean HTML tags, HTML entities, and paragraph delimiters from Sefaria API text
function cleanSefariaText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')      // Strip HTML tags
    .replace(/&nbsp;/g, ' ')      // Replace HTML spaces
    .replace(/\{[ספ]\}/g, '')     // Remove paragraph symbols {ס} and {פ}
    .replace(/\s+/g, ' ')         // Collapse whitespace
    .trim();
}

// Helper to convert number to Hebrew numerals (e.g. 15 -> טו, 21 -> כא)
function toHebrewNumerals(num) {
  const letters = [
    { v: 400, s: 'ת' }, { v: 300, s: 'ש' }, { v: 200, s: 'ר' }, { v: 100, s: 'ק' },
    { v: 90, s: 'צ' }, { v: 80, s: 'פ' }, { v: 70, s: 'ע' }, { v: 60, s: 'ס' },
    { v: 50, s: 'נ' }, { v: 40, s: 'מ' }, { v: 30, s: 'ל' }, { v: 20, s: 'כ' },
    { v: 10, s: 'י' }, { v: 9, s: 'ט' }, { v: 8, s: 'ח' }, { v: 7, s: 'ז' },
    { v: 6, s: 'ו' }, { v: 5, s: 'ה' }, { v: 4, s: 'ד' }, { v: 3, s: 'ג' },
    { v: 2, s: 'ב' }, { v: 1, s: 'א' }
  ];
  let result = '';
  let n = num;
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  
  for (const letter of letters) {
    while (n >= letter.v) {
      result += letter.s;
      n -= letter.v;
    }
  }
  return result;
}

// Reconstruct Sefaria API response (which can have nested array of arrays for spanning text)
// into flat array of verse objects: { verseIndex, reference, text }
function reconstructVerses(data, portionId) {
  const he = data.he || [];
  const sections = data.sections || [];
  const toSections = data.toSections || [];
  const book = data.book || '';

  if (sections.length < 2 || toSections.length < 2) {
    return [];
  }

  const startChapter = sections[0];
  const startVerse = sections[1];
  const endChapter = toSections[0];
  const endVerse = toSections[1];

  const verses = [];

  const bookNamesHebrew = {
    'Genesis': 'בראשית',
    'Exodus': 'שמות',
    'Leviticus': 'ויקרא',
    'Numbers': 'במדבר',
    'Deuteronomy': 'דברים'
  };
  const heBook = bookNamesHebrew[book] || book;

  if (!data.isSpanning && !Array.isArray(he[0])) {
    // Single chapter
    he.forEach((text, idx) => {
      const vNum = startVerse + idx;
      let vIndex = vNum;
      if (book === 'Genesis' && startChapter === 1) {
        vIndex = vNum;
      } else if (book === 'Deuteronomy' && startChapter === 21) {
        vIndex = vNum;
      } else {
        vIndex = startChapter * 1000 + vNum;
      }

      const chRefHeb = toHebrewNumerals(startChapter);
      const vRefHeb = toHebrewNumerals(vNum);
      const reference = `${heBook} ${chRefHeb}:${vRefHeb}`;

      verses.push({
        verseIndex: vIndex,
        reference,
        text: cleanSefariaText(text)
      });
    });
  } else {
    // Spanning chapters
    he.forEach((chapterVerses, chIdx) => {
      const currentChapter = startChapter + chIdx;
      const chStartVerse = (currentChapter === startChapter) ? startVerse : 1;

      chapterVerses.forEach((text, idx) => {
        const vNum = chStartVerse + idx;
        let vIndex = vNum;
        if (book === 'Genesis' && currentChapter === 1) {
          vIndex = vNum;
        } else if (book === 'Deuteronomy' && currentChapter === 21) {
          vIndex = vNum;
        } else {
          vIndex = currentChapter * 1000 + vNum;
        }

        const chRefHeb = toHebrewNumerals(currentChapter);
        const vRefHeb = toHebrewNumerals(vNum);
        const reference = `${heBook} ${chRefHeb}:${vRefHeb}`;

        verses.push({
          verseIndex: vIndex,
          reference,
          text: cleanSefariaText(text)
        });
      });
    });
  }
  return verses;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('reader'); // 'reader', 'motifs', 'ingestion', 'dashboard'
  
  // Get initial values from URL query parameters
  const getUrlParam = (key, defaultValue) => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(key);
    if (val === null) return defaultValue;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  };

  const initialPortion = getUrlParam('portion', 'bereishit');
  const initialAliyah = parseInt(getUrlParam('aliyah', '1')) || 1;
  const initialVerse = parseInt(getUrlParam('verse', '1')) || 1;
  const initialMode = getUrlParam('mode', 'scroll');
  const initialText = getUrlParam('text', 'full');
  const initialFont = getUrlParam('font', 'calligraphy') === 'calligraphy';
  const initialShowControl = getUrlParam('showControl', true);
  const initialShowTree = getUrlParam('showTree', true);
  const initialShowAudio = getUrlParam('showAudio', true);

  // Selection states
  const [selectedPortionId, setSelectedPortionId] = useState(initialPortion);
  const [selectedAliyahIndex, setSelectedAliyahIndex] = useState(initialAliyah);
  const [activeVerseIndex, setActiveVerseIndex] = useState(initialVerse);

  // Lifted view option states
  const [viewMode, setViewMode] = useState(initialMode);
  const [studyToggle, setStudyToggle] = useState(initialText);
  const [useCalligraphy, setUseCalligraphy] = useState(initialFont);

  // Panel visibility states
  const [showControlPanel, setShowControlPanel] = useState(initialShowControl);
  const [showSyntaxTree, setShowSyntaxTree] = useState(initialShowTree);
  const [showAudioPanel, setShowAudioPanel] = useState(initialShowAudio);

  // Unified audio playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Cantors
  const [cantors, setCantors] = useState(PRELOADED_CANTORS);
  const [selectedCantor, setSelectedCantor] = useState(PRELOADED_CANTORS[0]);

  // Synchronized hover highlights
  const [hoveredWordId, setHoveredWordId] = useState(null);
  const [hoveredPhraseId, setHoveredPhraseId] = useState(null);

  // Dynamic portion details with online fetching & cache support
  const [portionsData, setPortionsData] = useState(PORTIONS_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Load custom cantors from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('torah_reader_custom_cantors');
      if (stored) {
        const custom = JSON.parse(stored);
        if (custom && custom.length > 0) {
          setCantors([...PRELOADED_CANTORS, ...custom]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch and cache missing verses from Sefaria API
  useEffect(() => {
    const fetchAndCache = async () => {
      const refs = ALIYOT_REFS[selectedPortionId];
      if (!refs) return;
      const ref = refs[selectedAliyahIndex];
      if (!ref) return;

      const cacheKey = `torah_cache_${selectedPortionId}_${selectedAliyahIndex}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setPortionsData(prev => {
              const updated = { ...prev };
              updated[selectedPortionId].aliyot[selectedAliyahIndex].verses = parsed;
              return updated;
            });
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached verses', e);
        }
      }

      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(`https://www.sefaria.org/api/texts/${ref}?context=0`);
        if (!response.ok) {
          throw new Error(`Sefaria API returned status ${response.status}`);
        }
        const data = await response.json();
        
        const fetchedVerses = reconstructVerses(data, selectedPortionId);
        
        if (fetchedVerses && fetchedVerses.length > 0) {
          localStorage.setItem(cacheKey, JSON.stringify(fetchedVerses));
          
          setPortionsData(prev => {
            const updated = { ...prev };
            updated[selectedPortionId].aliyot[selectedAliyahIndex].verses = fetchedVerses;
            return updated;
          });
        } else {
          throw new Error("Sefaria returned empty text for this reference.");
        }
      } catch (err) {
        console.error('Error fetching from Sefaria:', err);
        setFetchError(err.message || 'Failed to connect to Sefaria API. Please verify your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCache();
  }, [selectedPortionId, selectedAliyahIndex, retryTrigger]);

  // When portion or Aliyah changes, set active verse to the first verse of that Aliyah
  // We skip this check when isLoading is true to prevent initial URL parameters from being overwritten before fetch finishes
  useEffect(() => {
    if (isLoading) return;
    const activePortion = portionsData[selectedPortionId] || portionsData['bereishit'];
    const aliyahData = activePortion.aliyot[selectedAliyahIndex] || { verses: [] };
    const verses = aliyahData.verses || [];
    if (verses.length > 0) {
      const hasCurrentActive = verses.some(v => v.verseIndex === activeVerseIndex);
      if (!hasCurrentActive) {
        setActiveVerseIndex(verses[0].verseIndex);
      }
    }
    setIsPlaying(false);
  }, [selectedPortionId, selectedAliyahIndex, portionsData, isLoading]);

  // Update URL search parameters to serialize view options and selection state
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('portion', selectedPortionId);
    params.set('aliyah', selectedAliyahIndex.toString());
    params.set('verse', activeVerseIndex.toString());
    params.set('mode', viewMode);
    params.set('text', studyToggle);
    params.set('font', useCalligraphy ? 'calligraphy' : 'plain');
    params.set('showControl', showControlPanel ? 'true' : 'false');
    params.set('showTree', showSyntaxTree ? 'true' : 'false');
    params.set('showAudio', showAudioPanel ? 'true' : 'false');

    const newSearch = '?' + params.toString();
    if (window.location.search !== newSearch) {
      window.history.replaceState(null, '', newSearch);
    }
  }, [
    selectedPortionId,
    selectedAliyahIndex,
    activeVerseIndex,
    viewMode,
    studyToggle,
    useCalligraphy,
    showControlPanel,
    showSyntaxTree,
    showAudioPanel
  ]);

  const handleAddCantor = (newCantor) => {
    const updated = [...cantors.filter(c => c.username !== newCantor.username), newCantor];
    setCantors(updated);
    const customOnly = updated.filter(
      c => !PRELOADED_CANTORS.some(p => p.username === c.username)
    );
    localStorage.setItem('torah_reader_custom_cantors', JSON.stringify(customOnly));
    setSelectedCantor(newCantor);
  };

  // Get active portion & Aliyah verses
  const activePortion = portionsData[selectedPortionId] || portionsData['bereishit'];
  const aliyahData = activePortion.aliyot[selectedAliyahIndex] || { verses: [] };
  const aliyahVerses = aliyahData.verses || [];

  // Parse verses using cantillationParser
  const parsedVerses = aliyahVerses.map(v => {
    const cleanedText = cleanSefariaText(v.text);
    const parsed = parseVerse(cleanedText, v.verseIndex, selectedPortionId);
    parsed.reference = v.reference;
    return parsed;
  });

  const activeVerse = parsedVerses.find(v => v.verseIndex === activeVerseIndex) || parsedVerses[0];

  // Extract motifs in active verse
  const motifsInActiveVerse = activeVerse ? detectMotifs(activeVerse.words, activeVerseIndex) : [];

  return (
    <div className="app-shell" dir="ltr">
      {/* Header */}
      <header className="app-header glass-header">
        <div className="header-brand">
          <div className="brand-logo bg-gold-gradient">
            <Sparkles size={16} className="text-dark" />
          </div>
          <div>
            <h1 className="brand-name">קריאת התורה • Keriat HaTorah</h1>
            <p className="brand-tagline">Syntactic Phrase Parsing & Chironomy Coaching Portal</p>
          </div>
        </div>

        {activeTab === 'reader' && activePortion && (
          <div className="header-center-title" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 className="scroll-title font-hebrew" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.2rem', color: 'var(--color-text)' }}>
              {isLoading && (
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid var(--color-gold)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite'
                  }}
                  title="Syncing from Sefaria..."
                />
              )}
              {activePortion.name} • עלייה {selectedAliyahIndex}
            </h2>
            <span className="scroll-ref text-xs text-muted block font-mono" style={{ margin: 0 }}>
              {parsedVerses.length} verses | {activePortion.book}
            </span>
          </div>
        )}

        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center' }}>
          {activeTab === 'reader' && (
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px', borderRight: '1px solid var(--color-card-border)', paddingRight: '16px' }}>
              <button
                className={`nav-link ${showControlPanel ? 'nav-link-active' : ''}`}
                style={{ color: showControlPanel ? 'var(--color-teal)' : 'var(--color-text)', padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setShowControlPanel(prev => !prev)}
                title="Toggle Left Control Desk Sidebar"
              >
                {showControlPanel ? 'Hide Controls' : 'Show Controls'}
              </button>
              <button
                className={`nav-link ${showSyntaxTree ? 'nav-link-active' : ''}`}
                style={{ color: showSyntaxTree ? 'var(--color-teal)' : 'var(--color-text)', padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setShowSyntaxTree(prev => !prev)}
                title="Toggle Right Syntax Analysis Panel"
              >
                {showSyntaxTree ? 'Hide Syntax' : 'Show Syntax'}
              </button>
              <button
                className={`nav-link ${showAudioPanel ? 'nav-link-active' : ''}`}
                style={{ color: showAudioPanel ? 'var(--color-teal)' : 'var(--color-text)', padding: '6px 12px', fontSize: '12px' }}
                onClick={() => setShowAudioPanel(prev => !prev)}
                title="Toggle Audio Panel"
              >
                {showAudioPanel ? 'Hide Audio' : 'Show Audio'}
              </button>
            </div>
          )}
          <button
            className={`nav-link ${activeTab === 'reader' ? 'nav-link-active' : ''}`}
            onClick={() => setActiveTab('reader')}
          >
            <BookOpen size={16} /> Reading Room
          </button>
          <button
            className={`nav-link ${activeTab === 'motifs' ? 'nav-link-active' : ''}`}
            onClick={() => setActiveTab('motifs')}
          >
            <Milestone size={16} /> Motifs Explorer
          </button>
          <button
            className={`nav-link ${activeTab === 'ingestion' ? 'nav-link-active' : ''}`}
            onClick={() => setActiveTab('ingestion')}
          >
            <Upload size={16} /> Cantor Ingestion
          </button>
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'nav-link-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={16} /> Dashboards
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="app-main-content">
        {activeTab === 'reader' && (
          <div className="reader-layout-grid" style={{ gridTemplateColumns: showSyntaxTree ? '1fr 340px' : '1fr', gap: '24px' }}>
            <div className="layout-col-left flex flex-col gap-6">
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              
              {isLoading && parsedVerses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 glass-card text-center" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="mb-6" style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid var(--color-card-border)',
                    borderTopColor: 'var(--color-gold)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <h3 className="text-white text-lg font-hebrew mb-2">טוען את פסוקי הפרשה...</h3>
                  <p className="text-xs text-muted font-sans">Connecting to Sefaria API to fetch Deuteronomy / Genesis verses...</p>
                </div>
              ) : fetchError && parsedVerses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 glass-card text-center" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={48} className="text-red-500 mb-4" style={{ color: '#ef4444' }} />
                  <h3 className="text-white text-lg font-hebrew mb-2">שגיאה בטעינת הנתונים</h3>
                  <p className="text-sm text-muted font-sans max-w-md mb-6">{fetchError}</p>
                  <button 
                    className="btn btn-green-action flex items-center gap-2"
                    style={{ background: 'var(--color-teal)', color: 'var(--color-bg)', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', border: 'none' }}
                    onClick={() => setRetryTrigger(prev => prev + 1)}
                  >
                    <RefreshCw size={14} /> נסה שוב (Retry)
                  </button>
                </div>
              ) : parsedVerses.length > 0 ? (
                <>
                  <TorahViewer
                    portionsData={portionsData}
                    selectedPortionId={selectedPortionId}
                    onSelectPortion={setSelectedPortionId}
                    selectedAliyahIndex={selectedAliyahIndex}
                    onSelectAliyah={setSelectedAliyahIndex}
                    verseData={parsedVerses}
                    activeVerseIndex={activeVerseIndex}
                    onSelectVerse={setActiveVerseIndex}
                    hoveredWordId={hoveredWordId}
                    onHoverWord={setHoveredWordId}
                    hoveredPhraseId={hoveredPhraseId}
                    onHoverPhrase={setHoveredPhraseId}
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onReset={() => setResetTrigger(prev => prev + 1)}
                    selectedCantor={selectedCantor}
                    onSelectCantor={setSelectedCantor}
                    cantors={cantors}
                    isLoading={isLoading}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    studyToggle={studyToggle}
                    onStudyToggleChange={setStudyToggle}
                    useCalligraphy={useCalligraphy}
                    onUseCalligraphyChange={setUseCalligraphy}
                    showControlPanel={showControlPanel}
                    onShowControlPanelChange={setShowControlPanel}
                    showSyntaxTree={showSyntaxTree}
                    onShowSyntaxTreeChange={setShowSyntaxTree}
                    showAudioPanel={showAudioPanel}
                    onShowAudioPanelChange={setShowAudioPanel}
                  />

                  {/* Chironomy & Audio Playback Panel */}
                  {activeVerse && showAudioPanel && (
                    <CoachingPanel
                      cantors={cantors}
                      selectedCantor={selectedCantor}
                      onSelectCantor={setSelectedCantor}
                      activeVerseIndex={activeVerseIndex}
                      onSelectVerse={setActiveVerseIndex}
                      activeVerse={activeVerse}
                      motifsInVerse={motifsInActiveVerse}
                      onHoverWord={setHoveredWordId}
                      onHoverPhrase={setHoveredPhraseId}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      resetTrigger={resetTrigger}
                    />
                  )}

                  {/* Practicing Recorder Module */}
                  {activeVerse && showAudioPanel && (
                    <RecordingModule
                      activeVerse={activeVerse}
                      selectedCantor={selectedCantor}
                      motifsInVerse={motifsInActiveVerse}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 glass-card text-center" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <p className="text-muted font-sans text-lg">No verses available for this portion / Aliyah.</p>
                </div>
              )}
            </div>

            {showSyntaxTree && (
              <div className="layout-col-right">
                {/* Expandable AST Tree panel */}
                {activeVerse && (
                  <SyntaxTreePanel
                    activeVerse={activeVerse}
                    hoveredWordId={hoveredWordId}
                    onHoverWord={setHoveredWordId}
                    hoveredPhraseId={hoveredPhraseId}
                    onHoverPhrase={setHoveredPhraseId}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'motifs' && <MotifExplorer />}

        {activeTab === 'ingestion' && (
          <AudioIngestionPanel
            onAddCantor={handleAddCantor}
            existingCantors={cantors}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectVerse={(idx) => {
              setActiveVerseIndex(idx);
              setActiveTab('reader');
            }}
            allVersesCount={parsedVerses.length}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Keriat HaTorah Coach. Dedicated to the study of Ta'amei HaMikra syntax.</p>
      </footer>
    </div>
  );
}
