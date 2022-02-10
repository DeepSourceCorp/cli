import Vue from 'vue'

export const focusDirective = {
  // When the bound element is inserted into the DOM...
  inserted: function (el: HTMLElement): void {
    let focused = false

    /**
     * Check if an element of the given tag name is available or not
     * If available focus on it and return true
     * else return false
     *
     * @param {string} tagName
     *
     * @return {void}
     */
    const focusIfAvailable = (tagName: string) => {
      const elements = el.getElementsByTagName(tagName)
      if (elements.length) {
        ;(elements[0] as HTMLElement).focus()
        return true
      }
      return false
    }

    const allowedTags = ['input', 'checkbox', 'button', 'select']

    if (allowedTags.map((tag) => tag.toUpperCase()).includes(el.nodeName)) {
      // See if the focused element is in one of the allowed input tags
      el.focus()
    } else {
      // If not, check if there's a focusable elemnt in the element children
      for (let ii = 0; ii < allowedTags.length; ii++) {
        focused = focusIfAvailable(allowedTags[ii])
        if (focused) break
      }
    }
  }
}

Vue.directive('focus', focusDirective)
