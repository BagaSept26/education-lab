<script setup>
import { ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';
const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.SpeakingPractice.name');
const isLoading = ref(true);
const errorMessage=ref('');
const userTranscript=ref('');
const aiResponseText=ref('');

const isRecording=ref(false);
const mediaRecorder=ref(null);
const audioChunks=ref([]);
const streamObj=ref(null);

async function startRecording() {
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    try{
      streamObj.value=await navigator.mediaDevices.getUserMedia({ audio: true});
      mediaRecorder.value=new MediaRecorder(streamObj.value);
      audioChunks.value=[];
      mediaRecorder.value.ondataavailable=(event)=>{
        audioChunks.value.push(event.data);
      };

      mediaRecorder.value.onstop=async()=>{
        const audioBlob=new Blob(audioChunks.value, {type: 'audio/webm'});

        await sendAudioToBackend(audioBlob);
        if(streamObj.value){
          streamObj.value.getTracks().forEach(track=>track.stop());
          streamObj.value=null;
        }
      };
      mediaRecorder.value.start();
      isRecording.value=true;
      userTranscript.value='';
      aiResponseText.value='';
      errorMessage.value='';
    } catch(err){
      console.error("Error accessing microphone:", err);
      errorMessage.value=t('featuresPage.speakingPractice.errorMicAccess',{error: err.message});
      isRecording.value=false;
    }
  } else{
    errorMessage.value= t('featuresPage.speakingPractice.errorNoMediaSupport');
  }
}

function stopRecording(){
  if(mediaRecorder.value && mediaRecorder.value.state === "recording"){
    mediaRecorder.value.stop();
    isRecording.value=false;
  }
}

async function sendAudioToBackend(audioBlob) {
  FormData.append('audio_file', audioBlob, 'user_speaking_audio.webm');
  try{
    const response = await api.submitSpeakingPracticw(FormData);
    if(response.data){
      userTranscript.value=response.data.user_transcript || t('featuresPage.speakingPractice.errorNoTranscript');
      aiResponseText.value=response.data.ai_reply_text || t('featuresPage.speakingPractice.errorNoAiReply');
    } else{
      errorMessage.value=t('featuresPage.apiErrorNoData');
    }
  } catch(error){
    console.error('Error in speaking practice submission:', error);
    const errorDetail=error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value=`${t('featuresPage,speakingPractice.errorApiFailed')}: ${errorDetail}`;
  } finally{
    isLoading.value=false;
  }
}

onUnmounted(()=>{
  if(streamObj.value){
    streamObj.value.getTracks().forEach(track=> track.stop());
  }
  if(mediaRecorder.value && mediaRecorder.value.state === "recording"){
    mediaRecorder.value.stop();
  }
});

function clearAll(){
  isLoading.value=false;
  errorMessage.value='';
  userTranscript.value='';
  aiResponseText.value='';
  isRecording.value=false;
  if(mediaRecorder.value && mediaRecorder.value.state === "recording"){
    mediaRecorder.value.stop();
  } else if (streamObj.value){
    streamObj.value.getTracks().forEach(track=> track.stop());
    streamObj.value=null;
  }
  audioChunks.value=[];
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
          v-if="userTranscript || aiResponseText || isRecording"
          @click="clearAll"
          :title="t('featuresPage.speakingPractice.clearAllTooltip')"
          class="p-2 rounded-full hover:bg-neutral-700/50 transition-colors text-neutral-400 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
             <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
    </header>

    <!-- Konten Utama Fitur -->
    <main class="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
      <div class="w-full max-w-xl bg-neutral-900 p-6 md:p-8 rounded-xl shadow-2xl space-y-6">
        
        <!-- Tombol Rekam -->
        <div class="flex flex-col items-center space-y-4">
          <button
            @click="isRecording ? stopRecording() : startRecording()"
            :disabled="isLoading"
            class="px-8 py-4 rounded-full text-white font-semibold transition-all duration-200 ease-in-out
                   disabled:opacity-70 disabled:cursor-wait"
            :class="isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse-red' : 'bg-sky-600 hover:bg-sky-700'"
          >
            <div class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path v-if="!isRecording" stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5h0_M6.375 12.375a6 6 0 0111.25 0c0 2.993-1.906 5.51-4.5 6.334M12 3.75V1.5m0 14.25V18m0-14.25H6.375m5.625 0H17.625m0 0L21 12m-3.375 0L12 3.75" />
                    <rect v-if="isRecording" x="10" y="9" width="4" height="10" rx="1" fill="currentColor" />
                    <path v-if="isRecording" d="M6.75 12a5.25 5.25 0 0110.5 0v1.5a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5v-1.5z" fill="currentColor" />
                </svg>
                <span>{{ isRecording ? t('featuresPage.speakingPractice.stopRecordingButton') : t('featuresPage.speakingPractice.startRecordingButton') }}</span>
            </div>
          </button>
          <p v-if="isRecording" class="text-sm text-neutral-400">{{ t('featuresPage.speakingPractice.recordingInProgress') }}</p>
           <p v-if="!isRecording && !isLoading && !userTranscript && !aiResponseText && !errorMessage" class="text-sm text-neutral-500 pt-2">
            {{ t('featuresPage.speakingPractice.initialMessage') }}
          </p>
        </div>

        <!-- Indikator Loading Global -->
         <div v-if="isLoading" class="flex justify-center items-center py-4">
            <svg class="animate-spin h-8 w-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="ml-3 text-neutral-400">{{ t('featuresPage.speakingPractice.processingAudio') }}</p>
        </div>


        <!-- Pesan Error -->
        <div v-if="errorMessage && !isLoading" class="mt-4 p-3 bg-red-700/30 border border-red-700 text-red-300 rounded-md text-sm">
          {{ errorMessage }}
        </div>

        <!-- Hasil Percakapan -->
        <div v-if="!isLoading && (userTranscript || aiResponseText)" class="mt-6 space-y-4">
          <!-- Ucapan Pengguna -->
          <div v-if="userTranscript" class="p-4 bg-neutral-800 rounded-lg shadow">
            <h3 class="text-sm font-semibold text-sky-400 mb-1">{{ t('featuresPage.speakingPractice.yourSpeechTitle') }}</h3>
            <p class="text-neutral-200 italic">"{{ userTranscript }}"</p>
          </div>

          <!-- Balasan AI -->
          <div v-if="aiResponseText" class="p-4 bg-neutral-700 rounded-lg shadow">
            <h3 class="text-sm font-semibold text-emerald-400 mb-1">{{ t('featuresPage.speakingPractice.aiResponseTitle') }}</h3>
            <p class="text-neutral-100">{{ aiResponseText }}</p>
            <!-- <audio v-if="aiResponseAudioUrl" :src="aiResponseAudioUrl" controls class="mt-2 w-full"></audio> -->
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
@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);}
}
.animate-pulse-red{
  animation: pulse-red 1.5s infinite;
}
</style>