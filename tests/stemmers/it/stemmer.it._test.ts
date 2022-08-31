import t from "tap";
import { stem } from "../../../src/tokenizer/stemmer/it";

// eslint-disable-next-line  @typescript-eslint/no-var-requires
const words = require("./words.json");

t.test("italian stemmer", t => {
  t.plan(Object.keys(words).length);

  for (const word of Object.keys(words)) {
    t.equal(stem(word), words[word]);
  }
});
