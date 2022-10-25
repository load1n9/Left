// import fs from 'vite-plugin-fs/browser';

const fs: any = {};

export class Controller {

  menu = { default: {} }
  mode = 'default'

  start() {
  }

  add(mode: any, cat: any, label: any, fn: any, accelerator: any) {
    if (!this.menu[mode]) { this.menu[mode] = {} }
    if (!this.menu[mode][cat]) { this.menu[mode][cat] = {} }
    this.menu[mode][cat][label] = { fn: fn, accelerator: accelerator }
  }

  addRole(mode: any, cat: any, label: any) {
    if (!this.menu[mode]) { this.menu[mode] = {} }
    if (!this.menu[mode][cat]) { this.menu[mode][cat] = {} }
    this.menu[mode][cat][label] = { role: label }
  }

  addSpacer(mode: any, cat: any, label: any, type = 'separator') {
    if (!this.menu[mode]) { this.menu[mode] = {} }
    if (!this.menu[mode][cat]) { this.menu[mode][cat] = {} }
    this.menu[mode][cat][label] = { type: type }
  }

  clearCat(mode: any, cat: any) {
    if (this.menu[mode]) { this.menu[mode][cat] = {} }
  }

  set(mode = 'default') {
    this.mode = mode
    this.commit()
  }

  format() {
    const f = []
    const m = this.menu[this.mode]
    for (const cat in m) {
      const submenu = []
      for (const name in m[cat]) {
        const option = m[cat][name]
        if (option.role) {
          submenu.push({ role: option.role })
        } else if (option.type) {
          submenu.push({ type: option.type })
        } else {
          submenu.push({ label: name, accelerator: option.accelerator, click: option.fn })
        }
      }
      f.push({ label: cat, submenu: submenu })
    }
    return f
  }

  commit() {
    console.log('Controller', 'Changing..')
    // this.app.injectMenu(this.format())
  }

  accelerator(key: any, menu: any) {
    const acc = { basic: null, ctrl: null }
    for (cat in menu) {
      const options = menu[cat]
      for (const id in options.submenu) {
        const option = options.submenu[id]; if (option.role) { continue }
        acc.basic = (option.accelerator.toLowerCase() === key.toLowerCase()) ? option.label.toUpperCase().replace('TOGGLE ', '').substr(0, 8).trim() : acc.basic
        acc.ctrl = (option.accelerator.toLowerCase() === ('CmdOrCtrl+' + key).toLowerCase()) ? option.label.toUpperCase().replace('TOGGLE ', '').substr(0, 8).trim() : acc.ctrl
      }
    }
    return acc
  }

  docs() {
    // TODO
    console.log(this.menu.default)
  }
}
