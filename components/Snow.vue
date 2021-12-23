<template>
  <div>
    <div v-for="ii in 200" :key="ii" class="snow-flake"></div>
  </div>
</template>
<style lang="scss">
@function randomRange($min, $max) {
  $rand: random();
  @return $min + floor($rand * (($max - $min) + 1));
}

.snow-flake {
  $total: 200;
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  will-change: transform;

  // loop through each particle count to assign
  // random floating behaviour, size and opacity to all
  @for $loopIndex from 1 through $total {
    // 90vw to compenstae for the offset
    $x-position: random() * 90vw; // start with a random number for x position
    $random-scale: random(); // scale the base 10px size by a factor of upto 1
    // Randomize to ensure each snowflake falls at a separate pace
    $float-duration: randomRange(10, 30) * 1s;
    $float-delay: random(30) * -1s; // Ensure not all snowflakes start falling together

    &:nth-child(#{$loopIndex}) {
      opacity: random();
      transform: translate($x-position, -10px) scale($random-scale);
      // assign an animation name
      animation: float-#{$loopIndex} $float-duration $float-delay linear infinite;
    }

    // offset for calculation, this will evaluate to a number between -10 and 10
    // increasing this will make the snow move right and left more intensely
    // 10 is a sweet spot, trust me here, not my first rodeo
    $offset: randomRange(-1, 1) * 10vw;

    $x-position-start: $x-position + $offset;
    $x-position-max-float: $x-position + ($offset / 2);

    $float-markers: randomRange(30000, 80000) / 100000;
    $y-position-start: $float-markers * 100vh;

    @keyframes float-#{$loopIndex} {
      // this keyframe ensures the snow changes direction once
      // we can add more of these to make the path of the snowflake more random
      #{percentage($float-markers)} {
        transform: translate($x-position-start, $y-position-start) scale($random-scale);
      }

      // x-position-max-float to ensure
      // 100vh to ensure snow flakes always end up down
      to {
        transform: translate($x-position-max-float, 100vh) scale($random-scale);
      }
    }
  }
}
</style>
