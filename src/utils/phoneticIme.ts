/**
 * Indic Phonetic Transliteration Engine for Gujarati and Hindi (Devanagari).
 * Supports continuous typing, space-triggered conversion, and individual words.
 */

// Gujarati Mapping Tables
const GUJARATI_CONSONANTS: Record<string, string> = {
  k: 'ક', kh: 'ખ', g: 'ગ', gh: 'ઘ',
  ch: 'ચ', chh: 'છ', j: 'જ', jh: 'ઝ', z: 'ઝ',
  T: 'ટ', t: 'ત', Th: 'ઠ', th: 'થ',
  D: 'ડ', d: 'દ', Dh: 'ઢ', dh: 'ધ',
  N: 'ણ', n: 'ન',
  p: 'પ', f: 'ફ', ph: 'ફ', b: 'બ', bh: 'ભ', m: 'મ',
  y: 'ય', r: 'ર', l: 'લ', v: 'વ', w: 'વ',
  sh: 'શ', Sh: 'ષ', shh: 'ષ', s: 'સ', h: 'હ',
  L: 'ળ',
  ksh: 'ક્ષ', x: 'ક્ષ', gn: 'જ્ઞ', gny: 'જ્ઞ', gy: 'જ્ઞ',
  tr: 'ત્ર', shr: 'શ્ર',
};

const GUJARATI_INDEPENDENT_VOWELS: Record<string, string> = {
  a: 'અ', aa: 'આ', A: 'આ',
  i: 'ઇ', ee: 'ઈ', I: 'ઈ',
  u: 'ઉ', oo: 'ઊ', U: 'ઊ',
  e: 'એ', ai: 'ઐ',
  o: 'ઓ', au: 'ઔ', ou: 'ઔ',
  am: 'અં', an: 'અં', ah: 'અઃ',
};

const GUJARATI_MATRAS: Record<string, string> = {
  a: '', // Inherent vowel
  aa: 'ા', A: 'ા',
  i: 'િ', ee: 'ી', I: 'ી',
  u: 'ુ', oo: 'ૂ', U: 'ૂ',
  e: 'ે', ai: 'ૈ',
  o: 'ો', au: 'ૌ', ou: 'ૌ',
  am: 'ં', an: 'ં', ah: 'ઃ',
};

// Hindi (Devanagari) Mapping Tables
const HINDI_CONSONANTS: Record<string, string> = {
  k: 'क', kh: 'ख', g: 'ग', gh: 'घ',
  ch: 'च', chh: 'छ', j: 'ज', jh: 'झ', z: 'ज़',
  T: 'ट', t: 'त', Th: 'ठ', th: 'थ',
  D: 'ड', d: 'द', Dh: 'ढ', dh: 'ध',
  N: 'ण', n: 'न',
  p: 'प', f: 'फ़', ph: 'फ', b: 'ब', bh: 'भ', m: 'म',
  y: 'य', r: 'र', l: 'ल', v: 'व', w: 'व',
  sh: 'श', Sh: 'ष', shh: 'ष', s: 'स', h: 'ह',
  ksh: 'क्ष', x: 'क्ष', gn: 'ज्ञ', gny: 'ज्ञ', gy: 'ज्ञ',
  tr: 'त्र', shr: 'श्र',
};

const HINDI_INDEPENDENT_VOWELS: Record<string, string> = {
  a: 'अ', aa: 'आ', A: 'आ',
  i: 'इ', ee: 'ई', I: 'ई',
  u: 'उ', oo: 'ऊ', U: 'ऊ',
  e: 'ए', ai: 'ऐ',
  o: 'ओ', au: 'औ', ou: 'औ',
  am: 'अं', an: 'अं', ah: 'अः',
};

const HINDI_MATRAS: Record<string, string> = {
  a: '',
  aa: 'ा', A: 'ा',
  i: 'ि', ee: 'ी', I: 'ी',
  u: 'ु', oo: 'ू', U: 'ू',
  e: 'े', ai: 'ै',
  o: 'ो', au: 'ौ', ou: 'ौ',
  am: 'ं', an: 'ं', ah: 'ः',
};

// Common Indian / Gujarati names dictionary for instant accurate transliteration
const SPECIAL_WORDS_GUJARATI: Record<string, string> = {
  ramesh: 'રમેશ',
  suresh: 'સુરેશ',
  mahesh: 'મહેશ',
  patel: 'પટેલ',
  vaghela: 'વાઘેલા',
  parmar: 'પરમાર',
  solanki: 'સોલંકી',
  jadeja: 'જાડેજા',
  chavda: 'ચાવડા',
  shah: 'શાહ',
  joshi: 'જોષી',
  mehta: 'મહેતા',
  suthar: 'સુથાર',
  panchal: 'પંચાલ',
  prajapati: 'પ્રજાપતિ',
  bharat: 'ભારત',
  sanjay: 'સંજય',
  vijay: 'વિજય',
  ajay: 'અજય',
  rajesh: 'રાજેશ',
  kamlesh: 'કમલેશ',
  hitesh: 'હિતેશ',
  paresh: 'પરેશ',
  naresh: 'નરેશ',
  dinesh: 'દિનેશ',
  chetan: 'ચેતન',
  ketan: 'કેતન',
  bhavesh: 'ભાવેશ',
  jayesh: 'જયેશ',
  alpesh: 'અલ્પેશ',
  jagdish: 'જગદીશ',
  rajkot: 'રાજકોટ',
  ahmedabad: 'અમદાવાદ',
  vadodara: 'વડોદરા',
  surat: 'સુરત',
  bhavnagar: 'ભાવનગર',
  jamnagar: 'જામનગર',
  junagadh: 'જૂનાગઢ',
  gandhinagar: 'ગાંધીનગર',
  morbi: 'મોરબી',
  surendranagar: 'સુરેન્દ્રનગર',
  iti: 'આઈ.ટી.આઈ.',
  fitter: 'ફિટર',
  electrician: 'ઇલેક્ટ્રિશિયન',
  welder: 'વેલ્ડર',
  turner: 'ટર્નર',
  copa: 'કોપા',
  diesel: 'ડીઝલ મિકેનિક',
  machinist: 'મશીનિસ્ટ',
};

