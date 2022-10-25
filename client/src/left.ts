import { Theme } from "./scripts/lib/theme.ts"
import { Stats } from './scripts/stats.ts';
import { Reader } from './scripts/reader.ts';
import { Project } from './scripts/project.ts';
import { Operator } from './scripts/operator.ts';
import { Navi } from './scripts/navi.ts';
import { Insert } from './scripts/insert.ts';
import { Go } from './scripts/go.ts';
import { Controller } from './scripts/lib/controller.ts';
import { Font } from './scripts/font.ts';
import { Dictionary } from './scripts/dictionary.ts';

const EOL = '\n'

class Left {
  theme = new Theme({ background: '#222', f_high: '#eee', f_med: '#888', f_low: '#666', f_inv: '#00f', b_high: '#f9a', b_med: '#a9f', b_low: '#000', b_inv: '#af9' })
  controller = new Controller()
  dictionary = new Dictionary()
  operator = new Operator()
  navi = new Navi()
  stats = new Stats()
  go = new Go()
  project = new Project()
  reader = new Reader()
  insert = new Insert()
  font = new Font()

  textarea_el = document.createElement('textarea')
  drag_el = document.createElement('drag')

  selection = { word: null, index: 1 }

  words_count = null
  lines_count = null
  chars_count = null
  suggestion = null
  synonyms = null
  last_char = 's' // this is not a typo. it's bad code, but it has to be a length one string

  autoindent = true
  install(host: any = document.body) {
    this.navi.install(host)
    this.stats.install(host)
    this.operator.install(host)

    host.appendChild(this.textarea_el)
    host.appendChild(this.drag_el)

    host.className = window.location.hash.replace('#', '')

    this.textarea_el.setAttribute('autocomplete', 'off')
    this.textarea_el.setAttribute('autocorrect', 'off')
    this.textarea_el.setAttribute('autocapitalize', 'off')
    this.textarea_el.setAttribute('spellcheck', 'false')
    this.textarea_el.setAttribute('type', 'text')

    this.textarea_el.addEventListener('scroll', () => {
      if (!this.reader.active) { this.stats.on_scroll() }
    })

    // Trigger update when selection changes
    this.textarea_el.addEventListener('select', (e) => {
      if (!this.reader.active) { this.update() }
    })

    this.textarea_el.addEventListener('input', () => {
      this.project.page().commit()
    })

    this.theme.install(host)
  }

  start() {
    this.theme.start()
    this.font.start()
    this.dictionary.start()
    this.project.start()

    this.go.to_page()

    this.textarea_el.focus()
    this.textarea_el.setSelectionRange(0, 0)

    this.dictionary.update()
    this.update()
  }

  update(hard = false) {
    const nextChar = this.textarea_el.value.substr(this.textarea_el.selectionEnd, 1)

    this.selection.word = this.active_word()
    this.suggestion = (nextChar === '' || nextChar === ' ' || nextChar === EOL) ? this.dictionary.find_suggestion(this.selection.word) : null
    this.synonyms = this.dictionary.find_synonym(this.selection.word)
    this.selection.url = this.active_url()

    this.project.update()
    this.navi.update()
    this.stats.update()
  }

  select_autocomplete() {
    if (this.selection.word.trim() !== '' && this.suggestion && this.suggestion.toLowerCase() !== this.active_word().toLowerCase()) {
      this.autocomplete()
    } else {
      this.inject('\u00a0\u00a0')
    }
  }

  select_synonym() {
    if (this.synonyms) {
      this.replace_active_word_with(this.synonyms[this.selection.index % this.synonyms.length])
      this.stats.update()
      this.selection.index = (this.selection.index + 1) % this.synonyms.length
    }
  }

  select(from: any, to: any) {
    this.textarea_el.setSelectionRange(from, to)
  }

  select_word(target: any) {
    const from = this.textarea_el.value.split(target)[0].length
    this.select(from, from + target.length)
  }

  select_line(id: any) {
    const lineArr = this.textarea_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)

    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length

