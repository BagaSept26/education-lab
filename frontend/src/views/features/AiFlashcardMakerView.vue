<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import api from '@services/api';

const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.aiFlashcardMaker.name');
const inputTextMateri = ref('');
const isLoading = ref(false);
const flashcards = ref([]);
const errorMessage = ref('');
const currentCardIndex=ref(0);
const currentCard = computed(()=>{
  return flashcards.value.length > 0 ? flashcards.value[currentCardIndex.value]: null;
});

async function submitCreateFlashcards() {
  if(!inputTextMateri.value.trim()) {
    errorMessage.value=t('featuresPage.aiFlashcardMaker.errorNoMaterial');
    return;
  }
  if(!inputTextMateri.value.trim().length < 30){
    errorMessage.value=t('featuresPage.aiFlashcardMaker.errorMaterialTooShort');
    return;
  }

  isLoading.value=true;
  errorMessage.value='';
  flashcards.value=[];
  currentCardIndex.value=0;

  try{
    const response = await api.submitCreateFlashCard({
      materi: inputTextMateri.value,
    });
    if(response.data && Array.isArray(response.data.flashcards_dihasilkan)){
      flashcards.value=response.data.flashcards_dihasilkan_dihasilkan.map((card, index) =>({
        ...card,
        id: index,
        isFlipped: false
      }));
      if(flashcards.value.length === 0){
        errorMessage.value=t('featuresPage.aiFlashcardMaker.errorNoFlashcardsGenerated');
      }
    } else{
      errorMessage.value=t('featuresPage.apiErrorNoData');
      console.warn('Unexpected API reponse format for flashcard maker:', response.data);
    }
  } catch(error){
    console.error('Error creating flashcards:', error);
    const errorDetail=error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value=`${t('featuresPage.aiFlashcardMaker.errorCreationFailed')}: ${errorDetail}`;
  } finally{
    isLoading.value=false;
  }
}
function flipCard(card){
  if(card){
    card.isFlipped = !card.isFlipped;
  }
}

function nextCard(){
  if(currentCardIndex.value < flashcards.value.length -1){
    if(currentCard.value) currentCard.value.isFlipped=false;
    currentCardIndex.value++;
  }
}

function prevCard(){
  if(currentCardIndex.value > 0){
    if(currentCard.value) currentCard.value.isFlipped=false;
    currentCardIndex.value--;
  }
}
function clearAll(){
  inputTextMateri.value='';
  flashcards.value=[];
  currentCardIndex.value=0;
  errorMessage.value='';
  isLoading.value=false;
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
          v-if="flashcards.length > 0 || inputTextMateri"
          @click="clearAll"
          :title="t('featuresPage.aiFlashcardMaker.clearAllTooltip')"
          class="p-2 rounded-full hover:bg-neutral-700/50 transition-colors text-neutral-400 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
    </header>

    <!-- Konten Utama Fitur -->
    <main class="flex-grow flex flex-col items-center p-4 md:p-8">
      <div class="w-full max-w-xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl">
        
        <!-- Input Materi -->
        <div v-if="flashcards.length === 0" class="space-y-6">
          <div>
            <label for="materi-flashcard-input" class="block text-sm font-medium text-neutral-300 mb-1">
              {{ t('featuresPage.aiFlashcardMaker.materialInputLabel') }}
            </label>
            <p class="text-xs text-neutral-400 mb-2">{{ t('featuresPage.aiFlashcardMaker.materialInputHint') }}</p>
            <textarea
              id="materi-flashcard-input"
              v-model="inputTextMateri"
              rows="10"
              class="w-full p-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-sm"
              :placeholder="t('featuresPage.aiFlashcardMaker.materialInputPlaceholder')"
            ></textarea>
          </div>

          <!-- Tombol Generate -->
          <button
            @click="submitCreateFlashcards"
            :disabled="isLoading || !inputTextMateri.trim()"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? t('featuresPage.aiFlashcardMaker.creatingButton') : t('featuresPage.aiFlashcardMaker.createButton') }}
          </button>

          <!-- Pesan Error -->
          <div v-if="errorMessage && !isLoading" class="mt-3 p-3 bg-red-700/30 border border-red-700 text-red-300 rounded-md text-sm">
            {{ errorMessage }}
          </div>
        </div>
        
        <!-- Tampilan Flashcard -->
        <div v-if="flashcards.length > 0 && !isLoading" class="space-y-6">
          <div class="text-center mb-2">
            <p class="text-sm text-neutral-400">
              {{ t('featuresPage.aiFlashcardMaker.cardCounter', { current: currentCardIndex + 1, total: flashcards.length }) }}
            </p>
          </div>
          <!-- Flashcard Area -->
          <div 
            class="flashcard-container aspect-[3/2] w-full max-w-md mx-auto perspective"
            @click="flipCard(currentCard)"
            role="button"
            tabindex="0"
            @keypress.enter="flipCard(currentCard)"
          >
            <div 
                class="flashcard relative w-full h-full rounded-xl shadow-xl cursor-pointer transition-transform duration-700 preserve-3d"
                :class="{ 'is-flipped': currentCard?.isFlipped }"
            >
              <div class="flashcard-face flashcard-front absolute w-full h-full bg-sky-500 text-white p-6 rounded-xl flex items-center justify-center text-center backface-hidden">
                <p class="text-lg md:text-xl">{{ currentCard?.front }}</p>
              </div>
              <div class="flashcard-face flashcard-back absolute w-full h-full bg-emerald-500 text-white p-6 rounded-xl flex items-center justify-center text-center backface-hidden transform-rotate-y-180">
                <p class="text-md md:text-lg">{{ currentCard?.back }}</p>
              </div>
            </div>
          </div>

          <!-- Navigasi Flashcard -->
          <div class="flex justify-between items-center mt-6">
            <button 
              @click="prevCard" 
              :disabled="currentCardIndex === 0"
              class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('featuresPage.aiFlashcardMaker.prevButton') }}
            </button>
            <button 
              @click="nextCard" 
              :disabled="currentCardIndex === flashcards.length - 1"
              class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ t('featuresPage.aiFlashcardMaker.nextButton') }}
            </button>
          </div>
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
.perspective{
  perspective: 1000px;
}
.preserve-3d{
  transform-style: preserve-3d;
}
.backface-hidden{
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* safari*/
}
.transform-rotate-y-180{
  transform: rotateY(180deg);
}
.flashcard.is-flipped{
  transform: rotateY(180deg);
}
.flashcard-face{
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
}
</style>