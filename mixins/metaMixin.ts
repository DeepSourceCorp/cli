import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class MetaMixin extends Vue {
  metaTitle = 'DeepSource'
  metaDescription = ''
  metaImage = ''
  metaImageAlt = ''
  metaTwitterSiteAttribution = '@DeepSourceHQ'

  get pageImageAltText(): string {
    return this.metaImageAlt || this.metaTitle
  }

  get pageUrl(): string {
    const currentRoute = (this.$route.path as string) || ''
    const url = `https://${this.$config.domain}${currentRoute}`
    if (url.slice(-1) === '/') {
      return url.slice(0, -1)
    }
    return url
  }

  get generateOpenGraphMeta(): Record<string, string>[] {
    return [
      { hid: 'og:title', property: 'og:title', content: this.metaTitle },
      { hid: 'og:description', property: 'og:description', content: this.metaDescription },
      { hid: 'og:url', property: 'og:url', content: this.pageUrl },
      ...(this.metaImage
        ? [
            { hid: 'og:image', property: 'og:image', content: this.metaImage },
            {
              hid: 'og:image:secure_url',
              property: 'og:image:secure_url',
              content: this.metaImage
            },
            { hid: 'og:image:alt', property: 'og:image:alt', content: this.pageImageAltText }
          ]
        : [])
    ]
  }

  get generateTwitterMeta(): Record<string, string>[] {
    return [
      { hid: 'twitter:title', name: 'twitter:title', content: this.metaTitle },
      { hid: 'twitter:description', name: 'twitter:description', content: this.metaDescription },
      { hid: 'twitter:url', property: 'twitter:url', content: this.pageUrl },
      { hid: 'twitter:site', name: 'twitter:site', content: this.metaTwitterSiteAttribution },
      ...(this.metaImage
        ? [
            { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
            { hid: 'twitter:image', property: 'twitter:image', content: this.metaImage },
            { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: this.pageImageAltText }
          ]
        : [])
    ]
  }

  head() {
    return {
      title: this.metaTitle,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.metaDescription
        },
        ...this.generateOpenGraphMeta,
        ...this.generateTwitterMeta
      ]
    }
  }
}
