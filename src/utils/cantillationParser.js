// Torah Cantillation Syntactic Parser (Ta'amei HaMikra)
// Syntactically parses Hebrew text into a phrase tree based on Masoretic disjunctives/conjunctives.

export const TAAMIM_MAP = {
  // Disjunctives (Phonetic accents that split phrases)
  '\u0591': { id: 'etnachta', name: 'Etnachta', symbol: '֑', type: 'disjunctive', strength: 2, description: 'Major division of a verse' },
  '\u0592': { id: 'segolta', name: 'Segolta', symbol: '֒', type: 'disjunctive', strength: 3, description: 'Subordinate division in first half' },
  '\u0593': { id: 'shalshelet', name: 'Shalshelet', symbol: '֓', type: 'disjunctive', strength: 4, description: 'Rare high-level disjunctive' },
  '\u0594': { id: 'zaqef_katan', name: 'Zaqef Katan', symbol: '֔', type: 'disjunctive', strength: 4, description: 'Medium division' },
  '\u0595': { id: 'zaqef_gadol', name: 'Zaqef Gadol', symbol: '֕', type: 'disjunctive', strength: 4, description: 'Emphasized zaqef division' },
  '\u0596': { id: 'tipeha', name: 'Tipeha', symbol: '֖', type: 'disjunctive', strength: 6, description: 'Major separator serving Etnachta/Silluq' },
  '\u0597': { id: 'revia', name: 'Revia', symbol: '֗', type: 'disjunctive', strength: 5, description: 'Sustained level-2 disjunctive' },
  '\u0598': { id: 'zarqa', name: 'Zarqa', symbol: '֘', type: 'disjunctive', strength: 7, description: 'Serves Segolta' },
  '\u0599': { id: 'pashta', name: 'Pashta', symbol: '֙', type: 'disjunctive', strength: 8, description: 'Serves Zaqef Katan' },
  '\u059A': { id: 'yetiv', name: 'Yetiv', symbol: '֚', type: 'disjunctive', strength: 8, description: 'Pre-positive disjunctive serving Zaqef' },
  '\u059B': { id: 'tevir', name: 'Tevir', symbol: '֛', type: 'disjunctive', strength: 9, description: 'Serves Tipeha' },
  '\u059D': { id: 'geresh', name: 'Geresh', symbol: '֝', type: 'disjunctive', strength: 10, description: 'Minor disjunctive' },
  '\u059F': { id: 'gershayim', name: 'Gershayim', symbol: '֟', type: 'disjunctive', strength: 10, description: 'Double Geresh disjunctive' },
  '\u05A0': { id: 'telisha_gedola', name: 'Telisha Gedola', symbol: '֠', type: 'disjunctive', strength: 10, description: 'Pre-positive disjunctive' },
  '\u05A1': { id: 'pazer', name: 'Pazer', symbol: '֡', type: 'disjunctive', strength: 10, description: 'Multi-pitched disjunctive' },
  '\u05A2': { id: 'qarnei_farah', name: 'Qarnei Farah', symbol: '֢', type: 'disjunctive', strength: 10, description: 'Rare double pazer' },
  '\u05BD': { id: 'silluq', name: 'Silluq', symbol: 'ֽ', type: 'disjunctive', strength: 1, description: 'Final word accent serving Sof Pasuq' },

  // Conjunctives (Melodic connectors that link words)
  '\u05A3': { id: 'munach', name: 'Munach', symbol: '֣', type: 'conjunctive', strength: 99, description: 'Rests or sustains' },
  '\u05A4': { id: 'mahpach', name: 'Mahpach', symbol: '֤', type: 'conjunctive', strength: 99, description: 'Ascending hook' },
  '\u05A5': { id: 'mercha', name: 'Mercha', symbol: '֥', type: 'conjunctive', strength: 99, description: 'Elongated slide' },
  '\u05A6': { id: 'mercha_kefula', name: 'Mercha Kefula', symbol: '֦', type: 'conjunctive', strength: 99, description: 'Double Mercha' },
  '\u05A7': { id: 'darga', name: 'Darga', symbol: '֧', type: 'conjunctive', strength: 99, description: 'Stepped ascent' },
  '\u05A8': { id: 'kadma', name: 'Kadma', symbol: '֨', type: 'conjunctive', strength: 99, description: 'Forward sweep' },
  '\u05A9': { id: 'telisha_qetana', name: 'Telisha Qetana', symbol: '֩', type: 'conjunctive', strength: 99, description: 'Post-positive hook' },
  '\u05AA': { id: 'yerach_ben_yomo', name: 'Yerach ben Yomo', symbol: '֪', type: 'conjunctive', strength: 99, description: 'Full moon wave' }
};

// Character categorization helper variables
const IS_HEBREW_LETTER = char => char >= '\u05D0' && char <= '\u05EA';
const IS_NIQQUD = char => (char >= '\u05B0' && char <= '\u05C2') || char === '\u05C4' || char === '\u05C5' || char === '\u05C7';
const IS_TAAM = char => char >= '\u0591' && char <= '\u05AF';

