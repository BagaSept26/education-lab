<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const { t,locale } = useI18n()
const router = useRouter()
const dashboardHeader = ref(null)
const featureCardsRefs = ref([])

const featuresConfig = [
  { id: 'personaChat', icon: '🤖', routeName: 'FeaturePersonaChat', color:'text-sky-400', hoverColor: 'hover:shadow-sky-500/40'},
  { id: 'whisperTranscriber', icon: '🎙️', routeName: 'FeatureWhisperTranscriber', color: 'text-teal-400', hoverColor: 'hover:shadow-teal-500/40' },
  { id: 'soalGenerator', icon: '📝', routeName: 'FeatureSoalGenerator', color: 'text-amber-400', hoverColor: 'hover:shadow-amber-500/40' },
  { id: 'grammarChecker', icon: '🔎', routeName: 'FeatureGrammarChecker', color: 'text-indigo-400', hoverColor: 'hover:shadow-indigo-500/40' },
  { id: 'aiArticleReader', icon: '📖', routeName: 'FeatureAiArticleReader', color: 'text-lime-400', hoverColor: 'hover:shadow-lime-500/40' },
  { id: 'aiFlashcardMaker', icon: '📇', routeName: 'FeatureAiFlashcardMaker', color: 'text-rose-400', hoverColor: 'hover:shadow-rose-500/40' },
  { id: 'mentorPython', icon: '🐍', routeName: 'FeatureMentorPython', color: 'text-emerald-400', hoverColor: 'hover:shadow-emerald-500/40' },
  { id: 'kamusJepang', icon: '辞典', routeName: 'FeatureKamusJepang', color: 'text-fuchsia-400', hoverColor: 'hover:shadow-fuchsia-500/40' },
  { id: 'speakingPractice', icon: '🗣️', routeName: 'FeatureSpeakingPractice', color: 'text-cyan-400', hoverColor: 'hover:shadow-cyan-500/40' },
  { id: 'aiInterviewSimulator', icon: '💼', routeName: 'FeatureAiInterviewSimulator', color: 'text-violet-400', hoverColor: 'hover:shadow-violet-500/40' },
]
function navigateToFeature(routeName) {
  if(routeName) {
    router.push({ name: routeName })
  } else {
    console.warn('Route name is not defined for this feature.')
  }
}

//Animasi Header
onMounted(() => {
  console.log("current locale in DashboardView:", locale.value);
  console.log("test appName translation:", t('appName'));
  console.log("Test personaChat name translation:", t('dashboard.features.personaChat.name'))
  if(dashboardHeader.value){
    gsap.from(dashboardHeader.value.querySelectorAll('h1, p'), {
      opacity: 0,
      y: 60,
      duration: 0.8,
      stagger: 0.25,
      ease: 'expo.out',
      delay: 0.2
    })
  }
  //animasi untuk card
  featureCardsRefs.value.forEach((card, index) => {
    if (card) {
      gsap.from(card, {
        opacity: 0,
        y:70,
        scale: 0.95,
        duration: 0.5,
        ease: 'circ.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          end: 'bottom 70%',
          toggleActions: 'play none none none',
        },
        delay: (index * 0.05) + 0.5
      })
    }
  })
})
</script>

<template>
  <div class="dashboard-container flex flex-col items-center min-h-screen p-4 md:p-8 selection:bg-sky-500 selection:text-white overflow-x-hidden">
    <!--ref header-->
    <header ref="dashboardHeader" class="text-center mb-12 md:mb-20 mt-16 md:mt-24">
      <h1 class="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 leading-tight">
        {{  t('appName') }}
      </h1>
      <p class="text-xl md:text-2xl text-neutral-400 mt-4 max-w-2xl mx-auto">
        {{ t('appSlogan') }}
      </p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 w-full max-w-7xl">
      <div v-for="(feature, index) in featuresConfig"
            :key="feature.id"
            :ref="(el) => { if (el) featureCardsRefs[index] = el }"
            class="feature-cardRef bg-neutral-800/70 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-sky-500/30 transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer group"
            :class="[feature.hoverColor]"
            @click="navigateToFeature(feature.routeName)"
            role="button"
            tabindex="0"
            @keypress.enter="navigateToFeature(feature.routeName)">
        <div class="text-5xl mb-5 transition-transform duration-300 group-hover:scale-110">{{ feature.icon }}</div>
        <!--Menggunakan path dari dashboard.features-->
        <h2 class="text-2xl font-bold text-sky-300 mb-2 group-hover:text-sky-200 transition-colors duration-300"
            :class="feature.color">
          {{ t(`dashboard.features.${feature.id}.name`) }}</h2>
          <p class="text-neutral-300 text-sm group-hover:text-neutral-200 transition-colors duration-300">
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
  background-image: radial-gradient(circle at top left, theme('colors.sky.900/30'), transparent 40%), radial-gradient(circle at bottom right, theme('colors.blue.900/30'), transparent 40%);
}
.feature-card {
  background: rgba(41,56,78,0.7);
  backdrop-filter: blur(10px);
  border: 1px solid theme('colors.neutral.700/50');
}
.feature-card:hover{
  border-color: theme('colors.sky.500/70');
}
.feature-card{
  opacity: 0;
}
</style>
