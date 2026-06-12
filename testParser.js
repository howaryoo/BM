import { parseVerse } from './src/utils/cantillationParser.js';

const bereishitVerse = 'בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃';
const kiTetsaVerse = 'כִּֽי־תֵצֵ֥א לַמִּלְחָמָ֖ה עַל־אֹיְבֶ֑יךָ וּנְתָנ֛וֹ יְהוָ֥ה אֱלֹהֶ֖יךָ בְּיָדֶ֥ךָ וְשָׁבִ֥יתָ שִׁבְיֽוֹ׃';

try {
  console.log('====================================');
  console.log('Testing Parser for Genesis 1:1...');
  const res1 = parseVerse(bereishitVerse, 1);
  console.log('AST root type:', res1.ast.type);
  console.log('AST root accent:', res1.ast.accent);
  console.log('Parsed successfully!');

  console.log('====================================');
  console.log('Testing Parser for Ki Tetsa (Deut 21:10)...');
  const res2 = parseVerse(kiTetsaVerse, 10);
  console.log('Original Text:', res2.originalText);
  console.log('Words list:');
  res2.words.forEach(w => {
    console.log(`  Word: ${w.cleanText.padEnd(10)} | Accent: ${w.governingAccent?.name || 'None'}`);
  });
  console.log('AST root type:', res2.ast.type);
  console.log('AST root accent:', res2.ast.accent);
  console.log('Parsed successfully!');
  console.log('====================================');
} catch (err) {
  console.error('Parser test failed: ', err);
  process.exit(1);
}