    this.select(from, to)
  }

  reload(force = false) {
    this.project.page().reload(force)
    this.load(this.project.page().text)
  }

  load(text: string) {
    this.textarea_el.value = text || ''
    this.update()
  }
  selected() {
    const from = this.textarea_el.selectionStart
    const to = this.textarea_el.selectionEnd
    const length = to - from
    return this.textarea_el.value.substr(from, length)
  }

  active_word_location(position = this.textarea_el.selectionEnd) {
    let from = position - 1
    while (from > -1) {
      const char = this.textarea_el.value[from]
      if (!char || !char.match(/[a-z]/i)) {
        break
      }
      from -= 1
    }

    let to = from + 1
    while (to < from + 30) {
      const char = this.textarea_el.value[to]
      if (!char || !char.match(/[a-z]/i)) {
        break
      }
      to += 1
    }

    from += 1

    return { from: from, to: to }
  }

  active_line_id() {
    const segments = this.textarea_el.value.substr(0, this.textarea_el.selectionEnd).split(EOL)
    return segments.length - 1
  }

  active_line() {
    const text = this.textarea_el.value
    const lines = text.split(EOL)
    return lines[this.active_line_id()]
  }

  active_word() {
    const l = this.active_word_location()
    return this.textarea_el.value.substr(l.from, l.to - l.from)
  }

  active_url() {
    const words = this.active_line().split(' ')
    for (const id in words) {
      if (words[id].indexOf('://') > -1 || words[id].indexOf('www.') > -1) {
        return words[id]
      }
    }
    return null
  }

  prev_character() {
    const l = this.active_word_location()
    return this.textarea_el.value.substr(l.from - 1, 1)
  }

  replace_active_word_with(word: string) {
    const l = this.active_word_location()
    const w = this.textarea_el.value.substr(l.from, l.to - l.from)

    // Preserve capitalization
    if (w.substr(0, 1) === w.substr(0, 1).toUpperCase()) {
      word = word.substr(0, 1).toUpperCase() + word.substr(1, word.length)
    }

    this.textarea_el.setSelectionRange(l.from, l.to)

    document.execCommand('insertText', false, word)

    this.textarea_el.focus()
  }

  replace_selection_with(characters: any) {
    document.execCommand('insertText', false, characters)
    this.update()
  }

  replace_line(id: any, newText: string, del = false) {
    const lineArr = this.textarea_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)

    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length

    // splicing the string
    const newTextValue = this.textarea_el.value.slice(0, del ? from - 1 : from) + newText + this.textarea_el.value.slice(to)

    // the cursor automatically moves to the changed position, so we have to set it back
    let cursorStart = this.textarea_el.selectionStart
    let cursorEnd = this.textarea_el.selectionEnd
    const oldLength = this.textarea_el.value.length
    const oldScroll = this.textarea_el.scrollTop
    // setting text area
    this.load(newTextValue)
    // adjusting the cursor position for the change in length
    const lengthDif = this.textarea_el.value.length - oldLength
    if (cursorStart > to) {
      cursorStart += lengthDif
      cursorEnd += lengthDif
    }
    // setting the cursor position
    if (this.textarea_el.setSelectionRange) {
      this.textarea_el.setSelectionRange(cursorStart, cursorEnd)
    } else if (this.textarea_el.createTextRange) {
      const range = this.textarea_el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', cursorEnd)
      range.moveStart('character', cursorStart)
      range.select()
    }
    // setting the scroll position
    this.textarea_el.scrollTop = oldScroll
    // this function turned out a lot longer than I was expecting. Ah well :/
  }

  inject(characters = '__') {
    const pos = this.textarea_el.selectionStart
    this.textarea_el.setSelectionRange(pos, pos)
    document.execCommand('insertText', false, characters)
    this.update()
  }

  inject_line(characters = '__') {
    this.select_line(this.active_line_id())
    this.inject(characters)
  }

  inject_multiline(characters = '__') {
    const lines = this.selected().match(/[^\r\n]+/g)
    let text = ''
    for (const id in lines) {
      const line = lines[id]
      text += `${characters}${line}\n`
    }
    this.replace_selection_with(text)
  }

  find(word: string) {
    const text = this.textarea_el.value.toLowerCase()
    const parts = text.split(word.toLowerCase())
    const a = []
    let sum = 0

    for (const id in parts) {
      const p = parts[id].length
      a.push(sum + p)
      sum += p + word.length
    }

    a.splice(-1, 1)

    return a
  }

  autocomplete() {
    this.inject(this.suggestion.substr(this.selection.word.length, this.suggestion.length) + ' ')
  }

  open_url(target: any = this.active_url()) {
    if (!target) { return }

    this.select_word(target)
    // setTimeout(() => { require('electron').shell.openExternal(target) }, 500)
  }

  reset() {
    this.theme.reset()
    this.font.reset()
    this.update()
  }

  toggle_autoindent() {
    this.autoindent = !this.autoindent
  }
}


export const left = new Left();