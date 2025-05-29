<script setup>
import { ref,nextTick, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const { t } = useI18n();
const router = useRouter();

const featureName = t('dashboard.features.AiInterviewSimulator.name');
const interviewTypes = ref([
  {id: 'ssw_japan', name: t('featuresPage.aiInterviewSimulator.types.sswJapan'), icon: '🇯🇵'},
  {id: 'it_developer', name: t('featuresPage.aiInterviewSimulator.types.itDeveloper'), icon: '💻'},
  {id: 'general_behavioral', name: t('featuresPage.aiInterviewSimulator.types.generalBehavioral'), icon: '👥'},
]);
const currentInterviewType=ref(interviewTypes.value[0].id);
const userMessage=ref('');
const chatHistory=ref([]);
const isLoading=ref(false);
const errorMessage=ref('');
const chatContainerRef=(null);
const messageInputRef=ref(null);
const interviewEnded=ref(false);

async function scrollToBottom() {
  await nextTick();
  if (chatContainerRef.value){
    chatContainerRef.value.scrollTop=chatContainerRef.value.scrorllHeight;
  }
}

function getInitialMessage(typeId){
  const selectedType = interviewTypes.value.find(p=>p.id === typeId);
  const typeName = selectedType ? selectedType.name: t('featuresPage.aiInterviewSimulator.defaultInterviewName');
  return t('featuresPage.aiInterviewSimulator.welcomeMessage',{ interviewType:typeName})
}

async function startInterview(typeId) {
  isLoading.value=true;
  errorMessage.value='';
  interviewEnded.value=false;
  chatHistory.value=[{
    id: Date.now(),
    sender: 'ai',
    text: getInitialMessage(typeId),
    timestamp: new Date()
  }];

  try{
    const response = await api.chatWithPersona({
      persona: `interviewer_${typeId}`,
      message: 'INTERVIEW_START_PLEASE'
    });

    if(response.data && response.data.reply){
      chatHistory.value.push({id: Date.now()+1, sender: 'ai', text: response.data.reply, timestamp: new Date()});
    } else{
      errorMessage.value = t('featuresPage.apiErrorGeneric');
    }
  } catch (error){
    const errorDetail = error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value=errorDetail;
  } finally{
    isLoading.value=false;
    if(messageInputRef.value){
      messageInputRef.value.focus();
    }
  }
}

onMounted(()=>{
  startInterview(currentInterviewType.value);
});
watch(chatHistory, scrollToBottom, {deep:true});

watch(currentInterviewType, (newTypeId)=>{
  startInterview(newTypeId);
  userMessage.value='';
});

async function sendMessage() {
  if(!userMessage.value.trim() || isLoading.value || interviewEnded.value)
  return;

  const messageText=userMessage.value;
  chatHistory.value.push({id:Date.now(), sender: 'user', text: messageText, timestamp: new Date() });
  userMessage.value='';
  isLoading.value=true;
  errorMessage.value='';

  if(messageInputRef.value){
    messageInputRef.value.focus();
  }
  try{
    const response = await api.chatWithPersona({
      persona: `interviewer_${currentInterviewType.value}`,
      message: messageText
    });

    if(response.data && response.data.reply){
      chatHistory.value.push({ id: Date.now()+1, sender: 'ai', text: response.data.reply, timestamp: new Date()});
      if (response.data.interview_ended === true){
        interviewEnded.value=true;
        chatHistory.value.push({
          id: Date.now()+2,
          sender: 'ai',
          text: t('featuresPage.aiInterviewSimulator.interviewEndedMessage'), timestamp: new Date()
        });
      }
    } else {
      chatHistory.value.push({id: Date.now()+1, sender: 'ai', text: t('featuresPage.apiErrorGeneric'), timestamp: new Date()});
    }
  } catch (error){
    const errorDetail=error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork');
    errorMessage.value = errorDetail;
  } finally{
    isLoading.value=false;
  }
}

function restartInterview(){
  startInterview(currentInterviewType.value);
}
function formatTimestamp(timestamp){
  if(!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

function autoGrowTextarea(event){
  const textarea=event.target;
  textarea.style.height='auto';
  const newHeight = Math.min(textarea.scrorllHeight, 120);
  textarea.style.height = `${newHeight}px`;
}

</script>

<template>
  <div class="feature-page-container flex flex-col h-screen bg-neutral-850 text-neutral-100">
    <!-- Header Fitur -->
    <header class="p-3 md:p-4 shadow-md bg-neutral-900 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="mr-2 md:mr-4 p-2 rounded-full hover:bg-neutral-700/50 transition-colors"
          :aria-label="t('featuresPage.backToDashboard')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 class="text-lg md:text-xl font-semibold text-sky-400 truncate max-w-[150px] sm:max-w-xs">
          {{ featureName }}
        </h1>
      </div>
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Pemilihan Tipe Wawancara -->
        <div class="relative">
          <select
            id="interview-type-select"
            v-model="currentInterviewType"
            :disabled="isLoading && chatHistory.length > 1 && !interviewEnded" 
            class="appearance-none bg-neutral-700/80 border border-neutral-600 text-neutral-100 rounded-lg py-2 pl-3 pr-8 text-xs md:text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Pilih Tipe Wawancara"
          >
            <option v-for="itvType in interviewTypes" :key="itvType.id" :value="itvType.id">
              {{ itvType.icon }} {{ itvType.name }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <button
          @click="restartInterview"
          :title="t('featuresPage.aiInterviewSimulator.restartTooltip')"
          class="p-2 rounded-full hover:bg-neutral-700/50 transition-colors text-neutral-400 hover:text-sky-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Area Chat (Sama seperti PersonaChatView) -->
    <main ref="chatContainerRef" class="flex-grow overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-neutral-850">
      <TransitionGroup name="message-slide" tag="div">
        <div
          v-for="chat in chatHistory"
          :key="chat.id"
          class="flex message-item"
          :class="{ 'justify-end': chat.sender === 'user', 'justify-start': chat.sender === 'ai' }"
        >
          <div
            class="message-bubble max-w-[80%] sm:max-w-[70%] p-3 rounded-xl shadow-md"
            :class="{
              'bg-sky-600 text-white rounded-br-none': chat.sender === 'user',
              'bg-neutral-700 text-neutral-100 rounded-bl-none': chat.sender === 'ai'
            }"
          >
            <div class="text-sm whitespace-pre-wrap break-words" v-html="chat.text"></div>
            <p v-if="chat.timestamp" class="text-xs mt-1 opacity-70" :class="chat.sender === 'user' ? 'text-sky-200 text-right' : 'text-neutral-400 text-left'">
              {{ formatTimestamp(chat.timestamp) }}
            </p>
          </div>
        </div>
      </TransitionGroup>
      <div v-if="isLoading && !interviewEnded" class="flex justify-start message-item">
        <div class="message-bubble max-w-[70%] sm:max-w-[60%] p-3 rounded-xl shadow-md bg-neutral-700 text-neutral-100 rounded-bl-none flex items-center space-x-1.5">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <span class="text-xs italic">{{t('featuresPage.aiInterviewSimulator.aiTyping')}}</span>
        </div>
      </div>
    </main>

    <!-- Input Pesan (Sama seperti PersonaChatView) -->
    <footer class="p-3 md:p-4 bg-neutral-900/95 backdrop-blur-sm sticky bottom-0 z-10 border-t border-neutral-700/50">
      <div v-if="errorMessage" class="text-red-400 mb-2 text-xs text-center px-2 py-1 bg-red-900/30 rounded-md">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="sendMessage" class="flex items-end gap-2 md:gap-3">
        <textarea
          ref="messageInputRef"
          v-model="userMessage"
          :placeholder="interviewEnded ? t('featuresPage.aiInterviewSimulator.interviewEndedPlaceholder') : t('featuresPage.aiInterviewSimulator.typeAnswerPlaceholder')"
          class="flex-grow p-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow resize-none text-sm"
          :disabled="isLoading || interviewEnded"
          autocomplete="off"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage" 
          @input="autoGrowTextarea"
        ></textarea>
        <button
          type="submit"
          class="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
          :disabled="isLoading || !userMessage.trim() || interviewEnded"
          :aria-label="t('featuresPage.aiInterviewSimulator.sendButtonLabel')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </footer>
  </div>
</template>

<style scoped>
/* Styling spesifik jika perlu */
</style>