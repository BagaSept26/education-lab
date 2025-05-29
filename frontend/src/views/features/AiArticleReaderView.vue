<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import api from '@/services/api';
const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.AiArticleReader.name');
const articleUrl =ref('');
const articleTitle=ref('');
const articleSummary=ref('');
const isLoading=ref(false);
const errorMessage=ref('');
const hasProcessed=ref(false);

function isValidHttpUrl(string){
  let url;
  try{
    url = new URL(string);
  // eslint-disable-next-line no-unused-vars
  } catch(_){
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

async function submitProcessArticle() {
  if (!articleUrl.value.trim()){
    errorMessage.value = t('featuresPage.aiArticleReader.errorNoUrl');
    return;
  }
  if (!isValidHttpUrl(articleUrl.value.trim())){
    errorMessage.value = t('featuresPage.aiArticleReader.errorInvalidUrl');
    return;
  }
  isLoading.value = true;
  errorMessage.value='';
  articleTitle.value='';
  articleSummary.value='';
  hasProcessed.value=true;

  try{
    const response = await api.processArticle({ url: articleUrl.value });

    if(response.data){
      articleTitle.value = response.data.title || t('featuresPage.aiArticleReader.titleNotAvailable');
      articleSummary.value = response.data.summary || t('featuresPage.aiArticleReader.summaryNotAvailable');
      if (!response.data.title && !response.data.summary){
        errorMessage.value = t('featuresPage.apiErrorNoData');
      }
    } else{
      errorMessage.value = t('featuresPage.apiErrorNoData');
      console.warn('Unexpected API response format for article reader:', response.data);
    }
  } catch(error){
    console.error('Error processing article:', error);
    const errorDetail = error.response?.data?.detail || error.errorMessage || t('featuresPage.apiErrorNetwork');
    errorMessage.value=`${t('featuresPage.aiArticleReader.errorProcessingFailed')}: ${errorDetail}`;
  } finally{
    isLoading.value =false;
  }
}

function clearAll(){
  articleUrl.value='';
  articleTitle.value='';
  articleSummary.value='';
  errorMessage.value='';
  isLoading.value=false;
  hasProcessed.value=false;
}

</script>

<template>
  <div class="feature-page-container flex flex-col min-h-screen bg-neutral-850 text-neutral-100">
    <!--Header fitur-->
    <header class="p-4 shadow-md bg-neutral-900 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="mr-4 p-2 rounded-full hover:bg-neutral-700 transition-colors"
          :aria-label="t('featuresPage.backToDashboard')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
          </svg>
        </button>
        <h1 class="text-xl md:text-2xl font-semibold text-sky-400">{{ featureName }}</h1>
      </div>
      <button
        v-if="articleUrl || hasProcessed"
        @click="clearAll"
        :title="t('featuresPage.aiArticleReader.clearAllTooltip')"
        class="p-2 rounded-full hover:bg-neutral-700/50 transition-colors text-neutral-400 hover:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </header>

    <!--fitur-->
    <main class="flex-grow flex flex-col items-center p-4 md:p-8">
      <div class="w-full max-w-3xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl">
        <!--input url-->
        <form 
          @submit.prevent="submitProcessArticle"
          class="space-y-4 mb-8">
          <div>
            <label for="article-url-input" class="block text-sm font-medium text-neutral-300 mb-1">
              {{ t('featuresPage.aiArticleReader.urlInputLabel') }}
            </label>
            <input 
              id="article-url-input"
              type="url"
              v-model="articleUrl"
              :placeholder="t('featuresPage.aiArticleReader.urlInputPlaceholder')"
              class="w-full p-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-sm"
              :disabled="isLoading"/>
          </div>
          <button
            type="submit"
            :disabled="isLoading || !articleUrl.trim() || !isValidHttpUrl(articleUrl.trim())"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ isLoading ? t('featuresPage.aiArticleReader.processingButton'): t('featuresPage.aiArticleReader.processingButton')}}
          </button>
        </form>

        <!--error-->
        <div v-if="errorMessage && !isLoading" class="mb-6 p-3 bg-red-700/30 border-red-700 text-red-300 rounded-md-text-sm">
          {{ errorMessage }}
        </div>
        <!--Hasil-->
        <div v-if="isLoading" class="text-cente py-10">
          <p class="text-neutral-400">
            {{ t('featuresPage.aiArticleReader.loadingMessage') }}
          </p>
        </div>
        <div v-if="!hasProcessed && !isLoading && !errorMessage" class="text-center py-10 text-neutral-500">
          {{ t('featuresPage.aiArticleReader.initialMessage') }}
        </div>
        <div v-if="hasProcessed && (articleTitle || articleSummary) && !isLoading && !errorMessage" class="space-y-6">
          <article class="prose prose-sm sm:prose-base prose-invert max-w-none prse-headings:text-sky-400 prose-a:text-sky-400 hover:prose-a:text-sky-300 prose-strong:text-neutral-100 prose-code:text-rose-400 prose-code:bg-neutral-800 prose-code:p-1 prose-code:rounded prose-blockquote:borser-sky-500 prose-blockquote:text-neutral-300">
            <h2 v-if="articleTitle" class="text-2xl font-bold !mb-3">{{ articleTitle }}</h2>
            <div v-if="typeof articleSummary === 'string'" v-html="articleSummary" class="whitespace-pre-wrap leading-relaxed"></div>
            <ul v-else-if="Array.isArray(articleSummary)" class="list-disc pl-5 space-y-1">
              <li v-for="(point, index) in articleSummary" :key="index">{{ point }}</li>
            </ul>
          </article>
        </div>

      </div>
    </main>
    <footer class="p-4 text-center text-xs text-neutral-500">
      <p v-html="t('footerText', {year:new Date().getFullYear() })"></p>
    </footer>
  </div>
</template>


<style scoped>
/* Styling spesifik jika perlu */
.bg-neutral-850{
  background-color: #1c212e;
}
</style>