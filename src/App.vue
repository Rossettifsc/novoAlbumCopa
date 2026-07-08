<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initDatabase } from '@/services/database';
import { IonApp, IonRouterOutlet } from '@ionic/vue';

onMounted(async () => {
  try {
    await initDatabase();
    console.log("Banco de dados pronto!");
  } catch (e) {
    console.warn("Aviso: SQLite não disponível no navegador. Use o modo mobile ou configure o driver web.", e);
  }
});
</script>
