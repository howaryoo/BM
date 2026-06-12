import React, { useState, useEffect } from 'react';
import { GitMerge, ChevronDown, ChevronRight, Hash } from 'lucide-react';

export default function SyntaxTreePanel({
  activeVerse,
  hoveredWordId,
  onHoverWord,
  hoveredPhraseId,
  onHoverPhrase
}) {
  const [collapsedNodes, setCollapsedNodes] = useState({});

  useEffect(() => {
    if (hoveredWordId) {
      const el = document.getElementById(`tree-node-${hoveredWordId}`);
      const container = document.querySelector('.tree-scroll-container');
      if (el && container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        
        if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
          const relativeTop = elRect.top - containerRect.top + container.scrollTop;
          const targetScrollTop = relativeTop - (containerRect.height / 2) + (elRect.height / 2);
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [hoveredWordId]);

  if (!activeVerse) {
    return (
      <div className="syntax-tree-panel glass-card empty-panel-state">
        <GitMerge size={40} className="icon-muted" />
        <p className="text-muted text-sm mt-2">Select a verse to inspect its syntax tree</p>
      </div>
    );
  }

  const toggleCollapse = (nodeId, e) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Helper to collect all word IDs under a phrase node (for highlighting)
  const getWordIdsUnderNode = (node) => {
    const ids = [];
    const collect = (n) => {
      if (n.type === 'word') {
        ids.push(n.id);
      }
      if (n.children) {
        n.children.forEach(collect);
      }
    };
    collect(node);
    return ids;
  };

  // Recursive tree node renderer
  const renderTreeNode = (node, depth = 0) => {
    const isCollapsed = !!collapsedNodes[node.id];

    if (node.type === 'word') {
      const wordId = node.id;
      const isWordHovered = hoveredWordId === wordId;
      const isPhraseHovered = hoveredPhraseId && hoveredPhraseId.includes(wordId.split('-w')[0]); // simplified check

      return (
        <div
          key={node.id}
          id={`tree-node-${wordId}`}
          className={`tree-leaf-node ${isWordHovered ? 'node-highlighted' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onMouseEnter={() => onHoverWord(wordId)}
          onMouseLeave={() => onHoverWord(null)}
        >
          <span className="node-bullet">•</span>
          <span className="node-word-text font-hebrew">{node.word.originalText}</span>
          <span className="node-word-trans">{node.word.cleanText}</span>
          {node.word.governingAccent && (
            <span className={`node-badge badge-conj`}>
              {node.word.governingAccent.symbol} {node.word.governingAccent.name}
            </span>
          )}
        </div>
      );
    }

    if (node.type === 'phrase') {
      const isPhraseHovered = hoveredPhraseId === node.id;
      const wordIds = getWordIdsUnderNode(node);
      const containsHoveredWord = wordIds.includes(hoveredWordId);
      const hasChildren = node.children && node.children.length > 0;

      // Group disjunctive tags
      const isRoot = node.accent === 'sof_pasuq';

      return (
        <div key={node.id} className="tree-branch-container">
          <div
            className={`tree-branch-node ${isPhraseHovered ? 'node-highlighted' : ''} ${containsHoveredWord ? 'node-parent-highlighted' : ''} ${isRoot ? 'node-root-style' : ''}`}
            style={{ paddingLeft: `${depth * 16}px` }}
            onClick={(e) => {
              // Highlight the entire phrase on click
              onHoverPhrase(isPhraseHovered ? null : node.id);
            }}
            onMouseEnter={() => {
              onHoverPhrase(node.id);
            }}
            onMouseLeave={() => {
              onHoverPhrase(null);
            }}
          >
            {hasChildren ? (
              <button
                className="btn-collapse"
                onClick={(e) => toggleCollapse(node.id, e)}
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <span className="btn-placeholder"></span>
            )}
            
            <span className="node-branch-symbol font-hebrew">{node.symbol}</span>
            <span className="node-branch-title">{node.accentName} Phrase</span>
            <span className="node-words-count text-xs text-muted">
              ({wordIds.length} {wordIds.length === 1 ? 'word' : 'words'})
            </span>

            {node.headWord && (
              <span className="node-head-word font-hebrew text-xs">
                Head: {node.headWord.cleanText}
              </span>
            )}
          </div>

          {!isCollapsed && hasChildren && (
            <div className="tree-branch-children">
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="syntax-tree-panel glass-card">
      <div className="panel-header border-b">
        <h4 className="panel-title">
          <GitMerge size={18} className="icon-gold" />
          <span>עץ תחבירי (Syntax Parse Tree)</span>
        </h4>
        <span className="badge-verse text-xs">
          Verse {activeVerse.verseIndex}
        </span>
      </div>

      <div className="panel-instruction text-xs text-muted px-4 py-2 border-b">
        Hover nodes to highlight corresponding text. Tap a phrase to select.
      </div>

      <div className="tree-scroll-container">
        {renderTreeNode(activeVerse.ast)}
      </div>
    </div>
  );
}
