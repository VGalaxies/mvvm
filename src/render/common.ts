export function createElement(tag: string) {
  return document.createElement(tag);
}

export function setElementText(el: HTMLElement, text: string) {
  el.textContent = text;
}

export function insert(el: HTMLElement, parent: HTMLElement, anchor?: Node) {
  parent.insertBefore(el, anchor);
}