/**
 * Parses a single Hebrew word string, separating its components.
 */
export function parseWord(wordStr, wordIndex, verseIndex, portionId = 'torah') {
  let cleanText = '';
  let vowelsText = '';
  let taamim = [];
  let isSofPasuq = wordStr.includes('\u05C3');

  // Strip non-Hebrew punctuation like hyphens (Maqaf) for vowelsText, but keep it in original text
  for (let i = 0; i < wordStr.length; i++) {
    const char = wordStr[i];
    if (IS_HEBREW_LETTER(char)) {
      cleanText += char;
      vowelsText += char;
    } else if (IS_NIQQUD(char)) {
      vowelsText += char;
    } else if (IS_TAAM(char)) {
      const taamInfo = TAAMIM_MAP[char];
      if (taamInfo) {
        taamim.push(taamInfo);
      }
    } else if (char === '\u05C0') { // Paseq vertical separator
      taamim.push({ id: 'paseq', name: 'Paseq', symbol: '׀', type: 'disjunctive', strength: 11, description: 'Vertical bar creating pause' });
    }
  }

  // Deduce if it's Sof Pasuq governed
  if (isSofPasuq && taamim.every(t => t.id !== 'silluq')) {
    taamim.push(TAAMIM_MAP['\u05BD']); // Default to Silluq if we see Sof Pasuq
  }

  // Determine governing accent
  let disjunctive = taamim.find(t => t.type === 'disjunctive');
  let conjunctive = taamim.find(t => t.type === 'conjunctive');

  // Sort disjunctives by strength (lowest strength number is strongest)
  if (taamim.length > 1) {
    const disjunctivesOnly = taamim.filter(t => t.type === 'disjunctive');
    if (disjunctivesOnly.length > 0) {
      disjunctivesOnly.sort((a, b) => a.strength - b.strength);
      disjunctive = disjunctivesOnly[0];
    }
  }

  // Handle special compound accents (e.g. Legarmeh: Munach + Paseq)
  if (conjunctive?.id === 'munach' && taamim.some(t => t.id === 'paseq')) {
    disjunctive = { id: 'legarmeh', name: 'Legarmeh', symbol: '֣׀', type: 'disjunctive', strength: 10, description: 'Munach + Paseq' };
  }

  const wordId = `${portionId}_v${verseIndex}_w${wordIndex}`;

  return {
    id: wordId,
    index: wordIndex,
    verseIndex,
    originalText: wordStr,
    cleanText, // Consonants only
    vowelsText, // Consonants + Niqqud
    taamim,
    governingAccent: disjunctive || conjunctive || null,
    isDisjunctive: !!disjunctive,
    isConjunctive: !disjunctive && !!conjunctive,
    isSofPasuq
  };
}

/**
 * Splits a verse text into tokens by spaces. For tokens containing the Hebrew Maqaf (־),
 * splits them into separate word tokens, but preserves the Maqaf character by attaching
 * it to the preceding word (e.g. "כי־תצא" becomes ["כי־", "תצא"]).
 */
export function tokenizeVerseText(verseText) {
  const rawTokens = verseText.trim().split(/\s+/);
  const finalTokens = [];
  rawTokens.forEach(tok => {
    if (tok.includes('־')) {
      const parts = tok.split('־');
      parts.forEach((part, idx) => {
        if (idx < parts.length - 1) {
          finalTokens.push(part + '־');
        } else {
          if (part) {
            finalTokens.push(part);
          }
        }
      });
    } else {
      finalTokens.push(tok);
    }
  });
  return finalTokens;
}

/**
 * Parses a Hebrew verse into parsed words and builds a hierarchical AST of phrases.
 */
