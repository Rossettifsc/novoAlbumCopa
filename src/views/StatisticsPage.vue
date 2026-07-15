<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Estatísticas do Álbum</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Visão Geral</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>Total de Figurinhas Cadastradas:</ion-label>
            <ion-badge color="primary">{{ totalStickers }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Total de Figurinhas Coletadas:</ion-label>
            <ion-badge color="success">{{ collectedStickersCount }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Total de Figurinhas Faltantes:</ion-label>
            <ion-badge color="warning">{{ missingStickersCount }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Figurinhas Raras Coletadas:</ion-label>
            <ion-badge color="tertiary">{{ rareCollectedCount }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Figurinhas Brilhantes Coletadas:</ion-label>
            <ion-badge color="secondary">{{ shinyCollectedCount }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Percentual de Conclusão:</ion-label>
            <ion-badge color="dark">{{ completionPercentage }}%</ion-badge>
          </ion-item>
          <ion-progress-bar :value="completionPercentage / 100"></ion-progress-bar>
        </ion-card-content>
      </ion-card>

      <ion-card class="ion-margin-top">
        <ion-card-header>
          <ion-card-title>Ranking do Colecionador</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>Pontuação Total:</ion-label>
            <ion-badge color="primary">{{ collectorScore }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Nível Atual:</ion-label>
            <ion-badge :color="levelColor(collectorLevel)">{{ collectorLevel }}</ion-badge>
          </ion-item>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonProgressBar,
} from '@ionic/vue';
import { useAlbum } from '@/composables/useAlbum';

const { 
  totalStickers,
  collectedStickersCount,
  missingStickersCount,
  rareCollectedCount,
  shinyCollectedCount,
  completionPercentage,
  collectorScore,
  collectorLevel,
  loadStickers 
} = useAlbum();

onMounted(() => {
  loadStickers();
});

const levelColor = computed(() => (level: string) => {
  switch (level) {
    case 'Bronze': return 'brown';
    case 'Prata': return 'medium';
    case 'Ouro': return 'warning';
    case 'Diamante': return 'info';
    default: return 'primary';
  }
});
</script>

<style scoped>
ion-card {
  margin-top: 20px;
}
ion-progress-bar {
  margin-top: 10px;
}
</style>