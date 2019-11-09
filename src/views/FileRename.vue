<template>
  <v-container fluid>
    <v-card>
      <v-toolbar dense flat color="primary" dark>
        <v-toolbar-title>일기장</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="read()">
          <v-icon>mdi-read</v-icon>
        </v-btn>
        <v-btn icon @click="save()">
          <v-icon>mdi-content-save</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-text-field label="변경하고 싶은 문자열" v-model="beforeText"></v-text-field>
            <v-list-item v-for="(item, i) in beforeItems" :key="i">
              <v-list-item-content>
                {{i + 1}}. {{item}}
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="6">
            <v-text-field label="변경할 문자열" v-model="afterText"></v-text-field>
            <v-list-item v-for="(item, i) in afterItems" :key="i">
              <v-list-item-content>
                {{i + 1}}. {{item}}
              </v-list-item-content>
            </v-list-item>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')

export default {
  data () {
    return {
      dir: '',
      beforeItems: [],
      afterItems: [],
      beforeText: '',
      afterText: ''
    }
  },
  watch: {
    beforeText () {
      this.changeText()
    },
    afterText () {
      this.changeText()
    }
  },
  methods: {
    changeText () {
      this.afterItems = []
      this.beforeItems.forEach(v => {
        const c = v.replace(this.beforeText, this.afterText)
        this.afterItems.push(c)
      })
    },
    read () {
      const rs = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      if (!rs) return
      this.dir = rs[0]
      this.beforeItems = fs.readdirSync(this.dir)
    },
    save () {
      if (!this.dir) return
      this.beforeItems.forEach((v, i) => {
        const o = path.join(this.dir, v)
        const n = path.join(this.dir, this.afterItems[i])
        fs.renameSync(o, n)
      })
      alert('good')
    }
  }
}
</script>
