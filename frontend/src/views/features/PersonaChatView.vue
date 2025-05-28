<script setup>
import { ref, nextTick, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const {t} = useI18n()
const router = useRouter()

const featureName = t('dashboard.features.personaChat.name');
const currentPersona = ref('guru_bahasa_jepang');
const messageInputRef = ref(null);
const userMessage = ref('');
const chatHistory = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const chatContainer = ref(null); //scrol otomatis
const personas = ([ // dari i18n atau data statis
  { id: 'guru_bahasa_jepang', name: t('featuresPage.personaChat.personas.guruJepang'), icon: '👩‍🏫' },
  { id: 'mentor_python', name: t('featuresPage.personaChat.personas.mentorPython'), icon:  '🧑‍💻'},
  { id: 'jlpt_simulator_n5', name: t('featuresPage.personaChat.persona.jlptN5'), icon: '📝'},
  { id: 'toefl_trainer', name: t('featuresPage.personaChat.personas.toeflTrainer'), icon: '🗣️'},
]);

//scroll pesan
async function scrollToBottom() {
  await nextTick();
  if(chatContainer.value){
    chatContainer.value.scrollTop = chatContainer.value.scrollHeigh;
  }
}
//Pesan awal
function getWelcomeMessage(personaId){
  const selectedPersona = personas.value.find(p => p.id === personaId);
  const personaName = selectedPersona ? selectedPersona.name : t('featuresPage.personaChat.defaultAiName');
  return t('featuresPage.personaChat.welcomeMessage', { personaName });
}

//scroll saat chat berubah
watch(chatHistory, scrollToBottom, { deep: true });

onMounted(() => {
  //pesan awal
  chatContainer.value.push({
    id: Date.now(),
    sender: 'ai',
    text: getWelcomeMessage(currentPersona.value),
    timestamp: new Date()
  });
  if(messageInputRef.value){
    messageInputRef.value.focus();
  }
});

//RESET CHAT
watch(currentPersona, (newPersonaId) => {
  chatHistory.value = [{
    id: Date.now(),
    sender: 'ai',
    text: getWelcomeMessage(newPersonaId),
    timestamp: new Date()
  }];
  userMessage.value = '';
  errorMessage.value = '';
  if (messageInputRef.value) {
    messageInputRef.value.focus();
  }
});

async function sendMessage() {
  if (!userMessage.value.trim() || isLoading.value) return;

  const messageToText = userMessage.value;
  chatHistory.value.push({ id: Date.now(), sender: 'user', text: messageToText, timestamp: new Date() });
  userMessage.value = ''; // Kosongkan input
  isLoading.value = true;
  errorMessage.value = '';

  if(messageInputRef.value){
    messageInputRef.value.focus();
  }

  try {
    // Panggil fungsi chatWithPersona dari api.js
    const response = await api.chatWithPersona({
      persona: currentPersona.value,
      message: messageToText
    });

    // Asumsikan response.data berisi balasan dari AI
    // Misalnya: response.data = { reply: "はい、こんにちは！" }
    if (response.data && response.data.reply) {
      chatHistory.value.push({ id: Date.now(),sender: 'ai', text: response.data.reply, timestamp: new Date() });
    } else {
      // Jika format response tidak sesuai harapan
      chatHistory.value.push({ id: Date.now(), sender: 'ai', text: t('featuresPage.apiErrorGeneric'), timestamp: new Date() }); // Tambahkan terjemahan ini
    }
  } catch (error) {
    const errorDetail = error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork'); // Tambahkan terjemahan ini
    errorMessage.value = errorDetail;
  } finally {
    isLoading.value = false;
  }
}

function clearChat(){
  chatHistory.value = [{
    id: Date.now(),
    sender: 'ai',
    text: getWelcomeMessage(currentPersona.value),
    timestamp: new Date()
  }];
  userMessage.value= '';
  errorMessage.value= '';
  if(messageInputRef.value){
    messageInputRef.value.focus();
  }
}

// Fungsi untuk format timestamp
function formatTimestamp(timestamp){
  if(!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
}

</script>

<template>
  <div class="feature-page-container h-screen flex flex-col bg-neutral-850 text-neutral-100">
    <!--Header Fitur-->
    <header class="p-4 shadow-md bg-neutral-900 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center">
        <button
          @click="router.back()"
          class="mr-4 p-2 rounded-full hover:bg-neutral-700 transition-colors"
          :aria-label="t('featuresPage.backToDashboard')"><!-- Kembali ke Dashboard -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
        </button>
      <h1 class="text-xl md:text-2xl font-semibold text-sky-400 truncate max-w-[150px] sm:max-w-xs">
        {{ featureName }}
      </h1>
    </div>
    <div class="flex items-center gap-2 md:gap-3">
        <!-- Pemilihan Persona -->
        <div class="relative">
          <select
            id="persona-select"
            v-model="currentPersona"
            class="appearance-none bg-neutral-700/80 border border-neutral-600 text-neutral-100 rounded-lg py-2 pl-3 pr-8 text-xs md:text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all hover:bg-neutral-700"
            aria-label="Pilih Persona"
          >
            <option v-for="persona in personas" :key="persona.id" :value="persona.id">
              {{ persona.icon }} {{ persona.name }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <!-- Tombol Clear Chat -->
        <button
          @click="clearChat"
          :title="t('featuresPage.personaChat.clearChatTooltip')"
          class="p-2 rounded-full hover:bg-neutral-700/50 transition-colors text-neutral-400 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75L14.25 12m0 0L12 14.25m2.25-2.25L14.25 12M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Area Chat dengan TransitionGroup -->
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
            <p class="text-sm whitespace-pre-wrap break-words">{{ chat.text }}</p>
            <p v-if="chat.timestamp" class="text-xs mt-1 opacity-70" :class="chat.sender === 'user' ? 'text-sky-200 text-right' : 'text-neutral-400 text-left'">
              {{ formatTimestamp(chat.timestamp) }}
            </p>
          </div>
        </div>
      </TransitionGroup>
      <!-- Indikator Mengetik AI -->
      <div v-if="isLoading" class="flex justify-start message-item">
        <div class="message-bubble max-w-[70%] sm:max-w-[60%] p-3 rounded-xl shadow-md bg-neutral-700 text-neutral-100 rounded-bl-none flex items-center space-x-1.5">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
          <span class="text-xs italic">{{t('featuresPage.personaChat.aiTyping')}}</span>
        </div>
      </div>
    </main>


    <!-- Input Pesan -->
     <footer class="p-3 md:p-4 bg-neutral-900/95 backdrop-blur-sm sticky bottom-0 z-10 border-t border-neutral-7--/50">
      <div v-if="errorMessage" class="text-red-400 mb-2 text-xs text-center px-2 py-1 bg-red-900/30 rounded-md">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="sendMessage" class="flex items-center gap-2 md:gap-3">
        <textarea
          ref="messageInputRef"
          v-model="userMessage"
          :placeholder="t('featuresPage.personaChat.typeMessagePlaceholder', { personaName: personas.find(p => p.id === currentPersona)?.name || 'AI' })"
          class="flex-grow p-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow resize-none text-sm"
          :disabled="isLoading"
          autocomplete="off"
          rows="1"
          @keydown.enter.exact.prevent="sendMessage" 
          @input="autoGrowTextarea"
        ></textarea>
        <button
          type="submit"
          class="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
          :disabled="isLoading || !userMessage.trim()"
          :aria-label="t('featuresPage.personaChat.sendButtonLabel')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269.3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0.013.27 20.876L5 12zm0 0h7.5"/>
          </svg>
        </button>
      </form>
    </footer>
  </div>
</template>

<style scoped>
/* Styling */
.feature-page-container main::-webkit-scrollbar{
    width: 8px;
}
.feature-page-container main::-webkit-scrollbar-track{
  background: theme('colors.neutral.800');
}
.feature-page-container main::-webkit-scrollbar-thumb{
  background: theme('colors.neutral.600');
  border-radius: 4px;
}
.feature-page-container main::-webkit-scrollbar-thumb:hover {
  background: theme('colors.neutral.500');
}
/*transisi pesan */
.message-enter-active, .message-leave-active{
  transition: all 0.3 ease;
}
.message-enter-form, .message-leave-to{
  opacity: 0;
  transform: translateY(10px);
}
/* Transisi untuk pesan baru */
.message-slide-enter-active,
.message-slide-leave-active{
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1)
}
.message-slide-enter-from{
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.message-slide-leave-to{
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
.message-slide-move{
  transition: transform 0.3s ease-out;
}

/*Indikator AI */ 
.typing-indicator span {
  height: 7px;
  width: 7px;
  background-color: theme('colors.sky.400');
  border-radius: 50%;
  display: inline-block;
  animation: wave 1.3s infinite ease-in-out;
}
.typing-indicator span:nth-child(2){
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3){
  animation-delay: 0.4s;
}
@keyframes wave {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
textarea{
  overflow-y: hidden;
  min-height: 44px;
  max-height: 120px;
}

/*keyboard mobile*/
@media (max-width: 768px){
  .feature-page-container footer{
    padding-bottom: env(safe-area-inset-bottom);/*ios*/
  }
}
.bg-neutral-850{
  background-color: #222733;
}
</style>