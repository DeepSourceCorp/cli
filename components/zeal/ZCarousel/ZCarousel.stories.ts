import ZCarousel from './ZCarousel.vue'
import ZSlide from '../ZSlide/ZSlide.vue'
import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

export default {
  title: 'Carousel',
  component: ZCarousel,
  excludeStories: /.*Data$/
}

export const DefaultCarousel = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel>
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithoutControls = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel :showControls="false">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithoutIndicators = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel :showIndicators="false">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithoutAutoSlide = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel :autoSlide="false">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithSlideTiming = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel autoTiming="1000">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithActiveSlide = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel :activeIndex="3">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithIndicatorInRight = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel indicatorPosition="right">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})

export const CarouselWithIndicatorCenter = () => ({
  components: { ZCarousel, ZSlide },
  template: `<div class='carousel-container'>
        <z-carousel indicatorPosition="center">
           <z-slide>
            <img src="https://picsum.photos/id/237/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/236/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/235/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/234/600/350">
            </z-slide>
            <z-slide>
            <img src="https://picsum.photos/id/233/600/350">
            </z-slide>
        </z-carousel>
    </div>`
})
