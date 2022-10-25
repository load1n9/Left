import { left } from "../left.ts";

function clamp(v: number, min: number, max: number) { return v < min ? min : v > max ? max : v }

export class Navi {
  el: any = document.createElement('navi')

  install(host: any) {
    host.appendChild(this.el)
  }
  update() {
    let html = ''
    const current = this.marker()

    for (const pid in left.project.pages) {
      const page = left.project.pages[pid]
      if (!page) { continue }
      html += `<ul class="${left.project.index === parseInt(pid) ? 'active' : ''}">`
      html += this._page(parseInt(pid), page)
      const markers = page.markers()
      for (const i in markers) {
        const marker = markers[i]
        html += this._marker(pid, current, marker, markers)
      }
      html += '</ul>'
    }
    this.el.innerHTML = html
  }

  _page(id: any, page: any) {
    return `<li class='page ${page.has_changes() ? 'changes' : ''}' onclick='left.go.to_page(${id})'>${page.name()}</li>`
  }

  _marker(pid: any, current: any, marker: any, markers: any) {
    return `<li class='marker ${marker.type} ${current && current.line === marker.line ? 'active' : ''}' onclick='left.go.to_page(${pid}, ${marker.line})'><span>${marker.text}</span></li>`
  }

  next_page() {
    const page = clamp(parseInt(left.project.index) + 1, 0, left.project.pages.length - 1)
    left.go.to_page(page, 0)
  }

  prev_page() {
    const page = clamp(parseInt(left.project.index) - 1, 0, left.project.pages.length - 1)
    left.go.to_page(page, 0)
  }

  next_marker() {
    const page = clamp(parseInt(left.project.index), 0, left.project.pages.length - 1)
    const marker = this.marker()

    if (!marker) { return }

    const markers = left.project.page().markers()
    const nextIndex = clamp(marker.id + 1, 0, markers.length - 1)

    left.go.to_page(page, markers[nextIndex].line)
  }

  prev_marker() {
    const page = clamp(parseInt(left.project.index), 0, left.project.pages.length - 1)
    const marker = this.marker()

    if (!marker) { return }

    const markers = left.project.page().markers()
    const nextIndex = clamp(marker.id - 1, 0, markers.length - 1)

    left.go.to_page(page, markers[nextIndex].line)
  }

  marker() {
    if (!left.project.page()) { return [] }

    const markers = left.project.page().markers()
    const pos = left.active_line_id()

    if (markers.length < 1) { return }

    for (const id in markers) {
      const marker = markers[id]
      if (marker.line > pos) { return markers[parseInt(id) - 1] }
    }
    return markers[markers.length - 1]
  }

  on_scroll() {
    const scrollDistance = left.textarea_el.scrollTop
    const scrollMax = left.textarea_el.scrollHeight - left.textarea_el.offsetHeight
    const scrollPerc = Math.min(1, (scrollMax === 0) ? 0 : (scrollDistance / scrollMax))
    const naviOverflowPerc = Math.max(0, (left.navi.el.scrollHeight / window.innerHeight) - 1)

    left.navi.el.style.transform = 'translateY(' + (-100 * scrollPerc * naviOverflowPerc) + '%)'
  }

  toggle() {
    document.body.classList.toggle('mobile')
  }
}

