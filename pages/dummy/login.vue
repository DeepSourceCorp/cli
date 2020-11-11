<template>
  <div>
    <button class="bg-robin btn-current rounded-xl" @click="dispatchAction">Log me the fuck in.</button>
    <button class="bg-robin btn-current rounded-xl" @click="foo">Log me the fuck in.</button>
    <h1>{{user.loggedIn}}</h1>
    <h1>{{user.token}}</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_COMPLETE_LOGIN, ACT_RESET_TOKEN } from '~/store/auth'
import { mapState } from 'vuex'
import { Component, Watch } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'

const auth = namespace('auth')

@Component
export default class Index extends Vue {
  @auth.State
  user: any

  public dispatchAction() {
    this.$store.dispatch(`auth/${ACT_COMPLETE_LOGIN}`)
    console.log(this.user.token);
  }

  public foo() {
    this.$store.dispatch(`auth/${ACT_RESET_TOKEN}`)
  }
}
</script>

<style>
.container {
  margin-left: auto;
  margin-right: auto;
  padding: 100px;
}
.bar {
  color: grey;
  padding: 10px;
  border-radius: 2px;
  border: 1px lightgrey solid;
  margin-bottom: 5px;
  margin-top: 5px;
}
.btn {
  background: lightgray;
  border-radius: 2px;
  border: 1px lightgrey solid;
  padding: 10px 15px;
  color: black;
}
</style>
