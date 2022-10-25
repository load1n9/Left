import { left } from './left.ts';

import "./reset.css";
import "./fonts.css";
import "./main.css";
import "./theme.css";

const EOL = '\n'
window.left = left;

left.install(document.body)
left.start()

document.onkeydown = (e) => {
  window.left.last_char = e.key
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      window.left.stats.nextSynonym()
    } else {
      window.left.select_autocomplete()
    }
    e.preventDefault()
    return
  }
  if (e.metaKey || e.ctrlKey) {
    if (e.keyCode === 221) {
      window.left.navi.next_marker()
      e.preventDefault()
      return
    }
    if (e.keyCode === 291) {
      window.left.navi.prev_marker()
      e.preventDefault()
      return
    }
  }
  if (e.key === ' ' || e.key === 'Enter') {
    window.left.selection.index = 0
  }

  if (e.key.substring(0, 5) === 'Arrow') {
    setTimeout(() => window.left.update(), 0)
    return
  }
  if (e.key === 'Enter') {
    setTimeout(() => { window.left.dictionary.update(); window.left.update() }, 16)
  }
}

document.onkeyup = (e) => {
  if (e.key === 'Enter' && window.left.autoindent) {
    let cur_pos = window.left.textarea_el.selectionStart

    let indent = ''
    let line = ''
    for (let pos = cur_pos - 2;
      pos >= 0 &&
      window.left.textarea_el.value.charAt(pos) != '\n';
      pos--
    ) {
      line += window.left.textarea_el.value.charAt(pos)
    }

    let matches
    if ((matches = /^.*?([\s\t]+)$/gm.exec(line)) !== null) { // found indent
      indent = matches[1].split('').reverse().join('') // reverse
      window.left.textarea_el.selectionStart = cur_pos
      window.left.inject(indent)
    }
  }

  if (e.keyCode === 16) { // Shift
    window.left.stats.applySynonym()
    window.left.update()
    return
  }
  if (e.keyCode !== 9) {
    window.left.update()
  }
}

window.addEventListener('dragover', (e) => {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
})

window.addEventListener('drop', (e) => {
  e.stopPropagation()
  e.preventDefault()

  const files = e.dataTransfer.files

  for (const id in files) {
    const file = files[id]
    if (!file.path) { continue }
    if (file.type && !file.type.match(/text.*/)) { console.log(`Skipped ${file.type} : ${file.path}`); continue }
    if (file.path && file.path.substr(-3, 3) === 'thm') { continue }

    window.left.project.add(file.path)
  }

  window.left.reload()
  window.left.navi.next_page()
})

document.onclick = (e) => {
  window.left.selection.index = 0
  window.left.operator.stop()
  window.left.reader.stop()
  window.left.update()
}




// On Windows: open the file specified in the first argument
// (allows Open With and file associations on Windows)
// if (process.platform === 'win32' && remote.process.argv.length > 1) {
// left.project.add(remote.process.argv[1])
// }

// Menu

class App {
  static isFullscreen = false;
  static toggleFullscreen() {
    if (App.isFullscreen) {
      document.exitFullscreen();
      App.isFullscreen = false;
    } else {
      document.body.requestFullscreen();
      App.isFullscreen = true;
    }
  }
}
left.controller.add('default', '*', 'Fullscreen', () => { App.toggleFullscreen() }, 'CmdOrCtrl+Enter')
left.controller.addRole('default', '*', 'reload')
left.controller.addRole('default', '*', 'forcereload')
left.controller.addRole('default', '*', 'toggledevtools')
left.controller.add('default', '*', 'Reset', () => { left.reset() }, 'CmdOrCtrl+Backspace')
left.controller.add('default', '*', 'Quit', () => { left.project.quit() }, 'CmdOrCtrl+Q')

left.controller.add('default', 'File', 'New', () => { left.project.new() }, 'CmdOrCtrl+N')
left.controller.add('default', 'File', 'Open', () => { left.project.open() }, 'CmdOrCtrl+O')
left.controller.add('default', 'File', 'Save', () => { left.project.save() }, 'CmdOrCtrl+S')
left.controller.add('default', 'File', 'Save As', () => { left.project.save_as() }, 'CmdOrCtrl+Shift+S')
left.controller.add('default', 'File', 'Discard Changes', () => { left.project.discard() }, 'CmdOrCtrl+D')
left.controller.add('default', 'File', 'Close File', () => { left.project.close() }, 'CmdOrCtrl+W')
left.controller.add('default', 'File', 'Force Close', () => { left.project.force_close() }, 'CmdOrCtrl+Shift+W')

left.controller.addRole('default', 'Edit', 'undo')
left.controller.addRole('default', 'Edit', 'redo')
left.controller.addRole('default', 'Edit', 'cut')
left.controller.addRole('default', 'Edit', 'copy')
left.controller.addRole('default', 'Edit', 'paste')
left.controller.addRole('default', 'Edit', 'delete')
left.controller.addRole('default', 'Edit', 'selectall')
left.controller.add('default', 'Edit', 'Add Linebreak', () => { left.go.to_next(EOL, false); left.inject(EOL) }, 'CmdOrCtrl+Shift+Enter')
left.controller.add('default', 'Edit', 'Toggle Autoindent', () => { left.toggle_autoindent() }, 'CmdOrCtrl+Shift+T')

