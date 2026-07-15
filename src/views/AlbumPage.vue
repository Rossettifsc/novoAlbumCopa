<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Álbum da Copa</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="album-header ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Progresso do Álbum</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label>Total de Figurinhas:</ion-label>
              <ion-badge color="primary">{{ totalStickers }}</ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Figurinhas Coletadas:</ion-label>
              <ion-badge color="success">{{ collectedStickersCount }}</ion-badge>
            </ion-item>
            <ion-progress-bar :value="completionPercentage / 100"></ion-progress-bar>
            <ion-text class="ion-text-center ion-margin-top">
              <p>{{ completionPercentage.toFixed(2) }}% Completo</p>
            </ion-text>
          </ion-card-content>
        </ion-card>

        <ion-segment :value="filterType" @ionChange="setFilter($event.detail.value)" class="ion-margin-top">
          <ion-segment-button value="all">
            <ion-label>Todas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="collected">
            <ion-label>Coletadas</ion-label>
          </ion-segment-button>
          <ion-segment-button value="pending">
            <ion-label>Faltantes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="favorite">
            <ion-label>Favoritas</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-searchbar
          :value="searchQuery"
          @ionInput="pesquisar($event.target.value)"
          placeholder="Buscar figurinhas..."
        ></ion-searchbar>
      </div>

      <StickerList :stickers="stickers" @view-details="openStickerDetailModal" />

      <StickerDetailModal
        :is-open="isModalOpen"
        :sticker="selectedSticker"
        @close="closeStickerDetailModal"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  IonSegment,
  IonSegmentButton,
  IonSearchbar,
} from '@ionic/vue';
import StickerList from '@/composables/StickerList.vue';
import StickerDetailModal from '@/components/StickerDetailModal.vue';
import { useAlbum } from '@/composables/useAlbum';

const { 
  stickers,
  totalStickers,
  collectedStickersCount,
  completionPercentage,
  loadStickers,
  pesquisar,
  setFilter,
  filterType,
  searchQuery
} = useAlbum();

const isModalOpen = ref(false);
const selectedSticker = ref(null);

const openStickerDetailModal = (sticker: any) => {
  selectedSticker.value = sticker;
  isModalOpen.value = true;
};

const closeStickerDetailModal = () => {
  isModalOpen.value = false;
  selectedSticker.value = null;
  loadStickers(); // Recarrega as figurinhas para refletir as mudanças no modal
};

onMounted(() => {
  loadStickers();
});
</script>

<style scoped>
.album-header {
  background: var(--ion-color-light);
  padding-bottom: 0;
}

ion-card {
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
}

ion-segment {
  margin-bottom: 10px;
}
</style>