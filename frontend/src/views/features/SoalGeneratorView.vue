<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import { errorMessages } from 'vue/compiler-sfc';
const { t } = useI18n();
const router = useRouter();

// Pastikan path i18n ini ('dashboard.features.grammarChecker.name') ada di file locale Anda
const featureName = t('dashboard.features.SoalGenerator.name');
const inputTextMateri = ref('');
const generatedSoal = ref([]);
const isLoading = ref(false);
const errorMessage=ref('');
const jumlahSoal = ref(3);
const tipeSoal = ref('pilihan_ganda');

async function submitGenerateSoal() {
  if(!inputTextMateri.value.trim()){
    errorMessages.value = t('featuresPage.soalGenerator.errorNoMaterial');
    return;
  }
  if(inputTextMateri.value.trim().length < 50){
    errorMessages.value=t('featuresPage.soalGenerator.errorMaterialTooShort');
    return;
  }
  isLoading.value = true;
  errorMessages.value = '';
  generatedSoal.value = [];

  try{
    const response = await api.generateSoal({
      materi: inputTextMateri.value,
      jumlah: jumlahSoal.value,
      tipe: tipeSoal.value
    });

    if(response.data && Array.isArray(response.data.soal_dihasilkan)){
      generatedSoal.value = response.data.soal_dihasilkan;
      if (generatedSoal.value.length === 0){
        errorMessages.value = t('featuresPage.soalGenerator.errorNoSoalGenerated');
      }
    } else{
      generatedSoal.value=[];
      errorMessages.value=t('featuresPage.apiErrorNoData');
      console.warn('Unexcepted API response format for soal generator:',response.data);
    }
  }
  catch (error){
    console.error('Error generating soal:', error);
    const errorDetail = error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value=`${t('features.page.soalGenerator.errorGenerationFailed')}: ${errorDetail}`;
    generatedSoal.value=[];
  } finally{
    isLoading.value=false;
  }
}
function getPilihanLabel(index){
  return String.fromCharCode(97+index);
}

</script>

<template>
  <div class="feature-page-container flex flex-col min-h-screen bg-neutral-850 text-neutral-100">
    <!--Header fitur-->
    <header class="p-4 shadow-md bg-neutral-900 flex item-center justify-between sticky top-0 z-20">
      <div class="flex items-center">
        <button 
          @click="router.back()"
          class="mr-4 p-2 rounded-full hover:bg-neutral-700 transition-colors"
          :aria-label="t('featuresPage.backToDashboard')">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
          </svg>
        </button>
        <h1 class="text-xl md:text-2xl font-semibold text-sky-400">
          {{ featureName }}
        </h1>
      </div>
    </header>
    <!--Konten utama fitur-->
    <main class="flex-grow flex flex-col items-center p-4 md:p-8">
      <div class="w-full max-w-3xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl space-y-6">
        <!--Input Materi-->
        <div>
          <label for="materi-input" class="block text-sm font-medium text-neutral-300 mb-1">
            {{ t('featuresPage.soalGenerator.materialInputLabel') }}
          </label>
            <p class="text-xs text-neutral-400 mb-2">{{ t('featuresPage.soalGenerator.materialInputHint') }}</p>
            <textarea
              id="meteri-input"
              v-model="inputTextMateri"
              rows="8"
              class="w-full p-3 bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-sm"
              :placeholder="t('featurePage.soalGenerator.materialInputPlaceholder')">
            </textarea>
        </div>
        <!--Opsi Generate-->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="jumlah-soal" class="block text-sm font-medium text-neutral-300 mb-1">
              {{ t('featuresPage.soalGenerator.numberOfQuestionsLabel') }}
            </label>
            <select id="jumlah-soal" v-model.number="jumlahSoal" class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:ring-sky-500 focus:border-sky-500">
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
          <div>
            <label for="tipe-soal" class="block text-sm font-medium text-neutral-300 mb-1">
              {{ t('featuresPage.soalGenerator.questionTypeLabel') }}
            </label>
            <select id="tipe-soal" v-model="tipeSoal" class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:ring-sky-500 focus:border-sky-500">
              <option value="pilihan_ganda">
                {{ t('featuresPage.soalGenerator.questionTypeMultipleChoice') }}
              </option>
            </select>
          </div>
        </div>
        <!--Tombol Generate-->
        <button
          @click="submitGenerateSoal"
          :disabled="isLoading || !inputTextMateri.trim()"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
        <!--Pesan Error-->
        <div v-if="errorMessage && !isLoading" class="mt-3 p-3 bg-red-700/30 border border-red-700 text-red-300 rounded-md text-sm">
          {{ errorMessage }}
        </div>
        <!--Hasil-->
      <div v-if="generatedSoal.length > 0 && !isLoading" class="mt-8 space-y-6">
          <h2 class="text-2xl font-semibold text-sky-300 mb-4">{{ t('featuresPage.soalGenerator.generatedQuestionsTitle') }}</h2>
          <div v-for="(item, index) in generatedSoal" :key="index" class="bg-neutral-800 p-4 rounded-lg shadow">
            <p class="font-semibold mb-2 text-neutral-100">{{ index + 1 }}. {{ item.soal }}</p>
            <ul class="space-y-1 list-inside list-none pl-2 mb-3">
              <li v-for="(pilihanTeks, pilihanKey, idxPilihan) in item.pilihan" :key="pilihanKey" 
                  class="text-sm text-neutral-300"
                  :class="{ 'text-emerald-400 font-bold': pilihanKey === item.kunci }"> <!-- Tandai jawaban benar -->
                {{ getPilihanLabel(idxPilihan) }}. {{ pilihanTeks }}
              </li>
            </ul>
            <p class="text-xs text-sky-400/80">
              {{ t('featuresPage.soalGenerator.answerKeyLabel') }}: <span class="font-bold uppercase">{{ item.kunci }}</span>
            </p>
            <p v-if="item.penjelasan" class="text-xs text-neutral-400 mt-1">
              <span class="font-medium">{{ t('featuresPage.soalGenerator.explanationLabel') }}:</span> {{ item.penjelasan }}
            </p>
          </div>
        </div>
        <div v-if="!generatedSoal.length && !isLoading && !errorMessage && inputTextMateri" class="text-center text-neutral-500 py-4">
            {{ t('featuresPage.soalGenerator.noQuestionsYet') }}
        </div>

      </div>
    </main>
    <footer class="p-4 text-center tet-xs text-neutral-500">
      <p v-html="t('footerText', {year: new Date().getFullYear()})"></p>
    </footer>
  </div>
</template>


<style scoped>
/* Styling spesifik jika perlu */
.bg-neutral-850{
  background-color: #1c212e;
}
</style>