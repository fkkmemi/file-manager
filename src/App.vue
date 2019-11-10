<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>File Manager </span>
        <span class="font-weight-light">v{{ pkg.version }}</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-if="$route.path === '/main'" @click="$router.push('/')">
        <v-icon>mdi-lock-open</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import pkg from '../package.json'

export default {
  name: 'App',
  data: () => ({
    pkg
  })
}
</script>
