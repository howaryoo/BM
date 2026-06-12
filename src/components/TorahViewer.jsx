import { useState, useEffect } from 'react';
import { Play, RotateCcw, Sparkles } from 'lucide-react';

export default function TorahViewer({
  portionsData,
  selectedPortionId,
  onSelectPortion,
  selectedAliyahIndex,
  onSelectAliyah,
  verseData, // active aliyah verses
  activeVerseIndex,
  onSelectVerse,
  hoveredWordId,
  onHoverWord,
  hoveredPhraseId,
  onHoverPhrase,
  isPlaying,
  onPlayPause,
  onReset,
  isLoading,
  viewMode,
  onViewModeChange,
  studyToggle,
  onStudyToggleChange,
  useCalligraphy,
  onUseCalligraphyChange,
  showControlPanel,
  onShowControlPanelChange,
  showSyntaxTree,
  onShowSyntaxTreeChange,
  showAudioPanel,
  onShowAudioPanelChange
}) {

  const activePortion = portionsData[selectedPortionId];

  // Flatten parsed words across all verses
  const allWords = [];
  verseData.forEach(v => {
    v.words.forEach(w => {
      w.ast = v.ast;
      w.reference = v.reference;
      allWords.push(w);
    });
  });

  const specialSequenceWordIds = new Set();
  if (studyToggle === 'special_sequence_1') {
    for (let i = 0; i < allWords.length - 2; i++) {
      if (
        allWords[i].governingAccent?.id === 'mahpach' &&
        allWords[i+1].governingAccent?.id === 'pashta' &&
        allWords[i+2].governingAccent?.id === 'zaqef_katan'
      ) {
        specialSequenceWordIds.add(allWords[i].id);
        specialSequenceWordIds.add(allWords[i+1].id);
        specialSequenceWordIds.add(allWords[i+2].id);
      }
    }
  } else if (studyToggle === 'special_sequence_2') {
    for (let i = 0; i < allWords.length - 2; i++) {
      if (
        allWords[i].governingAccent?.id === 'mercha' &&
        allWords[i+1].governingAccent?.id === 'tipeha' &&
        allWords[i+2].governingAccent?.id === 'etnachta'
      ) {
        specialSequenceWordIds.add(allWords[i].id);
        specialSequenceWordIds.add(allWords[i+1].id);
        specialSequenceWordIds.add(allWords[i+2].id);
      }
    }
  } else if (studyToggle === 'special_sequence_3') {
    for (let i = 0; i < allWords.length - 2; i++) {
      if (
        allWords[i].governingAccent?.id === 'mercha' &&
        allWords[i+1].governingAccent?.id === 'tipeha' &&
        (allWords[i+2].governingAccent?.id === 'silluq' || allWords[i+2].isSofPasuq)
      ) {
        specialSequenceWordIds.add(allWords[i].id);
        specialSequenceWordIds.add(allWords[i+1].id);
        specialSequenceWordIds.add(allWords[i+2].id);
      }
    }
  }

  const handleScroll = (e) => {
    if (isLoading) return;
    const container = e.target;
    if (container.scrollTop === 0) {
      if (selectedAliyahIndex > 1) {
        onSelectAliyah(selectedAliyahIndex - 1);
      }
    } else if (Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight) {
      const maxAliyah = activePortion && activePortion.aliyot ? Object.keys(activePortion.aliyot).length : 1;
      if (selectedAliyahIndex < maxAliyah) {
        onSelectAliyah(selectedAliyahIndex + 1);
      }
    }
  };

  // Auto-scroll active verse line-row into centered focus within the scroll viewport
  useEffect(() => {
    const container = document.querySelector('.scroll-parchment-white');
    const activeEl = document.querySelector('.verse-row-active-white');
    if (container && activeEl) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const relativeTop = activeRect.top - containerRect.top + container.scrollTop;
      const targetScrollTop = relativeTop - (containerRect.height / 2) + (activeRect.height / 2);
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });
    }
  }, [activeVerseIndex]);

  // Helper to color words by governing phrase (governed by disjunctive accent)
  const getPhraseColorClass = (accent) => {
    switch (accent) {
      case 'etnachta': return 'phrase-etnachta';
      case 'zaqef_katan':
      case 'zaqef_gadol': return 'phrase-zaqef';
      case 'revia': return 'phrase-revia';
      case 'tevir': return 'phrase-tevir';
      case 'tipeha': return 'phrase-tipeha';
      case 'pashta': return 'phrase-pashta';
      case 'sof_pasuq':
      case 'silluq': return 'phrase-sof-pasuq';
      default: return '';
    }
  };

  // Check if word belongs to hovered phrase node
  const isWordInHoveredPhrase = (word, ast) => {
    if (!hoveredPhraseId || !ast) return false;
    let found = false;
    const checkNode = (node) => {
      if (node.id === hoveredPhraseId) {
        found = true;
        return;
      }
      if (node.children) {
        node.children.forEach(checkNode);
      }
    };
    checkNode(ast);
    
    if (found) {
      const wordIds = [];
      const collectWords = (node) => {
        if (node.type === 'word') {
          wordIds.push(node.id);
        }
        if (node.children) {
          node.children.forEach(collectWords);
        }
      };
      const findAndCollect = (node) => {
        if (node.id === hoveredPhraseId) {
          collectWords(node);
        } else if (node.children) {
          node.children.forEach(findAndCollect);
        }
      };
      findAndCollect(ast);
      return wordIds.includes(word.id);
    }
    return false;
  };

  // Render a single word with event handlers (Verse View)
  const renderWord = (word, ast) => {
    const isHovered = hoveredWordId === word.id;
    const isInHoveredPhrase = isWordInHoveredPhrase(word, ast);
    
    let wordText = word.originalText;
    if (studyToggle === 'plain') {
      wordText = word.cleanText;
    } else if (studyToggle === 'niqqud') {
      wordText = word.vowelsText;
    }

    let phraseColorClass = '';
    if (studyToggle.startsWith('special_sequence')) {
      if (specialSequenceWordIds.has(word.id)) {
        phraseColorClass = 'phrase-zaqef';
      }
    } else if (studyToggle === 'phrase') {
      const findGoverningPhrase = (node, parentColor = '') => {
        let currentColor = parentColor;
        if (node.type === 'phrase') {
          currentColor = getPhraseColorClass(node.accent);
        }
        if (node.type === 'word' && node.id === word.id) {
          return currentColor;
        }
        if (node.children) {
          for (let child of node.children) {
            const res = findGoverningPhrase(child, currentColor);
            if (res) return res;
          }
        }
        return '';
      };
      phraseColorClass = findGoverningPhrase(ast);
    }

    return (
      <span
        key={word.id}
        id={word.id}
        className={`scroll-word-pill ${isHovered ? 'word-active-pill' : ''} ${isInHoveredPhrase ? 'phrase-active-pill' : ''} ${phraseColorClass}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelectVerse(word.verseIndex);
        }}
        onMouseEnter={() => {
          onHoverWord(word.id);
          if (studyToggle === 'phrase') {
            const getPhraseIdForWord = (node, parentPhraseId = null) => {
              let currentPhraseId = parentPhraseId;
              if (node.type === 'phrase') {
                currentPhraseId = node.id;
              }
              if (node.type === 'word' && node.id === word.id) {
                return currentPhraseId;
              }
              if (node.children) {
                for (let child of node.children) {
                  const res = getPhraseIdForWord(child, currentPhraseId);
                  if (res) return res;
                }
              }
              return null;
            };
            const phraseId = getPhraseIdForWord(ast);
            if (phraseId) onHoverPhrase(phraseId);
          }
        }}
        onMouseLeave={() => {
          onHoverWord(null);
          onHoverPhrase(null);
        }}
      >
        {wordText}
      </span>
    );
  };

  // Render a single word for Torah Scroll View (Flexbox Flow)
  const renderScrollWord = (word, ast, layout) => {
    const isHovered = hoveredWordId === word.id;
    const isInHoveredPhrase = isWordInHoveredPhrase(word, ast);
    
    let wordText = word.originalText;
    if (studyToggle === 'plain') {
      wordText = word.cleanText;
    } else if (studyToggle === 'niqqud') {
      wordText = word.vowelsText;
    }

    let phraseColorClass = '';
    if (studyToggle.startsWith('special_sequence')) {
      if (specialSequenceWordIds.has(word.id)) {
        phraseColorClass = 'phrase-zaqef';
      }
    } else if (studyToggle === 'phrase') {
      const findGoverningPhrase = (node, parentColor = '') => {
        let currentColor = parentColor;
        if (node.type === 'phrase') {
          currentColor = getPhraseColorClass(node.accent);
        }
        if (node.type === 'word' && node.id === word.id) {
          return currentColor;
        }
        if (node.children) {
          for (let child of node.children) {
            const res = findGoverningPhrase(child, currentColor);
            if (res) return res;
          }
        }
        return '';
      };
      phraseColorClass = findGoverningPhrase(ast);
    }

    return (
      <span
        key={word.id}
        id={word.id}
        className={`scroll-word-pill ${isHovered ? 'word-active-pill' : ''} ${isInHoveredPhrase ? 'phrase-active-pill' : ''} ${phraseColorClass}`}
        style={{
          margin: 0,
          whiteSpace: 'nowrap',
          display: 'inline-block',
          fontSize: '25px',
          lineHeight: '1.2',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectVerse(word.verseIndex);
        }}
        onMouseEnter={() => {
          onHoverWord(word.id);
          if (studyToggle === 'phrase') {
            const getPhraseIdForWord = (node, parentPhraseId = null) => {
              let currentPhraseId = parentPhraseId;
              if (node.type === 'phrase') {
                currentPhraseId = node.id;
              }
              if (node.type === 'word' && node.id === word.id) {
                return currentPhraseId;
              }
              if (node.children) {
                for (let child of node.children) {
                  const res = getPhraseIdForWord(child, currentPhraseId);
                  if (res) return res;
                }
              }
              return null;
            };
            const phraseId = getPhraseIdForWord(ast);
            if (phraseId) onHoverPhrase(phraseId);
          }
        }}
        onMouseLeave={() => {
          onHoverWord(null);
          onHoverPhrase(null);
        }}
      >
        {wordText}
      </span>
    );
  };

  // Dynamically compile layouts for the active Aliyah words
  const maxLinesPerCol = 6;
  const colWidth = 540;
  const layouts = {};

  // Get static linesConfig if available
  let linesConfig = [];
  if (activePortion && activePortion.aliyot && activePortion.aliyot[selectedAliyahIndex]) {
    linesConfig = [...(activePortion.aliyot[selectedAliyahIndex].linesConfig || [])];
  }

  const totalWords = allWords.length;
  const staticWordsCount = linesConfig.reduce((sum, cfg) => sum + cfg.count, 0);

  if (totalWords > staticWordsCount) {
    const leftoverWords = totalWords - staticWordsCount;
    const wordsPerLine = 7;
    const extraLinesCount = Math.ceil(leftoverWords / wordsPerLine);
    for (let i = 0; i < extraLinesCount; i++) {
      linesConfig.push({
        count: (i === extraLinesCount - 1) ? (leftoverWords - i * wordsPerLine) : wordsPerLine,
        indent: false
      });
    }
  }

  let wordPointer = 0;
  linesConfig.forEach((lineCfg, lineIdx) => {
    const lineNum = lineIdx + 1;
    const colNum = Math.ceil(lineNum / maxLinesPerCol);
    const lineInCol = ((lineNum - 1) % maxLinesPerCol) + 1;
    const count = lineCfg.count;

    const lineWords = allWords.slice(wordPointer, wordPointer + count);
    lineWords.forEach((w) => {
      layouts[w.id] = {
        column: colNum,
        line: lineInCol,
        stretch: 1.0
      };
    });

    wordPointer += count;
  });

  // Handle any leftover words
  if (wordPointer < allWords.length) {
    const remainingWords = allWords.slice(wordPointer);
    const startLineNum = linesConfig.length + 1;
    remainingWords.forEach((w, i) => {
      const lineNum = startLineNum + Math.floor(i / 7);
      const colNum = Math.ceil(lineNum / maxLinesPerCol);
      const lineInCol = ((lineNum - 1) % maxLinesPerCol) + 1;
      layouts[w.id] = {
        column: colNum,
        line: lineInCol,
        stretch: 1.0
      };
    });
  }

  // Group flattened words into columns and lines based on compiled layouts
  const columnMap = {};
  allWords.forEach(w => {
    const layout = layouts[w.id] || { column: 1, line: 99, stretch: 1.0 };
    const col = layout.column || 1;
    const lineNum = layout.line || 1;
    if (!columnMap[col]) {
      columnMap[col] = {};
    }
    if (!columnMap[col][lineNum]) {
      columnMap[col][lineNum] = [];
    }
    columnMap[col][lineNum].push({
      word: w,
      layout
    });
  });

  return (
    <div className="tikun-layout-wrapper" style={{ gridTemplateColumns: showControlPanel ? '260px 1fr' : '1fr' }}>
      {/* 1. LEFT SIDEBAR CONTROL PANEL */}
      {showControlPanel && (
        <div className="tikun-control-panel glass-card">
        <div className="control-header-box bg-green-accent">
          <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} /> לוח קריאות • Reading Desk
          </span>
        </div>

        {/* Portion Selector dropdown */}
        <div className="control-row">
          <label className="control-label text-xs block mb-1">פרשה (Portion)</label>
          <select
            value={selectedPortionId}
            onChange={(e) => onSelectPortion(e.target.value)}
            className="panel-select w-full"
          >
            {Object.keys(portionsData).map(id => (
              <option key={id} value={id}>{portionsData[id].name}</option>
            ))}
          </select>
        </div>

        {/* Aliyah subsection dropdown */}
        <div className="control-row">
          <label className="control-label text-xs block mb-1">עלייה (Aliyah)</label>
          <select
            value={selectedAliyahIndex}
            onChange={(e) => onSelectAliyah(parseInt(e.target.value))}
            className="panel-select w-full"
          >
            {activePortion && Object.keys(activePortion.aliyot).map(idxStr => (
              <option key={idxStr} value={idxStr}>עלייה {idxStr}</option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="control-row mt-3">
          <label className="control-label text-xs block mb-1">מצב תצוגה (View Mode)</label>
          <div className="flex gap-2 mb-1" style={{ background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '6px' }}>
            <button
              className={`flex-1 text-center py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'scroll'
                  ? 'bg-gold text-dark shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
              onClick={() => onViewModeChange('scroll')}
            >
              ספר תורה (Scroll)
            </button>
            <button
              className={`flex-1 text-center py-1.5 px-2 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'verse'
                  ? 'bg-gold text-dark shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
              onClick={() => onViewModeChange('verse')}
            >
              פסוקים (Verses)
            </button>
          </div>
        </div>

        {/* Text Display mode selection */}
        <div className="control-row mt-3 mb-3">
          <label className="control-label text-xs block mb-1">רמת טקסט (Text Elements)</label>
          <select
            value={studyToggle}
            onChange={(e) => onStudyToggleChange(e.target.value)}
            className="panel-select w-full font-sans"
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#ffffff',
              border: '1px solid var(--color-card-border)',
              cursor: 'pointer'
            }}
          >
            <option value="plain">ספר תורה (Scroll - Text Only)</option>
            <option value="niqqud">חומש מנוקד (Vocalized - Niqqud Only)</option>
            <option value="full">מלא (Full - Niqqud & Accents)</option>
            <option value="phrase">תחביר (Syntax Phrases - Colored)</option>
            <option value="special_sequence_1">שופר מהופך ־ פשטא ־ זקף קטן</option>
            <option value="special_sequence_2">מאריך ־ טרחה ־ אתנח</option>
            <option value="special_sequence_3">מאריך ־ טרחה ־ סוף פסוק</option>
          </select>
        </div>

        {/* Play controls card */}
        <div className="control-play-card mt-3">
          <button className="btn btn-block btn-green-action flex items-center justify-center gap-2 mb-2" onClick={onPlayPause}>
            <Play size={14} /> {isPlaying ? 'השהה (Pause)' : 'נגן (Play)'}
          </button>
          <button className="btn btn-block btn-outline flex items-center justify-center gap-2 text-xs" onClick={onReset}>
            <RotateCcw size={12} /> התחל מהתחלה (Restart)
          </button>
        </div>

        {/* Calligraphy Toggle buttons */}
        <div className="calligraphy-toggle flex justify-center gap-2 mt-4 pt-3 border-t">
          <button
            className={`btn-font-toggle font-hebrew text-lg font-bold ${!useCalligraphy ? 'font-toggle-active' : ''}`}
            onClick={() => onUseCalligraphyChange(false)}
            title="Plain Hebrew Font"
          >
            א
          </button>
          <button
            className={`btn-font-toggle font-hebrew text-lg font-bold tagin-font ${useCalligraphy ? 'font-toggle-active' : ''}`}
            onClick={() => onUseCalligraphyChange(true)}
            title="Calligraphy Stam Font"
          >
            אּ
          </button>
        </div>
      </div>
      )}

      {/* 2. RIGHT SIDE TORAH SCROLL SHEETS (WHITE BACKGROUND, BLACK CONTINUOUS TEXT) */}
      <div className="tikun-scroll-paper scroll-parchment-white" onScroll={handleScroll}>
        {/* Scroll Header */}
        <div className="scroll-paper-header border-b pb-3 mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Panel Toggles directly in the reading UI */}
          <div className="panel-visibility-desk-toggles" style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)',
                background: showControlPanel ? '#f5f5f5' : 'transparent',
                color: '#222222',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onShowControlPanelChange(!showControlPanel)}
              title="Show or hide the settings panel"
            >
              {showControlPanel ? 'Hide Controls' : 'Show Controls'}
            </button>
            <button
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)',
                background: showSyntaxTree ? '#f5f5f5' : 'transparent',
                color: '#222222',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onShowSyntaxTreeChange(!showSyntaxTree)}
              title="Show or hide the syntax tree panel"
            >
              {showSyntaxTree ? 'Hide Syntax' : 'Show Syntax'}
            </button>
            <button
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(0,0,0,0.12)',
                background: showAudioPanel ? '#f5f5f5' : 'transparent',
                color: '#222222',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
              onClick={() => onShowAudioPanelChange(!showAudioPanel)}
              title="Show or hide the audio panel"
            >
              {showAudioPanel ? 'Hide Audio' : 'Show Audio'}
            </button>
          </div>

        </div>

        {/* Reading column container */}
        <div className={`scroll-reading-column ${useCalligraphy ? 'tagin-font' : 'plain-serif-font'}`} dir="rtl">
          {viewMode === 'scroll' ? (
            <div className="scroll-columns-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', padding: '10px 0' }}>
              {Object.keys(columnMap).sort((a,b) => a - b).map(colStr => {
                const colLines = columnMap[colStr];
                return (
                  <div
                    key={colStr}
                    className="scroll-column-sheet-custom"
                    style={{
                      width: '540px',
                      position: 'relative',
                      backgroundColor: '#ffffff',
                      borderRight: '1px solid #f2e9d9',
                      borderLeft: '1px solid #f2e9d9',
                      padding: '10px 0',
                      minHeight: '290px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                      borderRadius: '4px'
                    }}
                  >
                    {Object.keys(colLines).sort((a,b) => a - b).map(lineNumStr => {
                      const lineNum = parseInt(lineNumStr);
                      const lineWords = colLines[lineNumStr];
                      const hasActiveVerse = lineWords.some(({ word }) => word.verseIndex === activeVerseIndex);
                      const numWords = lineWords.length;

                      // Check if this line is indented (if the first word has layout x of 80)
                      const isLineIndented = lineWords[0]?.layout?.x >= 80;

                      // Identify which verses begin on this line (i.e. contain the first word with index === 0)
                      const startingVerses = [];
                      lineWords.forEach(({ word }) => {
                        if (word.index === 0) {
                          startingVerses.push(word.verseIndex);
                        }
                      });

                      const maxLineNum = Math.max(...Object.keys(colLines).map(l => parseInt(l)));
                      const isLastLine = lineNum === maxLineNum;

                      return (
                        <div
                          key={lineNum}
                          className={`scroll-line-row ${hasActiveVerse ? 'verse-row-active-white' : ''}`}
                          style={{
                            position: 'relative',
                            height: '45px',
                            width: '100%',
                            borderBottom: '1px dashed rgba(0,0,0,0.05)',
                            display: 'flex',
                            direction: 'rtl',
                            justifyContent: isLastLine ? 'flex-start' : 'space-between',
                            alignItems: 'center',
                            margin: 0,
                            paddingRight: isLineIndented ? '80px' : '15px',
                            paddingLeft: '15px',
                            gap: isLastLine ? '12px' : '0px'
                          }}
                        >
                          {/* Flexbox positioned words with dynamic justification alignment */}
                          {lineWords.map(({ word, layout }) => {
                            return renderScrollWord(word, word.ast, layout);
                          })}

                          {/* Float starting verse badges on the left side of the line for reader reference */}
                          {startingVerses.length > 0 && (
                            <div
                              className="absolute-verse-badge-container"
                              style={{
                                position: 'absolute',
                                left: '-35px',
                                top: '10px',
                                display: 'flex',
                                gap: '4px',
                                zIndex: 10
                              }}
                            >
                              {startingVerses.map(vIdx => (
                                <span
                                  key={vIdx}
                                  className="scroll-verse-badge animate-fade-in"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectVerse(vIdx);
                                  }}
                                  style={{ cursor: 'pointer', opacity: 0.8 }}
                                  title={`Verse ${vIdx}`}
                                >
                                  {vIdx}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Verse View: grouped by verse, natural flex flow */
            <div className="verse-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {verseData.map((verse) => {
                const hasActiveVerse = verse.verseIndex === activeVerseIndex;
                return (
                  <div
                    key={verse.verseIndex}
                    className={`scroll-line-row ${hasActiveVerse ? 'verse-row-active-white' : ''}`}
                    onClick={() => onSelectVerse(verse.verseIndex)}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="scroll-verse-text" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', flex: 1 }}>
                      {verse.words.map((w) => renderWord(w, verse.ast))}
                    </div>
                    <div className="scroll-verse-badge-wrapper" style={{ flexShrink: 0, paddingRight: '12px' }}>
                      <span
                        className="scroll-verse-badge"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVerse(verse.verseIndex);
                        }}
                        title={`Verse ${verse.verseIndex}`}
                      >
                        {verse.verseIndex}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
