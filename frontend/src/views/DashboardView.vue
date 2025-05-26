<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const features = [
  { id: 'persona-chat', icon: '🤖', routeName: 'FeaturePersonaChat' },
  { id: 'whisper-transcriber', icon: '🎙️', routeName: 'FeatureWhisperTranscriber' },
  { id: 'soal-generator', icon: '📝', routeName: 'FeatureSoalGenerator' },
  { id: 'grammar-checker', icon: '🔎', routeName: 'FeatureGrammarChecker' },
  { id: 'ai-article-reader', icon: '📖', routeName: 'FeatureAiArticleReader' },
  { id: 'ai-flashcard-maker', icon: '📇', routeName: 'FeatureAiFlashcardMaker' },
  { id: 'mentor-python', icon: '🐍', routeName: 'FeatureMentorPython' },
  { id: 'kamus-jepang', icon: '辞典', routeName: 'FeatureKamusJepang' }, //辞典 (jiten) = dictionary
  { id: 'speaking-practice', icon: '🗣️', routeName: 'FeatureSpeakingPractice' },
  { id: 'ai-interview-simulator', icon: '💼', routeName: 'FeatureAiInterviewSimulator' },
]
function navigateToFeature(routeName) {
  if(routeName) {
    router.push({ name: routeName })
  } else {
    console.warn('Route name is not defined for this feature.')
  }
}
</script>

<template>
  <div class="dashboard-container flex flex-col items-center justify-center min-h-screen p-4 md:p-8 selection:text-white">
    <header class="text-center mb-12 md:mb-20">
      <h1 class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 leading-tight">
        {{  t('appName') }}
      </h1>
      <p class="text-xl md:text-2xl text-neutral-400 mt-4 max-w-2xl mx-auto">
        {{ t('appSlogan') }}
      </p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
      <div v-for="feature in features"
            :key="feature.id"
            class="feature-card bg-neutral-800/70 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer group"
            @click="navigateToFeature(feature.routeName)">
        <div class="text-5xl mb-5 transition-transform duration-300 group-hover:scale-110">{{ feature.icon }}</div>
        <h2 class="text-2xl font-semibold text-sky-400 mb-2">{{ feature.name }}</h2>
        <!--Menggunakan path dari dashboard.features-->
        <h2 class="text-2xl font-bold text-sky-300 mb-2 group-hover:text-sky-200 transition-colors duration-300">
          {{ t(`dashboard.features.${feature.id}.name`) }}</h2>
          <p class="text-neutral-300 text-sm">
            {{ t(`dashboard.features.${feature.id}.description`) }}
          </p>
      </div>
    </div>

    <footer class="mt-20 text-center text-neutral-500 text-sm">
      <!--HTML dalam terjemahan-->
      <p v-html="t('footerText', { year: new Date().getFullYear()})"></p>
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
  slate: -700px;
}
</style>
