function isVowel(c: string): boolean {
  return ["a", "e", "i", "o", "u", "y"].includes(c);
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

export function stem(word: string): string {
  // Replace all acute accents by grave accents
  // Vowels now are: a, e, i, o, u, à, è, ì, ò, ù
  word = word.replace(/á/g, "à");
  word = word.replace(/é/g, "è");
  word = word.replace(/í/g, "ì");
  word = word.replace(/ó/g, "ò");
  word = word.replace(/ú/g, "ù");

  // Check if the words contains the letter "q".
  // If the letter "q" is not followed by "u", append "u" after "q".
  // Example:
  // acquisto  => acquisto
  // soqquadro => soqquadro
  // aqilone   => aquilone (aqilone is a typo in Italian)
  if (word.includes("q") && !word.match(/^(.+?)?qu(.+)?$/)) {
    word = word.replaceAll("q", "qu");
  }

  // Attached pronoun
  // Search for the longest among the following suffixes
  const re =
    /^(.+?)(ci|gli|la|le|li|lo|mi|ne|si|ti|vi|sene|gliela|gliele|glieli|glielo|gliene|mela|mele|meli|melo|mene|tela|tele|teli|telo|tene|cela|cele|celi|celo|cene|vela|vele|veli|velo|vene|ando|endo|ar|er|ir)$/;
  if (word.match(re)) {
    // If word ends with "ando" or "endo", delete the suffix
    if (word.match(/^(.+?)(ando|endo)$/)) {
      word = word.replace(/ando|endo$/, "");

      // If word ends with "ar", "er", "ir" delete the suffix and append "e"
    } else if (word.match(/^(.+?)(ar|er|ir)$/)) {
      word = word.replace(/ar|er|ir$/, "e");
    }
  }

  return word;
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
]);
