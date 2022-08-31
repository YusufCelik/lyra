import { buildFullWordRegex } from "./utils";

function isVowel(c: string): boolean {
  return ["a", "e", "i", "o", "u", "y"].includes(c);
}

function finalizeWord(word: string): string {
  word = word.replace(/(a|e|i|o|u|à|è|ì|ò)$/, "");
  word = word.replace(/ch$/, "c");
  word = word.replace(/gh$/, "g");

  if (RV(word).match(/^(.+?)i$/)) {
    word = word.replace(/i$/, "");
  }

  return word.toLowerCase();
}

// R1 is the region after the first non-vowel following a vowel, or is the null region at the end of the word if there is no such non-vowel.
function R1(word: string): string {
  let r1 = "";
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    if (isVowel(c)) {
      i++;
      while (i < word.length) {
        const c2 = word[i];
        if (!isVowel(c2)) {
          r1 = word.substring(i + 1);
          break;
        }
        i++;
      }
      break;
    }
  }
  return r1;
}

// R2 is the region after the first non-vowel following a vowel in R1, or is the null region at the end of the word if there is no such non-vowel.
function R2(word: string): string {
  return R1(R1(word));
}

// If the second letter is a consonant, RV is the region after the next following vowel, or if the first two letters are vowels, RV is the region after the next consonant, and otherwise (consonant-vowel case) RV is the region after the third letter. But RV is the end of the word if these positions cannot be found.
function RV(word: string): string {
  let rv = "";
  if (word.length > 3) {
    const c = word[1];

    // If the second letter is a consonant, RV is the region after the next following vowel
    if (!isVowel(c)) {
      let i = 2;
      while (i < word.length) {
        const c2 = word[i];
        if (isVowel(c2)) {
          rv = word.substring(i + 1);
          break;
        }
        i++;
      }

      return rv;
    }

    // if the first two letters are vowels, RV is the region after the next consonant
    if (isVowel(word[0]) && isVowel(word[1])) {
      let i = 2;
      while (i < word.length) {
        const c2 = word[i];
        if (!isVowel(c2)) {
          rv = word.substring(i + 1);
          break;
        }
        i++;
      }

      return rv;
    }

    // otherwise (consonant-vowel case) RV is the region after the third letter
    if (!isVowel(word[0]) && isVowel(word[1])) {
      return word.slice(3, word.length);
    }
  }

  return word;
}

// Replace "i" or "u" with "I" and "U" when they are between two vowels.
function fixNonVowels(word: string): string {
  let newWord = "";
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    if (c === "i" || c === "u") {
      if (i > 0 && isVowel(word[i - 1]) && isVowel(word[i + 1])) {
        newWord += c.toUpperCase();
      } else {
        newWord += c;
      }
    } else {
      newWord += c;
    }
  }
  return newWord;
}

