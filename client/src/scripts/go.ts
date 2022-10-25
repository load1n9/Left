import { left } from "../left.ts";

const EOL = '\n'

export class Go {
  to_page(id: any = 0, line: any = 0) {
    left.project.index = clamp(parseInt(id), 0, left.project.pages.length - 1)

    console.log(`Go to page:${left.project.index}/${left.project.pages.length}`)

    const page = left.project.page()

    if (!page) { console.warn('Missing page', this.index); return }

    left.load(page.text)
    left.go.to_line(line)
    left.update()
  }

  to_line(id: any) {
    const lineArr = left.textarea_el.value.split(EOL, parseInt(id) + 1)
    const arrJoin = lineArr.join(EOL)
    const from = arrJoin.length - lineArr[id].length
    const to = arrJoin.length
    this.to(from, to)
  }

  to(from: any, to: any, scroll = true) {
    if (left.textarea_el.setSelectionRange) {
      left.textarea_el.setSelectionRange(from, to)
    } else if (left.textarea_el.createTextRange) {
      const range = left.textarea_el.createTextRange()
      range.collapse(true)
      range.moveEnd('character', to)
      range.moveStart('character', from)
      range.select()
    }
    left.textarea_el.focus()

    if (scroll) {
      this.scroll_to(from, to)
    }

    return from === -1 ? null : from
  }

  to_next(str: string, scroll = true) {
    const ta = left.textarea_el
    const text = ta.value
    const range = text.substr(ta.selectionStart, text.length - ta.selectionStart)
    const next = ta.selectionStart + range.indexOf(EOL)
    this.to(next, next, scroll)
  }

  scroll_to(from: number, to: number) {
    const textVal = left.textarea_el.value
    const div = document.createElement('div')
    div.innerHTML = textVal.slice(0, to)
    document.body.appendChild(div)
    animateScrollTo(left.textarea_el, div.offsetHeight - 60, 200)
    div.remove()
  }
}
// t = current time
// b = start value
// c = change in value
// d = duration



function clamp(v: number, min: number, max: number) { return v < min ? min : v > max ? max : v }


const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

function animateScrollTo(element: any, to: any, duration: any) {
  const start = element.scrollTop
  const change = to - start
  let currentTime = 0
  const increment = 20 // Equal to line-height

  const animate = function () {
    currentTime += increment
    const val = easeInOutQuad(currentTime, start, change, duration)
    element.scrollTop = val
    if (!left.reader.active) left.stats.on_scroll()
    if (currentTime < duration) {
      requestAnimationFrame(animate, increment)
    }
  }
  requestAnimationFrame(animate)
}