left.controller.add('default', 'Select', 'Select Autocomplete', () => { left.select_autocomplete() }, 'Tab')
left.controller.add('default', 'Select', 'Select Synonym', () => { left.select_synonym() }, 'Shift+Tab')
left.controller.add('default', 'Select', 'Find', () => { left.operator.start('find: ') }, 'CmdOrCtrl+F')
left.controller.add('default', 'Select', 'Replace', () => { left.operator.start('replace: a -> b') }, 'CmdOrCtrl+Shift+F')
left.controller.add('default', 'Select', 'Goto', () => { left.operator.start('goto: ') }, 'CmdOrCtrl+G')
left.controller.add('default', 'Select', 'Open Url', () => { left.open_url() }, 'CmdOrCtrl+B')

left.controller.add('default', 'Navigation', 'Next File', () => { left.navi.next_page() }, 'CmdOrCtrl+Shift+]')
left.controller.add('default', 'Navigation', 'Prev File', () => { left.navi.prev_page() }, 'CmdOrCtrl+Shift+[')
left.controller.add('default', 'Navigation', 'Next Marker', () => { left.navi.next_marker() }, 'CmdOrCtrl+]')
left.controller.add('default', 'Navigation', 'Prev Marker', () => { left.navi.prev_marker() }, 'CmdOrCtrl+[')

left.controller.add('default', 'View', 'Toggle Navigation', () => { left.navi.toggle() }, 'CmdOrCtrl+\\')
left.controller.add('default', 'View', 'Previous Font', () => { left.font.previousFont() }, 'CmdOrCtrl+Shift+,')
left.controller.add('default', 'View', 'Next Font', () => { left.font.nextFont() }, 'CmdOrCtrl+Shift+.')
left.controller.add('default', 'View', 'Decrease Font Size', () => { left.font.decreaseFontSize() }, 'CmdOrCtrl+-')
left.controller.add('default', 'View', 'Increase Font Size', () => { left.font.increaseFontSize() }, 'CmdOrCtrl+=')
left.controller.add('default', 'View', 'Reset Font Size', () => { left.font.resetFontSize() }, 'CmdOrCtrl+0')

left.controller.add('default', 'Mode', 'Reader', () => { left.reader.start() }, 'CmdOrCtrl+K')
left.controller.add('default', 'Mode', 'Insert', () => { left.insert.start() }, 'CmdOrCtrl+I')

left.controller.add("default", "Theme", "Open Theme", () => { left.theme.open() }, "CmdOrCtrl+Shift+O")
left.controller.add("default", "Theme", "Reset Theme", () => { left.theme.reset() }, "CmdOrCtrl+Shift+Backspace")
left.controller.addSpacer('default', 'Theme', 'Download')

left.controller.add('reader', '*', 'Fullscreen', () => { App.toggleFullscreen() }, 'CmdOrCtrl+Enter')
left.controller.add('reader', '*', 'Reset', () => { left.theme.reset() }, 'CmdOrCtrl+Backspace')
left.controller.add('reader', '*', 'Quit', () => { left.project.quit() }, 'CmdOrCtrl+Q')
left.controller.add('reader', 'Reader', 'Stop', () => { left.reader.stop() }, 'Esc')

left.controller.add('operator', '*', 'Fullscreen', () => { App.toggleFullscreen() }, 'CmdOrCtrl+Enter')
left.controller.add('operator', '*', 'Reset', () => { left.theme.reset() }, 'CmdOrCtrl+Backspace')
left.controller.add('operator', '*', 'Quit', () => { left.project.quit() }, 'CmdOrCtrl+Q')

left.controller.add('insert', '*', 'Fullscreen', () => { App.toggleFullscreen() }, 'CmdOrCtrl+Enter')
left.controller.add('insert', '*', 'Reset', () => { left.theme.reset() }, 'CmdOrCtrl+Backspace')
left.controller.add('insert', '*', 'Quit', () => { left.project.quit() }, 'CmdOrCtrl+Q')

left.controller.add('insert', 'Insert', 'Date', () => { left.insert.date() }, 'CmdOrCtrl+D')
left.controller.add('insert', 'Insert', 'Time', () => { left.insert.time() }, 'CmdOrCtrl+T')
left.controller.add('insert', 'Insert', 'Path', () => { left.insert.path() }, 'CmdOrCtrl+P')
left.controller.add('insert', 'Insert', 'Header', () => { left.insert.header() }, 'CmdOrCtrl+H')
left.controller.add('insert', 'Insert', 'SubHeader', () => { left.insert.subheader() }, 'CmdOrCtrl+Shift+H')
left.controller.add('insert', 'Insert', 'Comment', () => { left.insert.comment() }, 'CmdOrCtrl+/')
left.controller.add('insert', 'Insert', 'Line', () => { left.insert.line() }, 'CmdOrCtrl+L')
left.controller.add('insert', 'Insert', 'List', () => { left.insert.list() }, 'CmdOrCtrl+-')
left.controller.add('insert', 'Mode', 'Stop', () => { left.insert.stop() }, 'Esc')

left.controller.addRole('operator', 'Edit', 'undo')
left.controller.addRole('operator', 'Edit', 'redo')
left.controller.addRole('operator', 'Edit', 'cut')
left.controller.addRole('operator', 'Edit', 'copy')
left.controller.addRole('operator', 'Edit', 'paste')
left.controller.addRole('operator', 'Edit', 'delete')
left.controller.addRole('operator', 'Edit', 'selectall')

left.controller.add('operator', 'Find', 'Find', () => { left.operator.start('find: ') }, 'CmdOrCtrl+F')
left.controller.add('operator', 'Find', 'Find Next', () => { left.operator.find_next() }, 'CmdOrCtrl+N')
left.controller.add('operator', 'Operator', 'Stop', () => { left.operator.stop() }, 'Esc')

left.controller.commit()