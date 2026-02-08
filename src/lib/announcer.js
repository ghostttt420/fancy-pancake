// Global announcement system for screen readers
export let announceFn = null

export function setAnnounceFn(fn) {
  announceFn = fn
}

export function announce(message, priority = 'polite') {
  if (announceFn) {
    announceFn(message, priority)
  }
}
