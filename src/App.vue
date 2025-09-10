<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="app-page">
        <AccountForm />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import AccountForm from './components/AccountForm.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app-page {
  padding: 0;
  min-height: 100vh;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Quasar overrides */
.q-layout {
  background: transparent;
}

.q-page-container {
  background: transparent;
}
</style> 