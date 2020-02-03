<template>
  <v-container fluid>
    <v-card>
      {{msg}}
    </v-card>
  </v-container>
</template>
<script>
const mysql = require('mysql2/promise')

export default {
  data () {
    return {
      conn: null
    }
  },
  async mounted () {
    const connection = await mysql.createConnection({ host: '192.168.0.28', user: 'root', password: 'raspberry', database: 'test' })
    // query database
    const [rows, fields] = await connection.execute('SELECT * FROM ttt')
    console.log(rows)
    console.log(fields)
  }
}
</script>
