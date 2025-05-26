// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    // Routes untuk Fitur (Lazy Loaded)
    {
      path: '/feature/persona-chat',
      name: 'FeaturePersonaChat', // Sesuaikan dengan routeName di DashboardView
      component: () => import('../views/features/PersonaChatView.vue')
    },
    {
      path: '/feature/whisper-transcriber',
      name: 'FeatureWhisperTranscriber',
      component: () => import('../views/features/WhisperTranscriberView.vue')
    },
    {
      path: '/feature/soal-generator',
      name: 'FeatureSoalGenerator',
      component: () => import('../views/features/SoalGeneratorView.vue')
    },
    {
      path: '/feature/grammar-checker',
      name: 'FeatureGrammarChecker',
      component: () => import('../views/features/GrammarCheckerView.vue') // Buat file ini
    },
    {
      path: '/feature/ai-article-reader',
      name: 'FeatureAiArticleReader',
      component: () => import('../views/features/AiArticleReaderView.vue') // Buat file ini
    },
    {
      path: '/feature/ai-flashcard-maker',
      name: 'FeatureAiFlashcardMaker',
      component: () => import('../views/features/AiFlashcardMakerView.vue') // Buat file ini
    },
    {
      path: '/feature/mentor-python',
      name: 'FeatureMentorPython',
      component: () => import('../views/features/MentorPythonView.vue') // Buat file ini
    },
    {
      path: '/feature/kamus-jepang',
      name: 'FeatureKamusJepang',
      component: () => import('../views/features/KamusJepangView.vue') // Buat file ini
    },
    {
      path: '/feature/speaking-practice',
      name: 'FeatureSpeakingPractice',
      component: () => import('../views/features/SpeakingPracticeView.vue') // Buat file ini
    },
    {
      path: '/feature/ai-interview-simulator',
      name: 'FeatureAiInterviewSimulator',
      component: () => import('../views/features/AiInterviewSimulatorView.vue') // Buat file ini
    },
    // Catch-all untuk 404 (buat komponen NotFoundView.vue jika belum)
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: () => import('../views/NotFoundView.vue')
    // }
  ]
})

export default router