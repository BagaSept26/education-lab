<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.whisperTranscriber.name');
const selectedFile = ref(null);
const transcription = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const fileName = ref(''); //menampilkan file

function handleFileChange(event){
  const file = event.target.files[0];
  if (file){
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/wave', 'audio/x-wav'];
    if (!allowedTypes.includes(file.type)){
      errorMessage.value = t('featuresPage.whisperTranscriber.errorInvalidType');
      selectedFile.value='';
      return;
    }
    const maxSizeInMB = 25;
    if (file.size > maxSizeInMB * 1024 *1024){
      errorMessage.value = t('featuresPage.whisperTranscriber.errorFileSizeTooLarge', {maxSize: maxSizeInMB});
      selectedFile.value='';
      return;
    }

    selectedFile.value = file;
    fileName.value=''; //hapus error
    transcription.value=''; //hapus transkripsi sebelumnya
  } else {
    selectedFile.value = null;
    fileName.value = '';
  }
}

async function submitTranscription(){
  if (!selectedFile.value){
    errorMessage.value = t('featuresPage.whisperTranscriber.errorNoFileSelected');
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  transcription.value = '';

  const formData = new FormData();
  formData.append('audio_file', selectedFile.value);
  try{
    const response = await api.transcribeAudio(formData); //API
    if (response.data && response.data.transcription !== undefined){
      transcription.value=response.data.transcription;
    } else{
      transcription.value=t('featuresPage.apiErrorNoData');
      console.warn('Unexpected API response format for transcription:', response.data);
    }
  }
    catch (error){
      console.error('Error transcribing audio:', error);
      const errorDetail=error.response?.data?.detail || error.message || t('featuresPage.apiErrorNerwork');
      errorMessage.value = `${t('featuresPage.whisperTranscriber.errorTranscriptionFailed')}:${errorDetail}`;
    } finally{
      isLoading.value=false;
    }
  }

function copyToClipboard(){
  if(transcription.value){
    navigator.clipboard.writeText(transcription.value)
    .then(()=>{
      alert(t('featuresPage.whisperTranscriber.textCopied'));
    })
    .catch(err=>{
      console.error('Failed to copy text: ', err);
      alert(t('faturesPage.whisperTranscriber.copyFailed'));
    });
  }
}
</script>

<template>
  <div class="feature-page-container flex flex-col min-h-screen bg-neutral-850 text-neutral-100">
    <!--Header Fitur-->
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
        <h1 class="text-xl md:text-2xl font-semibold text-sky-400">
          {{ featureName }}
        </h1>
      </div>

    </header>

    <!--Fitur utama-->
    <main class="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
      <div class="w-full max-w-2xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl space-y-6">
        <!--Input File-->
        <div>
          <label for="audio-upload" class="block text-sm font-medium text-neutral-300 mb-2">
            {{ t('featurePage.whisperTranscriber.uploadLabel') }} (MP3, WAV - Max 25MB)
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-600 border-dashed rounded-md hover:border-sky-500 transition-colors">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-neutral-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="flex text-sm text-neutral-400">
                <label for="audio-file-input" class="relative cursor-pointer bg-neutral-800 rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-neutral-900 focus-within:ring-sky-500 px-1">
                  <span>{{ t('featuresPage.whisperTranscriber.selectFileButton') }}</span>
                  <input id="audio-file-input" name="audio-file-input" type="file" class="sr-only" @change="handleFileChange" accept="audio/mpeg,audio/wav,audio/mp3,audio/wave,audio/x-wav">
                </label>
                <p class="pl-1">{{ t('featuresPage.whisperTranscriber.dragandDrop') }}</p>
              </div>
              <p v-if="fileName" class="text-xs text-neutral-300 mt-1">{{ t('featuresPage.whisperTranscriber.selectedFileName') }}: {{ fileName }}</p>
            </div>
          </div>
        </div>

        <!--Tombol Transkripsi-->
        <button
          @click="submitTranscription"
          :disabled="isLoading || !selectedFile"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          {{ isLoading? t('featuresPage.whisperTranscriber.transcribingButton'): t('feaeturesPage.whisperTranscriber.transcribeButton') }}
        </button>

        <!--Pesan Error-->
        <div v-if="errorMessage" class="mt-3 p-3 bg-red-700/30 border border-red-700 text-red-300 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!--Hasil transkripsi-->
        <div v-if="transcription" class="mt-6">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-semibold text-neutral-200">
              {{ t('featuresPage.whisperTranscriber.transcriptionResultTitle') }}
            </h3>
            <button
              @click="copyToClipboard"
              class="p-2 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-sky-400 transition-colors"
              :title="t('featuresPage.whisperTranscriber.copyButtonTooltip')">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="2-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125V17.25m0 0A2.25 2.25 0 0013.5 18c1.243 0 2.25-.94 2.25-2.125V11.25c0-.621-.504-1.125-1.125-1.125H9.375"/>
              </svg>
            </button>
          </div>
          <div class="p4 bg-neutral-800 rounded-md shadow text-neutral-200 whitespace-pre-wrap text-sm leading-relaxed">
            {{ transcription }}
          </div>
        </div>
      </div>
    </main>
    <footer class="p-4 text-center text-xs text-neutral-500">
      <p v-html="t('footerText', {year: new Date().getFullYear()})"></p>
    </footer>
  </div>
</template>


<style scoped>
/* Styling spesifik jika perlu */
.bg-neutral-850{
  background-color: #222733;
}
input[type="file"]:focus+label,
input[type="file"]:focus-visible+label{
  outline:2px solid theme('colors.sky.500');
  outline-offset: 2px;
}
</style>