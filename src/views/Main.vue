<template>
  <v-container fluid>
    <v-card>
      <v-toolbar flat color="indigo darken-3" dark>
        <v-toolbar-title>{{ $route.query.db }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-card color="transparent" flat width="200" class="mr-4">
          <v-text-field
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
            v-model="search"
            clearable
          />
        </v-card>

        <v-card color="transparent" flat width="200">
          <v-combobox
            flat
            v-model="searchTags"
            :items="tags"
            multiple
            chips
            solo-inverted
            hide-details
            clearable
            cache-items
          >
          </v-combobox>
        </v-card>

        <v-btn icon @click="delAll()">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn icon @click="readDir()">
          <v-icon>mdi-folder-plus</v-icon>
        </v-btn>
        <v-btn icon @click="readFile()">
          <v-icon>mdi-file-plus</v-icon>
        </v-btn>
        <v-btn icon @click="fetch()">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="items"
        :options.sync="options"
        :server-items-length="totalCount"
        must-sort
        item-key="_id"
      >
        <template v-slot:item.name="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on"><a @click="execute(item)">{{item.name}}</a></span>
            </template>
            <span>{{item.path}}</span>
          </v-tooltip>
        </template>
        <template v-slot:item.time="{ item }">
          {{ new Date(item.time).toLocaleDateString() }}
        </template>
        <template v-slot:item.size="{ item }">
          {{ byte(item.size) }}
        </template>
        <template v-slot:item.tags="{ item }">
          <v-chip
            small
            class="ma-1"
            color="info"
            close
            v-for="tag in item.tags" :key="tag" @click:close="delTag(item, tag)"
            @click="searchTags.push(tag)"
            >{{tag}}</v-chip>
        </template>
        <template v-slot:item.rating="{ item }">
          <v-chip small :color="rating2obj(item.rating).color">
            <v-icon small>{{rating2obj(item.rating).icon}}</v-icon>
            <v-icon>{{`mdi-numeric-${item.rating}`}}</v-icon>
          </v-chip>
        </template>
        <!-- <template v-slot:item.copy="{ item }">
          <v-icon color="blue-grey">{{`mdi-numeric-${item.copy}-box-multiple`}}</v-icon>
        </template> -->
        <template v-slot:item._id="{ item }">
          <v-btn icon @click="openDialog(item)" color="primary"><v-icon>mdi-pencil</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="dialog" width="340">
      <v-card v-if="selectedItem">
        <v-card-title>
          Modify
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-combobox
            v-model="selectedItem.tags"
            :items="tags"
            multiple
            chips
            cache-items
          >
          </v-combobox>
          <v-rating
            color="primary"
            background-color="grey lighten-1"
            clearable
            v-model="selectedItem.rating"
            ></v-rating>
          <!-- <v-rating
            dense
            color="success"
            background-color="grey lighten-1"
            full-icon="mdi-account"
            empty-icon="mdi-account-outline"
            length="9"
            clearable
            v-model="selectedItem.copy"
            ></v-rating> -->
            <div class="mt-10"></div>
            <v-slider
              label="copy"
              thumb-label="always"
              max="25"
              v-model="selectedItem.copy"
              ></v-slider>
            <div class="mt-10"></div>
            <v-slider
              label="amount"
              thumb-label="always"
              max="60"
              v-model="selectedItem.amount"
              ></v-slider>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="save">save</v-btn>
          <v-btn text color="error" @click="del">delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
const { shell } = require('electron')
const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const byte = require('bytes')
const Datastore = require('nedb-promises')

export default {
  data () {
    return {
      db: Datastore.create(this.$route.query.db),
      dir: '',
      byte,
      headers: [
        // { value: '_id', text: '_id' },
        { value: 'name', text: 'name' },
        // { value: 'path', text: 'path' },
        { value: 'time', text: 'time' },
        { value: 'size', text: 'size' },
        { value: 'tags', text: 'tags' },
        { value: 'rating', text: 'rating' },
        { value: 'copy', text: 'copy' },
        { value: 'amount', text: 'amount' },
        { value: '_id', text: 'modify' }
      ],
      items: [],
      dialog: false,
      selectedItem: null,
      tags: [],
      search: '',
      searchTags: [],
      options: {
        sortBy: ['name'],
        sortDesc: [false]
      },
      totalCount: 0
    }
  },
  watch: {
    options: {
      handler () {
        this.fetch()
      },
      deep: true
    },
    search (n, o) {
      if (n === o) return
      this.fetch()
    },
    searchTags (n, o) {
      if (n === o) return
      this.fetch()
    }
  },
  mounted () {
    // console.log(this.$route.query.db)
    // this.fetch()
  },
  methods: {
    async fetch () {
      const sort = {}
      const name = this.options.sortBy[0]
      const asc = this.options.sortDesc[0] ? -1 : 1
      sort[name] = asc
      const skip = this.options.page > 0 ? (this.options.page - 1) * this.options.itemsPerPage : 0
      const find = {}
      if (this.search) find.name = { $regex: new RegExp(this.search, 'i') }
      if (this.searchTags.length) find.tags = { $in: this.searchTags }
      this.totalCount = await this.db.count(find)
      const rs = await this.db.find(find).sort(sort).skip(skip).limit(this.options.itemsPerPage)
      rs.forEach(v => {
        if (v.amount === undefined) v.amount = 0
      })
      this.items = rs
      this.addTag()
    },
    async readDir () {
      const rs = dialog.showOpenDialogSync({
        properties: ['openDirectory']
      })
      if (!rs) return
      this.dir = rs[0]
      const files = fs.readdirSync(this.dir)
      if (!files.length) return
      for (let v of files) {
        const p = path.join(this.dir, v)
        const stat = fs.statSync(p)
        const item = {
          name: v,
          path: p,
          time: stat.mtimeMs,
          size: stat.size,
          rating: 0,
          copy: 1,
          amount: 0,
          tags: []
        }
        const fr = await this.db.findOne({ path: p })
        if (fr) continue
        await this.db.insert(item)
      }
      this.fetch()
    },
    async readFile () {
      const rs = dialog.showOpenDialogSync({
        // properties: ['openDirectory']
      })
      if (!rs) return
      const p = rs[0]

      const stat = fs.statSync(p)
      const item = {
        name: path.basename(p),
        path: p,
        time: stat.mtimeMs,
        size: stat.size,
        rating: 0,
        copy: 1,
        amount: 0,
        tags: []
      }
      const fr = await this.db.findOne({ path: p })
      if (fr) return
      await this.db.insert(item)
      await this.fetch()
    },
    async execute (item) {
      if (!fs.existsSync(item.path)) {
        const r = await this.$swal.fire({
          title: item.name + '가 없습니다. 삭제하시겠습니까?',
          text: '경로: ' + item.path,
          icon: 'error',
          showCancelButton: true
        })
        if (!r.value) return
        await this.db.remove({ _id: item._id })
        await this.fetch()
        return
      }
      shell.openItem(item.path)
    },
    openDialog (item) {
      this.selectedItem = item
      this.dialog = true
    },
    addTag () {
      this.items.forEach(item => {
        const tags = item.tags
        tags.forEach(tag => {
          if (!this.tags.includes(tag)) this.tags.push(tag)
        })
      })
    },
    async delTag (item, tag) {
      await this.db.update({ _id: item._id }, { $pull: { tags: tag } })
      await this.fetch()
    },
    async del () {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      await this.db.remove({ _id: this.selectedItem._id })
      await this.fetch()
      this.dialog = false
    },
    async delAll () {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      await this.db.remove({}, { multi: true })
      await this.fetch()
    },
    async save () {
      const set = {
        tags: this.selectedItem.tags,
        rating: this.selectedItem.rating,
        copy: this.selectedItem.copy,
        amount: this.selectedItem.amount
      }
      await this.db.update({ _id: this.selectedItem._id }, { $set: set })
      this.addTag()
      this.dialog = false
    },
    rating2obj (r) {
      const item = {
        0: {
          icon: 'mdi-emoticon-dead',
          color: 'secondary'
        },
        1: {
          icon: 'mdi-emoticon-devil',
          color: 'error'
        },
        2: {
          icon: 'mdi-emoticon-sad',
          color: 'warning'
        },
        3: {
          icon: 'mdi-emoticon-neutral',
          color: 'info'
        },
        4: {
          icon: 'mdi-emoticon-happy',
          color: 'primary'
        },
        5: {
          icon: 'mdi-emoticon-cool',
          color: 'success'
        }
      }
      return item[r]
    }
  }
}
</script>
