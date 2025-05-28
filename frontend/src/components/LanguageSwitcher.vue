<script setup>
import { useI18n } from 'vue-i18n'
import { watch, computed } from 'vue'
const { locale, t, availableLocales } = useI18n()

const supportedLocalesMetadata = [
    { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Indonesia' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: '日本語', nativeName: '日本語' }
]

//NativeName
const languageOptions = computed(()=>{
    return supportedLocalesMetadata.map(lang => ({
        code: lang.code,
        displayName: t(`languages.${lang.code}`)
    }));
});


//untuk menyimpan preferensi
watch(locale, (newLocale) => {
    localStorage.setItem('user-locale', newLocale)

})
//fungsi ganti bahasa
function changeLanguage(newLocaleCode) {
    if(availableLocales.includes(newLocaleCode)){
        locale.value = newLocaleCode; //split
    } else{
    console.warn(`Locale ${newLocaleCode} is not available`)
    }
}
</script>

<template>
    <div class="language-switcher fixed top-4 right-4 z-50 group">
        <div class="relative">
        <select v-modoel="locale"
                @change="changeLanguage($event.target.value)"
                class="appearance-none bg-neutral-800/70 backdrop-blur-md text-neutral-200 border border-neutral-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 ease-in-out hover:bg-neutral-700/80 cursor-pointer"
                aria-label="Select language">
            <option v-for="lang in languageOptions"
                :key="lang.code"
                :value="lang.code">
                {{ lang.displayName }})
            </option>
        </select>
        <div class="pointer-events-none absolute insert-y-0 right-0 flex items-center px-2 text-neutral-400 group-hover:text-sky-400 transition-colors">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
        </div>
        </div>
    </div>
</template>

<style scoped>
/*sttyling */
.language-switcher select:hover{
    border-color: theme('colors.sky.600');
}
</style>