const SPECIAL_WORDS_HINDI: Record<string, string> = {
  ramesh: 'रमेश',
  suresh: 'सुरेश',
  mahesh: 'महेश',
  patel: 'पटेल',
  vaghela: 'वाघेला',
  parmar: 'परमार',
  solanki: 'सोलंकी',
  sharma: 'शर्मा',
  verma: 'वर्मा',
  yadav: 'यादव',
  singh: 'सिंह',
  kumar: 'कुमार',
  bharat: 'भारत',
  sanjay: 'संजय',
  vijay: 'विजय',
  ajay: 'अजय',
  rajesh: 'राजेश',
  dinesh: 'दिनेश',
  rajkot: 'राजकोट',
  ahmedabad: 'अहमदाबाद',
  surat: 'सूरत',
  iti: 'आईटीआई',
  fitter: 'फ़िटर',
  electrician: 'इलेक्ट्रीशियन',
  welder: 'वेल्डर',
  turner: 'टर्नर',
};

/**
 * Transliterates a single English word into Gujarati or Hindi phonetically.
 */
export function transliterateWord(word: string, language: 'Gujarati' | 'Hindi'): string {
  if (!word) return '';

  const cleanWord = word.trim();
  const lower = cleanWord.toLowerCase();

  // Check special dictionary first
  if (language === 'Gujarati' && SPECIAL_WORDS_GUJARATI[lower]) {
    return SPECIAL_WORDS_GUJARATI[lower];
  }
  if (language === 'Hindi' && SPECIAL_WORDS_HINDI[lower]) {
    return SPECIAL_WORDS_HINDI[lower];
  }

  const consonants = language === 'Gujarati' ? GUJARATI_CONSONANTS : HINDI_CONSONANTS;
  const independentVowels = language === 'Gujarati' ? GUJARATI_INDEPENDENT_VOWELS : HINDI_INDEPENDENT_VOWELS;
  const matras = language === 'Gujarati' ? GUJARATI_MATRAS : HINDI_MATRAS;
  const halant = language === 'Gujarati' ? '્' : '्';

  let result = '';
  let i = 0;
  const len = cleanWord.length;

  while (i < len) {
    // Try matching 3-letter consonant/conjunct (e.g. ksh, chh, shh, gny)
    const sub3 = cleanWord.slice(i, i + 3).toLowerCase();
    const sub2 = cleanWord.slice(i, i + 2).toLowerCase();
    const sub1 = cleanWord[i];

    let matchedConsonant = '';
    let matchLen = 0;

    if (consonants[sub3]) {
      matchedConsonant = consonants[sub3];
      matchLen = 3;
    } else if (consonants[sub2]) {
      matchedConsonant = consonants[sub2];
      matchLen = 2;
    } else if (consonants[sub1] || consonants[sub1.toLowerCase()]) {
      matchedConsonant = consonants[sub1] || consonants[sub1.toLowerCase()];
      matchLen = 1;
    }

    if (matchedConsonant) {
      i += matchLen;
      // Look ahead for vowels following this consonant
      const v2 = cleanWord.slice(i, i + 2).toLowerCase();
      const v1 = cleanWord[i]?.toLowerCase() || '';

      if (matras[v2] !== undefined) {
        result += matchedConsonant + matras[v2];
        i += 2;
      } else if (matras[v1] !== undefined) {
        result += matchedConsonant + matras[v1];
        i += 1;
      } else if (i < len && /[b-df-hj-np-tv-z]/i.test(cleanWord[i])) {
        // Consonant followed immediately by another consonant -> apply halant
        result += matchedConsonant + halant;
      } else {
        // End of word or inherent vowel 'a'
        result += matchedConsonant;
      }
    } else {
      // Independent vowel or unknown symbol
      const v2 = cleanWord.slice(i, i + 2).toLowerCase();
      const v1 = cleanWord[i].toLowerCase();

      if (independentVowels[v2]) {
        result += independentVowels[v2];
        i += 2;
      } else if (independentVowels[v1]) {
        result += independentVowels[v1];
        i += 1;
      } else {
        result += cleanWord[i];
        i += 1;
      }
    }
  }

  return result;
}

/**
 * Transliterates an entire text sentence or paragraph, preserving whitespace & punctuation.
 */
export function transliterateText(text: string, language: 'Gujarati' | 'Hindi'): string {
  if (!text) return '';
  if (language !== 'Gujarati' && language !== 'Hindi') return text;

  // Split by whitespace and punctuation while keeping tokens intact
  const tokens = text.split(/(\s+|[.,/#!$%^&*;:{}=\-_`~()?"'<>])/);
  return tokens
    .map((token) => {
      // If token is word characters, transliterate
      if (/^[a-zA-Z]+$/.test(token)) {
        return transliterateWord(token, language);
      }
      return token;
    })
    .join('');
}