export function parseVerse(verseText, verseIndex, portionId = 'torah') {
  // Split by space and Maqaf, keeping Maqaf attached to preceding token
  const wordTokens = tokenizeVerseText(verseText);
  const words = wordTokens.map((tok, idx) => parseWord(tok, idx, verseIndex, portionId));

  // Determine root disjunctive
  // In Torah prose, every verse ends with a Sof Pasuq (with its Silluq accent).
  const rootWord = words[words.length - 1];
  
  // Recursive function to parse a subsegment of words
  function parseSegment(segmentWords, parentId = 'ROOT') {
    if (segmentWords.length === 0) return [];

    // Find the strongest disjunctive in the segment (excluding the very last word if it governs the parent)
    let pivotIndex = -1;
    let strongestStrength = 999;
    let strongestDisj = null;

    // We scan the segment to find the strongest disjunctive
    for (let i = 0; i < segmentWords.length; i++) {
      const w = segmentWords[i];
      if (w.isDisjunctive && w.governingAccent) {
        if (w.governingAccent.strength < strongestStrength) {
          strongestStrength = w.governingAccent.strength;
          strongestDisj = w.governingAccent;
          pivotIndex = i;
        }
      }
    }

    // If no disjunctive is found in this segment, all words are conjunctives or unaccented.
    // They represent leaf terminal nodes serving the parent.
    if (pivotIndex === -1) {
      return segmentWords.map(w => ({
        type: 'word',
        id: w.id, // Ported stable ID
        word: w
      }));
    }

    // Split the segment at the pivot index
    const leftSubsegment = segmentWords.slice(0, pivotIndex);
    const pivotWord = segmentWords[pivotIndex];
    const rightSubsegment = segmentWords.slice(pivotIndex + 1);

    const phraseNode = {
      type: 'phrase',
      id: `v${verseIndex}-p-${pivotWord.governingAccent.id}-${pivotWord.index}`,
      accent: pivotWord.governingAccent.id,
      accentName: pivotWord.governingAccent.name,
      symbol: pivotWord.governingAccent.symbol,
      wordIndex: pivotWord.index,
      headWord: pivotWord,
      children: [
        ...parseSegment(leftSubsegment, pivotWord.governingAccent.id),
        {
          type: 'word',
          id: pivotWord.id, // Ported stable ID
          word: pivotWord
        }
      ]
    };

    return [
      phraseNode,
      ...parseSegment(rightSubsegment, parentId)
    ];
  }

  // Build the hierarchical tree
  const rootList = parseSegment(words);
  
  return {
    verseIndex,
    originalText: verseText,
    words,
    ast: rootList.length === 1 ? rootList[0] : {
      type: 'phrase',
      id: `v${verseIndex}-root`,
      accent: 'sof_pasuq',
      accentName: 'Sof Pasuq',
      symbol: '׃',
      children: rootList
    }
  };
}

/**
 * Scans a verse's parsed words to detect first-class Cantillation Motifs.
 */
export function detectMotifs(words, verseIndex) {
  const motifs = [];
  let i = 0;

  while (i < words.length) {
    const word1 = words[i];
    const w1Accent = word1.governingAccent?.id;

    if (i < words.length - 1) {
      const word2 = words[i + 1];
      const w2Accent = word2.governingAccent?.id;

      // 2-word Motifs
      // 1. Munach -> Etnachta
      if (w1Accent === 'munach' && w2Accent === 'etnachta') {
        motifs.push({
          id: `v${verseIndex}-m-${motifs.length}`,
          type: 'Munach-Etnachta',
          name: 'מונח אתנחתא',
          words: [word1, word2],
          wordIndices: [i, i + 1]
        });
        i += 2;
        continue;
      }
      // 2. Munach -> Zaqef Katan
      if (w1Accent === 'munach' && w2Accent === 'zaqef_katan') {
        motifs.push({
          id: `v${verseIndex}-m-${motifs.length}`,
          type: 'Munach-Zaqef',
          name: 'מונח זקף קטן',
          words: [word1, word2],
          wordIndices: [i, i + 1]
        });
        i += 2;
        continue;
      }
      // 3. Mercha -> Tipeha
      if (w1Accent === 'mercha' && w2Accent === 'tipeha') {
        motifs.push({
          id: `v${verseIndex}-m-${motifs.length}`,
          type: 'Mercha-Tifcha',
          name: 'מרכא טפחא',
          words: [word1, word2],
          wordIndices: [i, i + 1]
        });
        i += 2;
        continue;
      }
      // 4. Mahpach -> Pashta
      if (w1Accent === 'mahpach' && w2Accent === 'pashta') {
        motifs.push({
          id: `v${verseIndex}-m-${motifs.length}`,
          type: 'Mahpach-Pashta',
          name: 'מהפך פשטא',
          words: [word1, word2],
          wordIndices: [i, i + 1]
        });
        i += 2;
        continue;
      }
      // 5. Kadma -> Azla
      if (w1Accent === 'kadma' && w2Accent === 'pashta') {
        motifs.push({
          id: `v${verseIndex}-m-${motifs.length}`,
          type: 'Kadma-Azla',
          name: 'קדמא ואזלא',
          words: [word1, word2],
          wordIndices: [i, i + 1]
        });
        i += 2;
        continue;
      }
      // 6. Darga -> Tevir
      if (w1Accent === 'darga' && w2Accent === 'tevir') {
        motifs.push({
          id: `v${verseIndex}-m-${motifs.length}`,
          type: 'Darga-Tevir',
          name: 'דרגא תביר',
          words: [word1, word2],
          wordIndices: [i, i + 1]
        });
        i += 2;
        continue;
      }
    }

    // Single-word standalone motifs (as fallback if not grouped)
    if (word1.governingAccent) {
      motifs.push({
        id: `v${verseIndex}-m-${motifs.length}`,
        type: word1.governingAccent.id,
        name: word1.governingAccent.name,
        words: [word1],
        wordIndices: [i]
      });
    }

    i++;
  }

  return motifs;
}
