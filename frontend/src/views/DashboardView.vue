<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const features = [
  {
    id: 'persona-chat',
    name: 'PersonaChat',
    desciption: 'Ngobrol dengan AI persona.',
    icon: '🤖'
  },
  {
    id: 'whisper-transcriber',
    name: 'Transkripsi Audio',
    desciption: 'ubah audio jadi teks',
    icon: '🎙️'
  },
  {
    id: 'soal-generator',
    name: 'Generator Soal',
    desciption: 'Buat soal otomatis',
    icon: '📝'
  },
  //fitur
]
function navigateToFeature(featureId) {
  console.log(`Navigasi ke fitur: ${featureId}`)
  router.push({ path: `/feature/${featureId}`});
}
</script>

<template>
  <div class="dashboard-container flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
    <header class="text-center mb-12 md:mb-16">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-4">
        Education Lab
      </h1>
      <p class="text-xl md:text-2xl text-neutral-400">
        Laboratorium Edukasi Berbasis AI.
      </p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
      <div v-for="feature in features"
            :key="feature.id"
            class="feature-card bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition=all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer"
            @click="navigateToFeature(feature.id)">
        <div class="text-4xl mb-4">{{ feature.icon }}</div>
        <h2 class="text-2xl font-semibold text-sky-400 mb-2">{{ feature.name }}</h2>
        <p class="text-neutral-300 text-sm">{{ feature.description }}</p>
      </div>
    </div>

    <footer class="mt-16 text-center text-neutral-500">
      <p>{{ new Date().getFullYear() }} Education Lab. Eksperimen</p>

    </footer>
  </div>
</template>

<style scoped>
.dashboard-container{
  background: radial-gradient(circle, rgba(30,41,59,1) 0%, rgba(17,24,39,1) 100%);
}
.feature-card {
  background: rgba(41,56,78,0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
