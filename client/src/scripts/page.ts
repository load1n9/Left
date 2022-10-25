const fs: any = {};

import { left } from "../left.ts";

const EOL = '\n'

export class Page {
  size = 0
  watchdog = true;
  path: any;
  text: string;
  constructor(text = '', path = null) {
    this.text = text.replace(/\r?\n/g, '\n')
    this.path = path
  }


  name() {
    if (!this.path) { return 'Untitled' }
    const parts = this.path.replace(/\\/g, '/').split('/')
    return parts[parts.length - 1]
  }

  has_changes() {
    if (!this.path) {
      if (this.text && this.text.length > 0) { return true }
      return false
    }

    const last_size = this.size
    const ret = (this.load() !== this.text)

    // was this change done outside Left?
    // if (ret && (last_size !== this.size && this.watchdog)) {
    //   const response = dialog.showMessageBoxSync(app.win, {
    //     type: "question",
    //     title: "Confirm",
    //     message: "File was modified outside Left. Do you want to reload it?",
    //     buttons: ['Yes', 'No', 'Ignore future occurrencies'],
    //     detail: `New size of file is: ${this.size} bytes.`,
    //     icon: `${app.getAppPath()}/icon.png`
    //   })

    //   if (response === 0) {
    //     this.commit(this.load())
    //     left.reload()
    //     return !ret // return false as it was reloaded
    //   } else if (response === 2)
    //     this.watchdog = !this.watchdog
    // }
    return ret
  }

  commit(text: string = left.textarea_el.value) {
    this.text = text
  }

  reload(force = false) {
    if (!this.path) { return }

    if (!this.has_changes() || force) {
      this.commit(this.load())
    }
  }

  load() {
    if (!this.path) { return }
    let data
    try {
      data = fs.readFileSync(this.path, 'utf-8')
    } catch (err) {
      this.path = null
      return
    }

    // update file size
    this.size = fs.statSync(this.path).size

    return data
  }

  markers() {
    const a = []
    const lines = this.text.split(EOL)
    for (const id in lines) {
      const line = lines[id].trim()
      if (line.substr(0, 2) === '##') { a.push({ id: a.length, text: line.replace('##', '').trim(), line: parseInt(id), type: 'subheader' }) } else if (line.substr(0, 1) === '#') { a.push({ id: a.length, text: line.replace('#', '').trim(), line: parseInt(id), type: 'header' }) } else if (line.substr(0, 2) === '--') { a.push({ id: a.length, text: line.replace('--', '').trim(), line: parseInt(id), type: 'comment' }) }
    }
    return a
  }
}

