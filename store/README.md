# STORE

This directory contains your Vuex Store files.
Vuex Store option is implemented in the Nuxt.js framework.

Creating a file in this directory automatically activates the option in the framework.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/guide/vuex-store).

## Structure

Each file is a namespaced module of vuex store, in this directory. `index.ts` is the global state and the rest are modules.
Every module has it's own state, getters, actions and mutations. 

Literals used to name the actions are stored separately, in the file `~types/action-types.ts`. The reason to do this is that the developer can easily go through all the actions of the entire app at once.

There was no need to take the literals, used to name the mutations, out of the module so they are kept in their respective module files.