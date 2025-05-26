<script setup>
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'
const { locale, t } = useI18n()

const supportedLocales = [
    { code: 'id', name: t('languages.id') },
    { code: 'en', name: t('languages.en') },
    { code: 'ja', name: t('languages.ja') }
]

//untuk menyimpan preferensi
watch(locale, (newLocale) => {
    localStorage.setItem('user-locale', newLocale)

})

function changeLanguage(langCode) {
    locale.value = langCode
}
</script>

<template>
    <div class="language-switcher fixed top-4 right-4 z-50">
        <select v-modoel="locale"
                @change="changeLanguage($event.target.value)"
                class="bg-neutral-700 text-neutral-200 border border-neutral-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Select language">
        <option v-for="lang in supportedLocales"
                :key="lang.code"
                :value="lang.code">
            {{ lang.name }} ({{ lang.code.toUpperCase() }})
        </option>
        </select>
    </div>
</template>

<style scoped>
/*sttyling */
</style>