export function stem(word: string): string {
  // Replace all acute accents by grave accents
  // Vowels now are: a, e, i, o, u, à, è, ì, ò, ù
  word = word.replace(/á/g, "à");
  word = word.replace(/é/g, "è");
  word = word.replace(/í/g, "ì");
  word = word.replace(/ó/g, "ò");
  word = word.replace(/ú/g, "ù");

  let suffixRe: RegExp;

  // Check if the words contains the letter "q".
  // If the letter "q" is not followed by "u", append "u" after "q".
  // Example:
  // acquisto  => acquisto
  // soqquadro => soqquadro
  // aqilone   => aquilone (aqilone is a typo in Italian)
  if (word.includes("q") && !word.match(/^(.+?)?qu(.+)?$/)) {
    word = word.replaceAll("q", "qu");
  }

  word = fixNonVowels(word);

  // Attached pronoun
  // Search for the longest among the following suffixes
  const re1 =
    "ci|gli|la|le|li|lo|mi|ne|si|ti|vi|sene|gliela|gliele|glieli|glielo|gliene|mela|mele|meli|melo|mene|tela|tele|teli|telo|tene|cela|cele|celi|celo|cene|vela|vele|veli|velo|vene";
  const re2 = "ando|endo";
  const re3 = "ar|er|ir";
  const re4 = buildFullWordRegex(`(${re2}|${re3})(${re1})`);
  const re5 = buildFullWordRegex(`(${re2})(${re1})`);
  const re6 = buildFullWordRegex(`(${re3})(${re1})`);
  suffixRe = new RegExp(`(${re2}|${re3})(${re1})$`);

  if (RV(word).match(re4)) {
    // If word ends with "ando" or "endo", delete the suffix
    if (word.match(re5)) {
      console.log(word);
      return word.replace(suffixRe, "");

      // If word ends with "ar", "er", "ir" delete the suffix and append "e"
    } else if (word.match(re6)) {
      return word.replace(suffixRe, "e");
    }
  }

  const re7 =
    "anza|anze|ico|ici|ica|ice|iche|ichi|ismo|ismi|abile|abili|ibile|ibili|ista|iste|isti|istà|istè|istì|oso|osi|osa|ose|mente|atrice|atrici|ante|anti";
  const re9 = new RegExp(`^(.+?)${re7}$`);
  if (R2(word).match(re9)) {
    // @todo check "ambasciatrice"
    suffixRe = new RegExp(`(${re7})$`);
    return finalizeWord(word.replace(suffixRe, ""));
  }

  const re10 = "azione|azioni|atore|atori";
  const re11 = buildFullWordRegex(`(${re10})`);
  const re12 = buildFullWordRegex(`ic(${re10})`);

  if (word.match(re11)) {
    if (R2(word).match(re10)) {
      if (word.match(re12)) {
        suffixRe = new RegExp(`ic(${re10})$`);
        return finalizeWord(word.replace(suffixRe, ""));
      } else {
        suffixRe = new RegExp(`(${re10})$`);
        return finalizeWord(word.replace(suffixRe, ""));
      }
    }
  }

  if (R2(word).match(/^(.+?)(logia|logie)$/)) {
    return finalizeWord(word.replace(/(logia|logie)$/, "log"));
  }

  if (R2(word).match(/^(.+?)(uzione|uzioni|usione|usioni)$/)) {
    return finalizeWord(word.replace(/(uzione|uzioni|usione|usioni)$/, "us"));
  }

  if (R2(word).match(/^(.+?)(enza|enze)$/)) {
    return finalizeWord(word.replace(/(enza|enze)$/, "ente"));
  }

  if (RV(word).match(/^(.+?)(amento|amenti|imento|imenti)/)) {
    return finalizeWord(word.replace(/(amento|amenti|imento|imenti)$/, ""));
  }

  if (word.match(/(.+?)(amente)$/)) {
    if (R1(word).match(/(.+?)(amente)$/)) {
      return finalizeWord(word.replace(/(amente)$/, ""));
    }

    if (R2(word).match(/(.+?)(iv|at|os|ic|abil)(amente)$/)) {
      return finalizeWord(word.replace(/(iv|at|os|ic|abil)(amente)$/, ""));
    }
  }

  if (R2(word).match(/(.+?)(ità)$/)) {
    if (R2(word).match(/(.+?)(abil|ic|iv)ità$/)) {
      return finalizeWord(word.replace(/(abil|ic|iv)(ità)$/, ""));
    }
    return finalizeWord(word.replace(/(.+?)(ità)$/, ""));
  }

  if (word.match(/^(.+?)(ivo|ivi|iva|ive)$/)) {
    if (R2(word).match(/^(.+?)(ivo|ivi|iva|ive)$/)) {
      return finalizeWord(word.replace(/(ivo|ivi|iva|ive)$/, ""));
    }

    if (R2(word).match(/^(.+?)at(ivo|ivi|iva|ive)$/)) {
      return finalizeWord(word.replace(/at(ivo|ivi|iva|ive)$/, ""));
    }
  }

  const re13 =
    "ammo|ando|ano|are|arono|asse|assero|assi|assimo|ata|ate|ati|ato|ava|avamo|avano|avate|avi|avo|emmo|enda|ende|endi|endo|erà|erai|eranno|ere|erebbe|erebbero|erei|eremmo|eremo|ereste|eresti|erete|erò|erono|essero|ete|eva|evamo|evano|evate|evi|evo|Yamo|iamo|immo|irà|irai|iranno|ire|irebbe|irebbero|irei|iremmo|iremo|ireste|iresti|irete|irò|irono|isca|iscano|isce|isci|isco|iscono|issero|ita|ite|iti|ito|iva|ivamo|ivano|ivate|ivi|ivo|ono|uta|ute|uti|uto|ar|ir";
  const re14 = buildFullWordRegex(`(${re13})`);
  const re15 = new RegExp(`^(${re13})$`);
  const wordRV = RV(word);
  if (wordRV.match(re14) || wordRV.match(re15)) {
    suffixRe = new RegExp(`(${re13})$`);
    return finalizeWord(word.replace(suffixRe, ""));
  }

  return finalizeWord(word);
}

