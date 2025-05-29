import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue';
import DashboardView from '../views/DashboardView.vue'

let i18nInstance = null;

const routes= [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        titleKey: 'appName'
      }
    },
    // Routes untuk Fitur (Lazy Loaded)
    {
      path: '/feature/persona-chat',
      name: 'FeaturePersonaChat', // Sesuaikan dengan routeName di DashboardView
      component: () => import('../views/features/PersonaChatView.vue'),
      meta: {
        titleKey: 'dashboard.features.personaChat.name'
      }
    },
    {
      path: '/feature/whisper-transcriber',
      name: 'FeatureWhisperTranscriber',
      component: () => import('../views/features/WhisperTranscriberView.vue'),
      meta: {
        titleKey: 'dashboard.features.WhisperTransriber.name'
      }
    },
    {
      path: '/feature/soal-generator',
      name: 'FeatureSoalGenerator',
      component: () => import('../views/features/SoalGeneratorView.vue'),
      meta:{
        titleKey: 'dashboard.features.soalGenerator.name'
      }
    },
    {
      path: '/feature/grammar-checker',
      name: 'FeatureGrammarChecker',
      component: () => import('../views/features/GrammarCheckerView.vue'),
      meta: {
        titleKey: 'dashboard.features.grammarChecker.name'
      }
    },
    {
      path: '/feature/ai-article-reader',
      name: 'FeatureAiArticleReader',
      component: () => import('../views/features/AiArticleReaderView.vue'),
      meta:{
        titleKey: 'dashboard.features.aiArticleReader.name'
      }
    },
    {
      path: '/feature/ai-flashcard-maker',
      name: 'FeatureAiFlashcardMaker',
      component: () => import('../views/features/AiFlashcardMakerView.vue'),
      meta: {
        titleKey: 'dashboard.features.aiFlashcardMaker.name'
      }
    },
    {
      path: '/feature/mentor-python',
      name: 'FeatureMentorPython',
      component: () => import('../views/features/MentorPythonView.vue'),
      meta: {
        titleKey: 'dashboard.features.mentorPython.name'
      }
    },
    {
      path: '/feature/kamus-jepang',
      name: 'FeatureKamusJepang',
      component: () => import('../views/features/KamusJepangView.vue'),
      meta: {
        titleKey: 'dashboard.features.kamusJepang.name'
      }
    },
    {
      path: '/feature/speaking-practice',
      name: 'FeatureSpeakingPractice',
      component: () => import('../views/features/SpeakingPracticeView.vue'),
      meta: {
        titleKey: 'dashboard.features.speakingPractice.name'
      }
    },
    {
      path: '/feature/speaking-practice',
      name: 'FeatureSpeakingPractice',
      component: () => import('../views/features/SpeakingPracticeView.vue'),
      meta: {
        titleKey: 'dashboard.features.speakingPractice.name'
      }
    },
    {
      path: '/feature/ai-interview-simulator',
      name: 'FeatureAiInterviewSimulator',
      component: () => import('../views/features/AiInterviewSimulatorView.vue'),
      meta: {
        titleKey: 'dashboard.features.AiInterviewSimulator.name'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: {
        titleKey: 'notFoundPage.title'
      }// Catch-all untuk 404 (buat komponen NotFoundView.vue jika belum)
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'NotFound',
    //   component: () => import('../views/NotFoundView.vue')
    // }
    }
  ];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), routes, scrollBehavior(to, from, savedPosition){
    if (savedPosition)
      return savedPosition;
    if (to.hash)
      return { el: to.hash, behavior: 'smooth'};
    else
      return { top: 0, behavior: 'smooth'};
  }
});

//Navigation guards
router.beforeEach(async(to, from, next) => {
  if(!i18nInstance && router.app && router.app.config.globalProperties.$i18n){
    i18nInstance = router.app.config.globalProperties.$i18n;
  }
  const baseTitle = i18nInstance ? i18nInstance.t('appName') : 'Education Lab';
  let pageTitle = baseTitle;
  if (to.meta.titleKey && i18nInstance){
    await nextTick();
    try{
      const translatedTitle = i18nInstance.t(String(to.meta.titleKey));
      if(translatedTitle !== String(to.meta.titleKey)){
        pageTitle = `${translatedTitle} | ${baseTitle}`;
      } else if (to.name === 'dashboard'){
        pageTitle = baseTitle;
      }
    } catch(e){
      console.warn(`Error translating title ket: ${to.meta.titleKey}`, e);
    }
  } else if(to.name === 'dashboard'){
    pageTitle = baseTitle;
  }
  document.title = pageTitle
  next();
});
router.afterEach(()=>{
  
});

export default router;