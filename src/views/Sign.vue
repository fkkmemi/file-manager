<template>
  <v-container fluid>
    <v-row align="center" justify="center">
      <v-card width="400">
        <v-card-title>Connect to database</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field v-model="form.name" label="DB name" :rules="rules"></v-text-field>
            <v-text-field v-model="form.password" label="password" type="password" @keypress.enter="signIn" :rules="rules"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="signIn">signIn</v-btn>
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>
<script>
const Datastore = require('nedb-promises')
const Database = Datastore.create('databases.db')

export default {
  data () {
    return {
      valid: false,
      form: {
        name: '',
        password: ''
      },
      rules: [
        v => !!v || 'text is required',
        v => (v && v.length <= 10) || 'text must be less than 10 characters',
        v => (v && v.length >= 2) || 'text must be less than 2 characters'
      ]
    }
  },
  methods: {
    async signIn () {
      if (!this.$refs.form.validate()) return this.$swal.fire('form is not validate')
      if (this.form.password === process.env.VUE_APP_PASSWORD) return this.$router.push({ name: 'main', query: { db: this.form.name } })
      const r = await Database.findOne({ name: this.form.name })
      if (!r) {
        await Database.insert(this.form)
        return this.$router.push({ name: 'main', query: { db: this.form.name } })
      }
      if (r.password !== this.form.password) return this.$swal.fire('password error')
      this.$router.push({ name: 'main', query: { db: this.form.name } })
    }
  }
}
</script>
