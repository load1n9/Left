import { left } from "../left.ts";
import { SYN_DB } from './synonyms.ts';
function uniq(a1: any) { const a2 = []; for (const id in a1) { if (a2.indexOf(a1[id]) === -1) { a2[a2.length] = a1[id] } } return a2 }

export class Dictionary {
  vocabulary: any[] = []
  synonyms: any = {}
  is_suggestions_enabled = true
  is_synonyms_enabled = true

  start() {
    this.synonyms = SYN_DB
    this.build_synonyms()
    this.update()
  }

  add_word(s: string) {
    const word = s.toLowerCase().trim()
    const regex = /[^a-z]/gi

    if (regex.test(word) || word.length < 4) { return }

    this.vocabulary[this.vocabulary.length] = word
  }

  build_synonyms() {
    const time = performance.now()

    for (const targetWord in SYN_DB) {
      const synonyms = SYN_DB[targetWord]
      this.add_word(targetWord)
      for (const wordID in synonyms) {
        const targetParent = synonyms[wordID]
        if (this.synonyms[targetParent] && this.synonyms[targetParent].constructor === Array) {
          this.synonyms[targetParent][this.synonyms[targetParent].length] = targetWord
        } else {
          this.synonyms[targetParent] = [targetWord]
        }
      }
    }
    console.log(`Built ${Object.keys(this.synonyms).length} synonyms, in ${(performance.now() - time).toFixed(2)}ms.`)
  }

  find_suggestion(str: string) {
    const target = str.toLowerCase()

    for (const id in this.vocabulary) {
      if (this.vocabulary[id].substr(0, target.length) !== target) { continue }
      return this.vocabulary[id]
    }
    return null
  }

  find_synonym(str: string) {
    if (str.trim().length < 4) { return }

    const target = str.toLowerCase()

    if (this.synonyms[target]) {
      return uniq(this.synonyms[target])
    }

    if (target[target.length - 1] === 's') {
      const singular = this.synonyms[target.substr(0, target.length - 1)]
      if (this.synonyms[singular]) {
        return uniq(this.synonyms[singular])
      }
    }

    return null
  }

  update() {
    const time = performance.now()
    const words = left.textarea_el.value.toLowerCase().split(/[^\w-]+/)

    for (const wordID in words) {
      this.add_word(words[wordID])
    }
    console.log(`Updated Dictionary in ${(performance.now() - time).toFixed(2)}ms.`)
  }
}

