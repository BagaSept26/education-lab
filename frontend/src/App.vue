<script setup>
import { RouterView } from 'vue-router'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
</script>

<template>
  <div class="app-container min-h-screen flex flex-col bg-neutral-900 text-neutral-100 antialiased">
    <!--HEADER-->
    <LanguageSwitcher/>
    <!--header global-->
    <!-- <TheHeader v-if="!route.meta.hideHeader"/> -->
    <!--Konten utama-->
    <main class="flex-grow w-full">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path"/>
        </Transition>
      </RouterView>
    </main>
    <!--Footer-->
  </div>
  
</template>

<style scoped>
/* styling spesifik */
.page-fade-enter-active,
.page-fade-leave-active{
  transition: opacity 0.3s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
