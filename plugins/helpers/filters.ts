import Vue from 'vue'
import pluralize from 'pluralize'

Vue.filter('pluralize', function (value: string, number: number) {
  return pluralize(value, number)
})
