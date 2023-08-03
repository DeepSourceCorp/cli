const focusDirective = {
  // When the bound element is inserted into the DOM...
  inserted(el: HTMLElement): void {
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
      const elements = Array.from(el.getElementsByTagName(tagName)) as HTMLElement[]
      if (elements.length) {
        elements[0].focus()
        return true
      }
      return false
    }

    const allowedTags = ['input', 'checkbox', 'button', 'select']

    if (allowedTags.some((tag) => tag.toUpperCase() === el.nodeName)) {
      // See if the focused element is in one of the allowed input tags
      el.focus()
    } else {
      // If not, check if there's a focusable element in the element children
      for (const tag of allowedTags) {
        if (focusIfAvailable(tag)) break
      }
    }
  }
}

export default focusDirective
