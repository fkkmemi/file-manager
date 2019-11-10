import Vue from 'vue'
import Swal from 'sweetalert2'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

Vue.prototype.$swal = Swal
// console.log(process.env)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
