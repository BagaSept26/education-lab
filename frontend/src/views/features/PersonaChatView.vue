<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const {t} = useI18n()
const router = useRouter()

const featureName = t('dashboard.features.personaChat.name');
const currentPersona = ref('Guru Bahasa Jepang');

const userMessage = ref('');
const chatHistory = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

const personas = [ // dari i18n atau data statis
  { id: 'guru_bahasa_jepang', name: 'Guru Bahasa Jepang' },
  { id: 'mentor_python', name: 'Mentor Python' },
  { id: 'jlpt_simulator_n5', name: 'Simulasi JLPT N5' },
];

async function sendMessage() {
  if (!userMessage.value.trim()) return;

  const messageToSend = userMessage.value;
  chatHistory.value.push({ sender: 'user', text: messageToSend });
  userMessage.value = ''; // Kosongkan input
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Panggil fungsi chatWithPersona dari api.js
    const response = await api.chatWithPersona({
      persona: currentPersona.value,
      message: messageToSend
    });

    // Asumsikan response.data berisi balasan dari AI
    // Misalnya: response.data = { reply: "はい、こんにちは！" }
    if (response.data && response.data.reply) {
      chatHistory.value.push({ sender: 'ai', text: response.data.reply });
    } else {
      // Jika format response tidak sesuai harapan
      chatHistory.value.push({ sender: 'ai', text: t('featuresPage.apiErrorGeneric') }); // Tambahkan terjemahan ini
      console.warn('Unexpected API response format:', response.data);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    errorMessage.value = error.response?.data?.detail || error.message || t('featuresPage.apiErrorNetwork'); // Tambahkan terjemahan ini
    chatHistory.value.push({ sender: 'ai', text: `${t('featuresPage.apiError')}: ${errorMessage.value}` });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="feature-page-container min-h-screen flex flex-col items-center p-4 md:p-8">
    <button
      @click="router.back()"
      class="absolute top-6 left-6 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors duration-200 text-sm z-10"
    >
      ← {{ t('dashboard.title') }} <!-- Kembali ke Dashboard -->
    </button>

    <h1 class="text-4xl md:text-5xl font-bold my-8 text-sky-400 text-center">
      {{ featureName }}
    </h1>

    <!-- Pemilihan Persona -->
    <div class="mb-6 w-full max-w-md">
      <label for="persona-select" class="block text-sm font-medium text-neutral-300 mb-1">Pilih Persona:</label>
      <select
        id="persona-select"
        v-model="currentPersona"
        class="w-full p-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg focus:ring-sky-500 focus:border-sky-500"
      >
        <option v-for="persona in personas" :key="persona.id" :value="persona.id">
          {{ persona.name }}
        </option>
      </select>
    </div>

    <!-- Area Chat -->
    <div class="chat-area w-full max-w-2xl h-[60vh] bg-neutral-800 rounded-lg shadow-xl p-4 overflow-y-auto mb-4 flex flex-col space-y-3">
      <div v-if="!chatHistory.length" class="flex-grow flex items-center justify-center text-neutral-500">
        Mulai percakapan...
      </div>
      <div
        v-for="(chat, index) in chatHistory"
        :key="index"
        class="message-bubble p-3 rounded-lg max-w-[80%]"
        :class="{
          'bg-sky-600 text-white self-end': chat.sender === 'user',
          'bg-neutral-700 text-neutral-100 self-start': chat.sender === 'ai'
        }"
      >
        {{ chat.text }}
      </div>
       <div v-if="isLoading" class="self-start">
        <span class="text-neutral-400 text-sm">AI sedang mengetik...</span>
      </div>
    </div>

    <!-- Input Pesan -->
    <form @submit.prevent="sendMessage" class="w-full max-w-2xl flex gap-3">
      <input
        type="text"
        v-model="userMessage"
        :placeholder="`Ketik pesan untuk ${currentPersona}...`"
        class="flex-grow p-3 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded-lg focus:ring-sky-500 focus:border-sky-500"
        :disabled="isLoading"
      />
      <button
        type="submit"
        class="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        :disabled="isLoading || !userMessage.trim()"
      >
        {{ isLoading ? 'Mengirim...' : 'Kirim' }}
      </button>
    </form>
    <p v-if="errorMessage" class="text-red-400 mt-2 text-sm">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
/* Styling */
.feature-page-container {
    padding-top: 5rem;
}
/*.chat-area {
 
}*/
.message-bubble {
    word-wrap: break-word;
}
</style>