<script setup>
import { RouterView } from 'vue-router'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!--HEADER-->
    <LanguageSwitcher/>
    <main class="flex-grow">
      <RouterView/>
    </main>
    <!--Footer-->
  </div>
  
</template>

<style scoped>
/* styling spesifik */
</style>
