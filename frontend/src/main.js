import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import router from './router'

//import local
import idMessages from './locales/id.json'
import enMessages from './locales/en.json'
import jaMessages from './locales/ja.json'

//preferensi bahasa dari localstorage/browser
const getInitialLocale = () => {
    const savedLocale = localStorage.getItem('user-locale');
    if (savedLocale && ['id', 'en', 'ja'].includes(savedLocale)){
        return savedLocale;
    }
    const browserLang = navigator.language.split('-')[0];
    return ['id', 'en', 'ja'].includes(browserLang) ? browserLang: 'id';
}

//setup i18n
const i18n = createI18n({
    legacy:false, //vue3 composition API mode
    locale: getInitialLocale(), //bahasa default
    fallbackLocale: 'en', //bahasa tidak ditemukan
    message: {
        id: idMessages,
        en: enMessages,
        ja: jaMessages
    },
    globalInjection: true,
    warnHtmlMessage: false
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
