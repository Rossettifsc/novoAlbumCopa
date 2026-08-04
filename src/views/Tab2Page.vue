<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Coleção</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <p class="ion-padding">A coleção está disponível na aba correspondente do aplicativo.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>