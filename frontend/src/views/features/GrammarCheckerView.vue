<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.grammarChecker.name');
const inputText = ref('');
const selectedLanguage = ref('en'); //def bahsa inggris
const processedTextSegments = ref([]);
const isLoading=false;
const errorMessage=ref('');
const hasChecked = ref(false);

const supportedLanguages = computed(() =>[
  { code: 'en', name: t('featuresPage.grammarChecker.langEnglish') },
  { code: 'ja', name: t('featuresPage.grammarChecker.langJapanese') }
]);

async function submitCheckGrammar() {
  if(!inputText.value.trim()){
    errorMessage.value=t('featuresPage.grammarChecker.errorNoText');
    return;
  }
  isLoading.value=true;
  errorMessage.value='';
  processedTextSegments.value='';
  hasChecked.value=true;

  try{
    const response = await api.checkGrammar({
      text: inputText.value,
      language: selectedLanguage.value
    });
    if(response.data && Array.isArray(response.data.segments)){
      processedTextSegments.value=response.data.segments;
      if(processedTextSegments.value.length === 0 && inputText.value.trim()){
        processedTextSegments.value = [{ text: inputText.value, isError: false }];
      }
    }
    else if(response.data && response.data.error){
      errorMessage.value = response.data.error;
    }
    else{
      errorMessage.value=t('featuresPage.apiErrorNoData');
      console.warn('Unexcepted API respnse format for grammar checker:', response.data);
    }
  }
  catch(error){
    console.error("error checking grammar: ", error);
    const errorDetail = error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value = `${t('faeturesPage.grammarChecker.errorCheckFailed')}: ${errorDetail}`;
  } finally{
    isLoading.value=false;
  }
}

function clearAll(){
  inputText.value='';
  selectedLanguage.value=[];
  errorMessage.value='';
  isLoading.value=false;
  hasChecked.value=false;
}

</script>

<template>
  <div class="feature-page-container flex flex-col min-h-screen bg-neutral-850 text-neutral-100">
    <!-- Header Fitur -->
    <header class="p-4 shadow-md bg-neutral-900 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="mr-4 p-2 rounded-full hover:bg-neutral-700 transition-colors"
          :aria-label="t('featuresPage.backToDashboard')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 class="text-xl md:text-2xl font-semibold text-sky-400">
          {{ featureName }}
        </h1>
      </div>
      <button
          v-if="inputText || hasChecked"
          @click="clearAll"
          :title="t('featuresPage.grammarChecker.clearAllTooltip')"
          class="p-2 rounded-full hover:bg-neutral-700/50 transition-colors text-neutral-400 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
    </header>

    <!-- Konten Utama Fitur -->
    <main class="flex-grow flex flex-col items-center p-4 md:p-8">
      <div class="w-full max-w-3xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl">
        
        <!-- Input Teks dan Pilihan Bahasa -->
        <div class="space-y-4 mb-6">
          <div>
            <label for="grammar-text-input" class="block text-sm font-medium text-neutral-300 mb-1">
              {{ t('featuresPage.grammarChecker.textInputLabel') }}
            </label>
            <textarea
              id="grammar-text-input"
              v-model="inputText"
              rows="8"
              class="w-full p-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-sm"
              :placeholder="t('featuresPage.grammarChecker.textInputPlaceholder')"
            ></textarea>
          </div>
          <div>
            <label for="language-select" class="block text-sm font-medium text-neutral-300 mb-1">
              {{ t('featuresPage.grammarChecker.languageSelectLabel') }}
            </label>
            <select 
              id="language-select" 
              v-model="selectedLanguage"
              class="w-full p-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-sm"
            >
              <option v-for="lang in supportedLanguages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tombol Cek -->
        <button
          @click="submitCheckGrammar"
          :disabled="isLoading || !inputText.trim()"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? t('featuresPage.grammarChecker.checkingButton') : t('featuresPage.grammarChecker.checkButton') }}
        </button>

        <!-- Pesan Error -->
        <div v-if="errorMessage && !isLoading" class="mt-6 p-3 bg-red-700/30 border border-red-700 text-red-300 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!-- Hasil Pengecekan Tata Bahasa -->
        <div v-if="isLoading && hasChecked" class="text-center py-10 mt-6">
          <p class="text-neutral-400">{{ t('featuresPage.grammarChecker.loadingMessage') }}</p>
        </div>
        
        <div v-if="!hasChecked && !isLoading && !errorMessage" class="text-center py-10 mt-6 text-neutral-500">
            {{ t('featuresPage.grammarChecker.initialMessage') }}
        </div>

        <div v-if="hasChecked && processedTextSegments.length > 0 && !isLoading && !errorMessage" class="mt-8 p-4 bg-neutral-800 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-sky-300 mb-3">{{ t('featuresPage.grammarChecker.resultTitle') }}</h3>
          <p class="text-neutral-100 whitespace-pre-wrap leading-relaxed text-sm">
            <span v-for="(segment, index) in processedTextSegments" :key="index">
              <span 
                v-if="segment.isError" 
                class="bg-red-500/30 px-1 rounded group relative cursor-pointer"
                :title="segment.suggestion ? `${t('featuresPage.grammarChecker.suggestionTooltip')}: ${segment.suggestion}` : ''"
              >
                <span class="underline decoration-red-500 decoration-wavy">{{ segment.text }}</span>
                <span v-if="segment.suggestion" 
                      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block 
                             px-2 py-1 bg-neutral-950 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-10 border border-neutral-700">
                  {{ segment.suggestion }}
                </span>
              </span>
              <span v-else>{{ segment.text }}</span>
            </span>
          </p>
          <p v-if="processedTextSegments.every(s => !s.isError) && inputText.trim()" class="text-sm text-emerald-400 mt-3">
            {{ t('featuresPage.grammarChecker.noErrorsFound') }}
          </p>
        </div>
      </div>
    </main>
     <footer class="p-4 text-center text-xs text-neutral-500">
        <p v-html="t('footerText', { year: new Date().getFullYear() })"></p>
    </footer>
  </div>
</template>

<style scoped>
/* Styling spesifik jika perlu */
.bg-neutral-850{
  background-color: #1c212e;
}
.group:hover .group-hover\:block{
  display: block;
}
</style>