console.table([
  {
    word: "abbandonata",
    stem: stem("abbandonata"),
    expected: "abbandon",
  },
  {
    word: "abbandonato",
    stem: stem("abbandonato"),
    expected: "abbandon",
  },
  {
    word: "abbandonati",
    stem: stem("abbandonati"),
    expected: "abbandon",
  },
  {
    word: "abbandoneranno",
    stem: stem("abbandoneranno"),
    expected: "abbandon",
  },
  {
    word: "abbandonerò",
    stem: stem("abbandonerò"),
    expected: "abbandon",
  },
  {
    word: "abbaruffato",
    stem: stem("abbaruffato"),
    expected: "abbaruff",
  },
  {
    word: "abbassamento",
    stem: stem("abbassamento"),
    expected: "abbass",
  },
  {
    word: "abbassando",
    stem: stem("abbassando"),
    expected: "abbass",
  },
  {
    word: "abbassandola",
    stem: stem("abbassandola"),
    expected: "abbass",
  },
  {
    word: "abbassandole",
    stem: stem("abbassandole"),
    expected: "abbass",
  },
  {
    word: "abbassi",
    stem: stem("abbassi"),
    expected: "abbass",
  },
  {
    word: "proponendosi",
    stem: stem("proponendosi"),
    expected: "propon",
  },
  {
    word: "guardandogli",
    stem: stem("guardandogli"),
    expected: "guardando",
  },
  {
    word: "accomodarci",
    stem: stem("accomodarci"),
    expected: "accomodare",
  },
  {
    word: "ambasciatrice",
    stem: stem("ambasciatrice"),
    expected: "ambasc",
  },
  {
    word: "ambasciatore",
    stem: stem("ambasciatore"),
    expected: "ambasc",
  },
  {
    word: "analisti",
    stem: stem("analisti"),
    expected: "anal",
  },
  {
    word: "indicatore",
    stem: stem("indicatore"),
    expected: "indic",
  },
  {
    word: "meteorologia",
    stem: stem("meteorologia"),
    expected: "meteorolog",
  },
  {
    word: "cantandogli",
    stem: stem("cantandogli"),
    expected: "cantando",
  },
  {
    word: "zurigo",
    stem: stem("zurigo"),
    expected: "zurig",
  },
  {
    word: "zucconi",
    stem: stem("zucconi"),
    expected: "zuccon",
  },
  {
    word: "xenofobi",
    stem: stem("xenofobi"),
    expected: "xenofob",
  },
  {
    word: "zaccaria",
    stem: stem("zaccaria"),
    expected: "zaccar",
  },
  {
    word: "yugoslavia",
    stem: stem("yugoslavia"),
    expected: "yugoslav",
  },
  {
    word: "zingerle",
    stem: stem("zingerle"),
    expected: "zinger",
  },
  {
    word: "venirle",
    stem: stem("venirle"),
    expected: "ven",
  },
]);
