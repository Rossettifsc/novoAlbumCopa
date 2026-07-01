<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="collapse">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>
      <ContatoList />
    </ion-content>
  </ion-page>
</template>
 
<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from
'@ionic/vue';
import ContatoList from '@/components/ContatList.vue'; 
</script>