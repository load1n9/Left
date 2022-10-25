import { left } from "../left.ts";

const EOL = '\n'

export class Insert {
  is_active = false

  start() {
    left.controller.set('insert')
    this.is_active = true
    left.update()
  }

  stop() {
    left.controller.set('default')
    this.is_active = false
    left.update()
  }

  time() {
    left.inject(new Date().toLocaleTimeString() + ' ')
    this.stop()
  }

  date() {
    const date = new Date()
    const strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const d = date.getDate()
    const m = strArray[date.getMonth()]
    const y = date.getFullYear()
    const s = '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y
    left.inject(s + ' ')
    this.stop()
  }

  path() {
    if (left.project.paths().length === 0) { this.stop(); return }

    left.inject(left.project.paths()[left.project.index])
    this.stop()
  }

  header() {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('# ')
    } else if (isMultiline) {
      left.inject_multiline('# ')
    } else {
      left.inject_line('# ')
    }
    this.stop()
  }

  subheader() {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('## ')
    } else if (isMultiline) {
      left.inject_multiline('## ')
    } else {
      left.inject_line('## ')
    }
    this.stop()
  }

  comment() {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('-- ')
    } else if (isMultiline) {
      left.inject_multiline('-- ')
    } else {
      left.inject_line('-- ')
    }
    this.stop()
  }

  list() {
    const isMultiline = left.selected().match(/[^\r\n]+/g)

    if (left.prev_character() === EOL && !isMultiline) {
      left.inject('- ')
    } else if (isMultiline) {
      left.inject_multiline('- ')
    } else {
      left.inject_line('- ')
    }
    this.stop()
  }

  line() {
    if (left.prev_character() !== EOL) {
      left.inject(EOL)
    }
    left.inject('===================== \n')
    this.stop()
  }

  status() {
    return `<b>Insert Mode</b> c-D <i>Date</i> c-T <i>Time</i> ${left.project.paths().length > 0 ? 'c-P <i>Path</i> ' : ''}c-H <i>Header</i> c-/ <i>Comment</i> Esc <i>Exit</i>.`
  }
}