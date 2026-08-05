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
          <ion-item>
            <ion-label>Próximo Nível:</ion-label>
            <ion-badge color="medium">{{ collectorNextLevel }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Pontos para o próximo nível:</ion-label>
            <ion-badge color="dark">{{ collectorPointsToNextLevel }}</ion-badge>
          </ion-item>
          <ion-progress-bar :value="collectorProgressToNextLevel / 100"></ion-progress-bar>
        </ion-card-content>
      </ion-card>

      <ion-card class="ion-margin-top">
        <ion-card-header>
          <ion-card-title>10 Últimas Coletas</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list v-if="lastCollectedStickers.length > 0">
            <ion-item v-for="sticker in lastCollectedStickers" :key="sticker.id">
              <ion-label>
                <h3>{{ sticker.nome }}</h3>
                <p>{{ sticker.team }}</p>
                <p>{{ formatDate(sticker.collected_at) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          <ion-text v-else>
            <p>Nenhuma figurinha coletada ainda.</p>
          </ion-text>
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
  IonList,
  IonText,
  onIonViewWillEnter
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
  collectorNextLevel,
  collectorPointsToNextLevel,
  collectorProgressToNextLevel,
  loadStickers,
  lastCollectedStickers
} = useAlbum();

onMounted(() => {
  loadStickers();
});

onIonViewWillEnter(() => {
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

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
};
</script>

<style scoped>
ion-card {
  margin-top: 20px;
}
ion-progress-bar {
  margin-top: 10px;
}
</style>
