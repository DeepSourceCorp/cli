import '../assets/css/tailwind.css'
import '../assets/css/typography.css'
import '../assets/css/layout.css'

export default {
  title: 'Gradients'
}

export const BGGradients = () => ({
  template: `<div class='grid grid-cols-4 gap-5 p-5'>
      <div>
        <div class="w-full h-32 rounded-lg bg-gradient-ocean"></div>
        <h3 class="mt-2 text-lg font-bold text-vanilla-100">Ocean</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-ocean</pre>
      </div>
      <div>
        <div class="w-full h-32 rounded-lg bg-gradient-dark-dawn"></div>
        <h3 class="mt-2 text-lg font-bold text-vanilla-100">Dark Dawn</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-dark-dawn</pre>
      </div>
      <div>
        <div class="w-full h-32 rounded-lg bg-gradient-dawn"></div>
        <h3 class="mt-2 text-lg font-bold text-vanilla-100">Dawn</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-dawn</pre>
      </div>
      <div>
        <div class="w-full h-32 rounded-lg bg-gradient-splash"></div>
        <h3 class="mt-2 text-lg font-bold text-vanilla-100">Splash</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-splash</pre>
      </div>
      <div>
        <div class="w-full h-32 rounded-lg bg-gradient-juniper"></div>
        <h3 class="mt-2 text-lg font-bold text-vanilla-100">Juniper</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-juniper</pre>
      </div>
      <div>
        <div class="w-full h-32 rounded-lg bg-gradient-skeleton"></div>
        <h3 class="mt-2 text-lg font-bold text-vanilla-100">Skeleton</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-skeleton</pre>
      </div>
    </div>`
})

export const TextGradients = () => ({
  template: `<div class='grid grid-cols-4 gap-5 p-5'>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-ocean">Ocean</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-ocean</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-dark-dawn">Dark Dawn</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-dark-dawn</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-dawn">Dawn</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-dawn</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-splash">Splash</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-splash</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-juniper">Juniper</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-juniper</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-skeleton">Skeleton</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-skeleton</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
    </div>`
})

export const TextGradientsOnLightBackground = () => ({
  template: `<div class='grid grid-cols-4 gap-5 p-5 rounded-lg bg-ink-100'>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-ocean">Ocean</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-ocean</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-dark-dawn">Dark Dawn</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-dark-dawn</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-dawn">Dawn</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-dawn</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-splash">Splash</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-splash</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-juniper">Juniper</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-juniper</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
      <div>
        <h3 class="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-skeleton">Skeleton</h3>
        <pre class="text-vanilla-400 text-xs">bg-gradient-skeleton</pre>
        <pre class="text-vanilla-400 opacity-70 text-xxs">text-transparent bg-clip-text</pre>
      </div>
    </div>`
})
