// Torah Data Store (Grouped by Portion and Aliyah)
// Contains cantors, traditions, first-class Motifs, chironomy gestures, flashcards, and quizzes.

export const PORTIONS_DATA = {
  'bereishit': {
    id: 'bereishit',
    name: 'בראשית (Bereishit)',
    book: 'Genesis',
    aliyot: {
      1: {
        linesConfig: [
          { count: 7, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 8, indent: false },
          { count: 9, indent: false }
        ],
        verses: [
          { verseIndex: 1, reference: 'בראשית א:א', text: 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃' },
          { verseIndex: 2, reference: 'בראשית א:ב', text: 'וְהָאָ֗רֶץ הָיְתָ֥ה תֹ֙הוּ֙ וָבֹ֔הוּ וְחֹ֖שֶךְ עַל־פְּנֵ֣י תְה֑וֹם וְר֣וּחַ אֱלֹהִ֔ים Mְרַחֶ֖פֶת עַל־פְּנֵ֥י הַמָּֽיִם׃' },
          { verseIndex: 3, reference: 'בראשית א:ג', text: 'וַיֹּ֥אמֶר אֱלֹהִ֖ים יְהִ֣י א֑וֹר וַֽיְהִי־אֽוֹר׃' },
          { verseIndex: 4, reference: 'בראשית א:ד', text: 'וַיַּ֧רְא אֱלֹהִ֛ים אֶת־הָא֖וֹר כִּי־ט֑וֹב וַיַּבְדֵּ֣ל אֱלֹהִ֔ים בֵּ֥ין הָא֖וֹר וּבֵ֥ין הַחֹֽשֶךְ׃' },
          { verseIndex: 5, reference: 'בראשית א:ה', text: 'וַיִּקְרָ֨א אֱלֹהִ֤ים ׀ לָאוֹר֙ י֔וֹם וְלַחֹ֖שֶךְ קָ֣רָא לָ֑יְלָה וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר י֥וֹם אֶחָֽד׃ פ' },
          { verseIndex: 6, reference: 'בראשית א:ו', text: 'וַיֹּ֣אמֶר אֱלֹהִ֔ים יְהִ֥י רָקִ֖יעַ בְּת֣וֹךְ הַמָּ֑יִם וִיהִ֣י מַבְדִּ֔יל בֵּ֥ין מַ֖יִם לָמָֽיִם׃' },
          { verseIndex: 7, reference: 'בראשית א:ז', text: 'וַיַּ֣עัשׂ אֱלֹהִים֮ אֶת־הָרָקִ֒יעַ֒ וַיַּבְדֵּ֗ל בֵּ֣ין הַמַּ֙יִם֙ אֲשֶׁר֙ מִתַּ֣חัת לָרָקִ֔יעַ וּבֵ֣ין הַמַּ֔יִם אֲשֶׁ֖ר מֵעַ֣ל לָרָקִ֑יעַ וַֽיְהִי־כֵֽן׃' },
          { verseIndex: 8, reference: 'בראשית א:ח', text: 'וַיִּקְרָ֧א אֱלֹהִ֛ים לָֽרָקִ֖יעַ שָׁמָ֑יִם וַֽיְהִי־עֶ֥רֶב וַֽיְהִי־בֹ֖קֶר י֥וֹם שֵׁנִֽי׃ פ' },
        ]
      },
      2: {
        linesConfig: [
          { count: 12, indent: false }
        ],
        verses: [
          { verseIndex: 9, reference: 'בראשית א:ט', text: 'וַיֹּ֣אמֶר אֱלֹהִ֗ים יִקָּו֨וּ הַמַּ֜יִם מִתַּ֤חַת הַשָּׁמַ֙יִם֙ אֶל־מָק֣וֹם אֶחָ֔ד וְתֵרָאֶ֖ה הַיַּבָּשָׁ֑ה וַֽיְהִי־כֵֽן׃' }
        ]
      },
      3: { linesConfig: [], verses: [] },
      4: { linesConfig: [], verses: [] },
      5: { linesConfig: [], verses: [] },
      6: { linesConfig: [], verses: [] },
      7: { linesConfig: [], verses: [] }
    }
  },
  'ki_tetsa': {
    id: 'ki_tetsa',
    name: 'כי תצא (Ki Tetsa)',
    book: 'Deuteronomy',
    aliyot: {
      1: {
        linesConfig: [
          { count: 5, indent: true },  // כי תצא למלחמה על אויבך (Indented starting word כי)
          { count: 6, indent: false }, // ונתנו יהוה אלהיך בידך ושבית שביו
          { count: 7, indent: false }, // וראית בשביה אשת יפת תאר וחשקת בה
          { count: 6, indent: false }, // ולקחת לך לאשה והבאתה אל תוך
          { count: 7, indent: false }, // ביתך וגלחה את ראשה ועשתה את צפרניה
          { count: 6, indent: false }, // והסירה את שמלת שביה מעליה וישבה
          { count: 7, indent: false }, // בביתך ובכתה את אביה ואת אמה ירח
          { count: 7, indent: false }, // ימים ואחר כן תבוא אליה ובעלתה והיתה
          { count: 2, indent: false }  // לך לאשה
        ],
        verses: [
          { verseIndex: 10, reference: 'דברים כא:י', text: 'כִּֽי־תֵצֵ֥א לַמִּלְחָמָ֖ה עַל־אֹיְבֶ֑יךָ וּנְתָנ֛וֹ יְהוָ֥ה אֱלֹהֶ֖יךָ בְּיָדֶ֥ךָ וְשָׁבִ֥יתָ שִׁבְיֽוֹ׃' },
          { verseIndex: 11, reference: 'דברים כא:יא', text: '\u05d5\u05b0\u05e8\u05b8\u05d0\u05b4\u05d9\u05ea\u05b8\u0599 \u05d1\u05b7\u05bc\u05e9\u05b4\u05bc\u05c1\u05d1\u05b0\u05d9\u05b8\u0594\u05d4 \u05d0\u05b5\u0596\u05e9\u05b6\u05c1\u05ea \u05d9\u05b0\u05e4\u05b7\u05ea\u05be\u05ea\u05b9\u05bc\u0591\u05d0\u05b7\u05e8 \u05d5\u05b0\u05d7\u05b8\u05e9\u05b7\u05c1\u05e7\u05b0\u05ea\u05b8\u05bc\u05a3 \u05d1\u05b8\u0594\u05d4\u05bc \u05d5\u05b0\u05dc\u05b8\u05e7\u05b7\u05d7\u05b0\u05ea\u05b8\u05bc\u05a5 \u05dc\u05b0\u05da\u05b8\u0596 \u05dc\u05b0\u05d0\u05b4\u05e9\u05b8\u05bc\u05c1\u05d4\u05c3' },
          { verseIndex: 12, reference: 'דברים כא:יב', text: 'וַהֲבֵאתָ֖הּ אֶל־תּ֣וֹךְ בֵּיתֶ֑ךָ וְגִלְּחָה֙ אֶת־רֹאשָׁ֔הּ וְעָשְׂתָ֖ה אֶת־צִפָּרְנֶֽיהָ׃' },
          { verseIndex: 13, reference: 'דברים כא:יג', text: 'וְהֵסִירָה֩ אֶת־שִׂמְלַ֨ת שִׁבְיָ֜הּ מֵעָלֶ֗יהָ וְיָשְׁבָה֙ בְּבֵיתֶ֔ךָ וּבָכְתָה֙ אֶת־אָבִ֣יהָ וְאֶת־אִמָּ֔הּ יֶ֖רַח יָמִ֑ים וְאַחַר־כֵּן֙ תָּב֣וֹא אֵלֶיהָ֙ וּבְעַלְתָּ֔הּ וְהָיְתָ֥ה לְךָ֖ לְאִשָּׁה׃' }
        ]
      },
      2: { linesConfig: [], verses: [] },
      3: { linesConfig: [], verses: [] },
      4: { linesConfig: [], verses: [] },
      5: { linesConfig: [], verses: [] },
      6: { linesConfig: [], verses: [] },
      7: { linesConfig: [], verses: [] }
    }
  }
};

export const ALIYOT_REFS = {
  'bereishit': {
    1: 'Genesis.1.1-2.3',
    2: 'Genesis.2.4-2.19',
    3: 'Genesis.2.20-3.21',
    4: 'Genesis.3.22-4.18',
    5: 'Genesis.4.19-4.26',
    6: 'Genesis.5.1-5.24',
    7: 'Genesis.5.25-6.8'
  },
  'ki_tetsa': {
    1: 'Deuteronomy.21.10-21.21',
    2: 'Deuteronomy.21.22-22.7',
    3: 'Deuteronomy.22.8-23.7',
    4: 'Deuteronomy.23.8-23.24',
    5: 'Deuteronomy.23.25-24.4',
    6: 'Deuteronomy.24.5-24.13',
    7: 'Deuteronomy.24.14-25.19'
  }
};

// Clean text for display in "Plain Torah" view (removes niqqud, taamim, paseq, and extra marks, keeping spaces and letters)
export function getPlainTorahText(text) {
  return text
    .replace(/[\u0591-\u05C7]/g, '') // Remove Niqqud, Taamim, and Paseq
    .replace(/[־]/g, ' ')            // Replace Maqaf hyphen with space
    .replace(/\s*[פנס]\s*$/g, '')    // Remove paragraph delimiters
    .trim();
}

// Clean text for display in "Niqqud Only" view (removes taamim, keeping niqqud)
export function getNiqqudOnlyText(text) {
  return text
    .replace(/[\u0591-\u05AF\u05C0]/g, '') // Remove Taamim and Paseq
    .replace(/\s*[פנס]\s*$/g, '')          // Remove paragraph delimiters
    .trim();
}

// Preloaded Audio Tracks with Calibrated Verse Timestamps
export const PRELOADED_CANTORS = [
  {
    username: 'cantor-yosef',
    displayName: 'Cantor Yosef (Moroccan Meknès)',
    tradition: 'Moroccan Meknès',
    audioUrl: 'https://www.mechon-mamre.org/mp3/t0101.mp3', // Genesis 1 audio
    alignments: {
      // Bereishit alignments
      1: { start: 0.0, end: 7.2 },
      2: { start: 7.2, end: 20.5 },
      3: { start: 20.5, end: 26.8 },
      4: { start: 26.8, end: 38.5 },
      5: { start: 38.5, end: 55.4 },
      6: { start: 55.4, end: 68.1 },
      7: { start: 68.1, end: 90.0 },
      8: { start: 90.0, end: 104.5 },
      // Ki Tetsa alignments
      10: { start: 0.0, end: 6.5 },
      11: { start: 6.5, end: 14.8 },
      12: { start: 14.8, end: 22.0 },
      13: { start: 22.0, end: 35.5 }
    }
  },
  {
    username: 'cantor-goldberg',
    displayName: 'Cantor Goldberg (Ashkenazi)',
    tradition: 'Ashkenazi',
    audioUrl: 'https://www.mechon-mamre.org/mp3/t0101.mp3',
    alignments: {
      1: { start: 0.0, end: 8.5 },
      2: { start: 8.5, end: 22.0 },
      3: { start: 22.0, end: 29.5 },
      4: { start: 29.5, end: 41.0 },
      5: { start: 41.0, end: 59.0 },
      6: { start: 59.0, end: 72.0 },
      7: { start: 72.0, end: 94.0 },
      8: { start: 94.0, end: 109.0 },
      10: { start: 0.0, end: 7.5 },
      11: { start: 7.5, end: 16.5 },
      12: { start: 16.5, end: 24.2 },
      13: { start: 24.2, end: 38.5 }
    }
  }
];

// First-class Motif Registry with interactive metadata (Flashcards, Quizzes, Chironomy Hand Gestures)
export const MOTIFS_REGISTRY = {
  'Munach-Etnachta': {
    id: 'Munach-Etnachta',
    name: 'מונח אתנחתא (Munach-Etnachta)',
    elements: ['Munach', 'Etnachta'],
    gesture: {
      tradition: 'Sephardi & Moroccan',
      name: 'Resting Downward Sweep',
      description: 'Start with hand flat, sweep down, then curve up slightly to rest on the table or lap.',
      animationPath: 'M 30,30 C 30,70 50,90 70,80',
      arrowPoints: '70,80 65,75 68,83'
    },
    flashcards: [
      {
        front: 'What does Etnachta signify in a verse?',
        back: 'It acts as the primary syntactic separator, splitting the verse into two halves.'
      },
      {
        front: 'Which conjunctive trope usually precedes and serves Etnachta?',
        back: 'Munach (מונח).'
      }
    ],
    quizzes: [
      {
        question: 'Identify the motif represented by the accents ( ֣  ֑ ) on consecutive words.',
        options: ['Munach-Zaqef', 'Munach-Etnachta', 'Mercha-Tifcha', 'Darga-Tevir'],
        answerIndex: 1
      }
    ]
  },
  'Munach-Zaqef': {
    id: 'Munach-Zaqef',
    name: 'מונח זקף קטן (Munach-Zaqef)',
    elements: ['Munach', 'Zaqef Katan'],
    gesture: {
      tradition: 'General',
      name: 'Ascending Point',
      description: 'Move hand forward flat, then raise index finger pointing vertically upward.',
      animationPath: 'M 20,70 L 60,70 L 60,20',
      arrowPoints: '60,20 56,26 64,26'
    },
    flashcards: [
      {
        front: 'Is Zaqef Katan a disjunctive or conjunctive accent?',
        back: 'Disjunctive. It splits a clause into a smaller unit.'
      }
    ],
    quizzes: [
      {
        question: 'What is the function of Munach when preceding Zaqef Katan?',
        options: ['It creates a long pause', 'It connects to the Zaqef', 'It terminates the sentence'],
        answerIndex: 1
      }
    ]
  },
  'Mercha-Tifcha': {
    id: 'Mercha-Tifcha',
    name: 'מרכא טפחא (Mercha-Tifcha)',
    elements: ['Mercha', 'Tipeha'],
    gesture: {
      tradition: 'Moroccan & Sephardi',
      name: 'Push and Drop',
      description: 'Push hand horizontally forward, then drop the wrist suddenly.',
      animationPath: 'M 20,40 L 70,40 L 70,70',
      arrowPoints: '70,70 66,64 74,64'
    },
    flashcards: [
      {
        front: 'What are the Hebrew names for the Mercha-Tifcha symbols?',
        back: 'Mercha ( ֥ ) is the diagonal line below; Tifcha/Tipeha ( ֖ ) is the right-angled line below.'
      }
    ],
    quizzes: [
      {
        question: 'Which of the following is the symbol for Tipeha (Tifcha)?',
        options: [' ֖ (below)', ' ֔ (above)', ' ֑ (below)'],
        answerIndex: 0
      }
    ]
  },
  'Mahpach-Pashta': {
    id: 'Mahpach-Pashta',
    name: 'מהפך פשטא (Mahpach-Pashta)',
    elements: ['Mahpach', 'Pashta'],
    gesture: {
      tradition: 'Sephardi',
      name: 'Wave and Flip',
      description: 'Hand curves upwards, then flips slightly backward at the wrist.',
      animationPath: 'M 20,80 Q 40,40 50,50 Q 60,60 80,30',
      arrowPoints: '80,30 73,32 78,38'
    },
    flashcards: [
      {
        front: 'How can you distinguish between Pashta and Kadma symbols visually?',
        back: 'Pashta ( ֙ ) is placed on the last letter. Kadma ( ֨ ) is placed on the stressed syllable.'
      }
    ],
    quizzes: [
      {
        question: 'Which conjunctive serves Pashta?',
        options: ['Darga', 'Munach', 'Mahpach'],
        answerIndex: 2
      }
    ]
  },
  'Kadma-Azla': {
    id: 'Kadma-Azla',
    name: 'קדמא ואזלא (Kadma-Azla)',
    elements: ['Kadma', 'Pashta'],
    gesture: {
      tradition: 'Moroccan',
      name: 'Circular Climb',
      description: 'Move hand in a climbing circular arc from right to left.',
      animationPath: 'M 20,80 C 40,90 60,70 50,50 C 40,30 70,20 80,30',
      arrowPoints: '80,30 73,28 77,35'
    },
    flashcards: [
      {
        front: 'What does "Azla" translate to in English?',
        back: 'It translates to "going" or "walking", indicating forward melodic motion.'
      }
    ],
    quizzes: [
      {
        question: 'In the Kadma-Azla motif, which accent is the disjunctive?',
        options: ['Kadma', 'Azla'],
        answerIndex: 1
      }
    ]
  },
  'Darga-Tevir': {
    id: 'Darga-Tevir',
    name: 'דרגא תביר (Darga-Tevir)',
    elements: ['Darga', 'Tevir'],
    gesture: {
      tradition: 'General',
      name: 'Zig-zag Step',
      description: 'Move hand in a stepping down-and-across motion, ending with an open palm.',
      animationPath: 'M 20,20 L 40,20 L 40,50 L 70,50 L 70,80',
      arrowPoints: '70,80 66,74 74,74'
    },
    flashcards: [
      {
        front: 'What does the word "Tevir" mean?',
        back: 'It means "broken", indicating broken notes and a wrist break gesture.'
      }
    ],
    quizzes: [
      {
        question: 'Identify the visual symbol for Tevir.',
        options: [' ֛ ', ' ֡ ', ' ֠ '],
        answerIndex: 0
      }
    ]
  }
};

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
 * Secondary Scroll Layout Compiler
 * Dynamic layout generator that maps Word IDs (e.g. ki_tetsa_v10_w0)
 * to column, line, horizontal x coordinate (for justified columns) and stretch metrics,
 * keeping the original Book -> Chapter -> Verse data model unchanged.
 */
export function compileScrollLayouts() {
  const layouts = {};
  const colWidth = 540; // width of columns in pixels

  for (const portionId in PORTIONS_DATA) {
    const portion = PORTIONS_DATA[portionId];

    for (const aliyahIdx in portion.aliyot) {
      const aliyah = portion.aliyot[aliyahIdx];
      const linesConfig = aliyah.linesConfig;
      const verses = aliyah.verses;

      // Flatten word IDs in sequence order
      const allWordIds = [];
      verses.forEach(v => {
        const wordTokens = tokenizeVerseText(v.text);
        wordTokens.forEach((tok, wIdx) => {
          allWordIds.push(`${portionId}_v${v.verseIndex}_w${wIdx}`);
        });
      });

      let wordPointer = 0;
      const maxLinesPerCol = 6;

      linesConfig.forEach((lineCfg, lineIdx) => {
        const lineNum = lineIdx + 1;
        const colNum = Math.ceil(lineNum / maxLinesPerCol);
        const lineInCol = ((lineNum - 1) % maxLinesPerCol) + 1;
        const count = lineCfg.count;
        const indent = lineCfg.indent;

        const lineWordIds = allWordIds.slice(wordPointer, wordPointer + count);
        const numWords = lineWordIds.length;

        // Distribute coordinates from right to left (RTL)
        // x represents distance in pixels from the right margin
        const startX = indent ? 80 : 15;
        const endX = colWidth - 55; // width bound
        const availableWidth = endX - startX;

        lineWordIds.forEach((wId, i) => {
          let x = startX;
          if (numWords > 1) {
            // Equal horizontal spacing step
            const step = availableWidth / (numWords - 1);
            x = Math.round(startX + i * step);
          }

          // Justification stretch calculation (stretch factor to apply in CSS letter-spacing or scaling)
          // Shorter lines get slightly stretched words to look perfectly justified
          let stretch = 1.0;
          if (numWords < 5) {
            stretch = 1.15;
          } else if (numWords > 7) {
            stretch = 0.95;
          }

          layouts[wId] = {
            column: colNum,
            line: lineInCol,
            x: x,
            stretch: stretch
          };
        });

        wordPointer += count;
      });

      // Handle any leftover words (fallback formatting)
      if (wordPointer < allWordIds.length) {
        const remainingIds = allWordIds.slice(wordPointer);
        const startLineNum = linesConfig.length + 1;
        remainingIds.forEach((wId, i) => {
          const lineNum = startLineNum + Math.floor(i / 8);
          const colNum = Math.ceil(lineNum / maxLinesPerCol);
          const lineInCol = ((lineNum - 1) % maxLinesPerCol) + 1;
          layouts[wId] = {
            column: colNum,
            line: lineInCol,
            x: 15 + (i % 8) * 65,
            stretch: 1.0
          };
        });
      }
    }
  }

  return layouts;
}

export const SCROLL_LAYOUTS = compileScrollLayouts();
