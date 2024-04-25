import App from '@/App.vue';
import { registerPlugins } from '@core/utils/plugins';
import { createApp } from 'vue';
import VueCookies from 'vue-cookies';

//fort-awesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { faThumbsUp as farThumsUp } from '@fortawesome/free-regular-svg-icons';
import { faThumbsUp as fasThumsUp } from '@fortawesome/free-solid-svg-icons';

import { faStar as fasStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as farStar } from '@fortawesome/free-solid-svg-icons';

// Styles
import '@core/scss/template/index.scss';
import '@layouts/styles/index.scss';

// Create vue app
const app = createApp(App)

app.use(VueCookies)


app.provide("app", app)

const serverAddress = "43.201.35.20:"
//const serverAddress = "localhost:"

const userAddress = serverAddress + "8080"
const postAddress = serverAddress + "8081"
const wikiAddress = serverAddress + "8082"
const tableAddress = serverAddress + "8084"
const chatAddress = serverAddress + "8083"
const followAddress = serverAddress + "8080"

//const serverAddress = "118.36.173.120:11216"
//const serverAddress = "118.36.173.120:11216"
//const serverAddress = "minicrane.store:8080"

const defaultProfileAddress = "http://" + userAddress + "/profile/avatar-1.png"
const userProfileAddress = "http://" + userAddress + "/profile/"
const tableProfileAddress = "http://" + tableAddress + "/profile/"

app.provide('serverAddress', serverAddress)
app.provide('defaultProfileAddress', defaultProfileAddress)
app.provide('userProfileAddress', userProfileAddress)
app.provide('tableProfileAddress', tableProfileAddress)

app.provide('userAddress', userAddress)
app.provide('postAddress', postAddress)
app.provide('wikiAddress', wikiAddress)
app.provide('tableAddress', tableAddress)
app.provide('chatAddress', chatAddress)
app.provide('followAddress', followAddress)




registerPlugins(app)

library.add(faUserSecret, farThumsUp, fasThumsUp, farStar, fasStar)

app.component('font-awesome-icon', FontAwesomeIcon)

// Mount vue app
app.mount('#app')
