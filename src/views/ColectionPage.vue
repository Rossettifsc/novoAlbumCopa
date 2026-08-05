<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Minha Coleção</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card class="ion-margin">
        <ion-card-content>
          <ion-text>
            <h3>Figurinhas Coletadas</h3>
            <p>Você tem <strong>{{ collectedStickersCount }}</strong> figurinha(s) de um total de {{ totalStickers }}.</p>
          </ion-text>
          <ion-progress-bar :value="completionPercentage / 100" color="success"></ion-progress-bar>
        </ion-card-content>
      </ion-card>

      <div class="ion-padding" v-if="collectedStickers.length === 0">
        <ion-card>
          <ion-card-content class="ion-text-center">
            <p>Sua coleção está vazia.</p>
            <p>Vá para o Álbum e comece a colecionar!</p>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Correção: Passando collectedStickers para a lista -->
      <StickerList :stickers="collectedStickers" @view-details="openStickerDetailModal" />

      <StickerDetailModal
        :is-open="isModalOpen"
        :sticker="selectedSticker"
        @close="closeStickerDetailModal"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonText,
  IonProgressBar,
  onIonViewWillEnter
} from '@ionic/vue';
import StickerList from '@/composables/StickerList.vue';
import StickerDetailModal from '@/components/StickerDetailModal.vue';
import { useAlbum } from '@/composables/useAlbum';

// Desestruturação limpa
const { 
  totalStickers,
  collectedStickersCount, 
  completionPercentage,
  loadStickers,
  marcarColetada
} = useAlbum();

const isModalOpen = ref(false);
const selectedSticker = ref<any | null>(null);

const collectedStickers = computed(() => {
  return stickers.value.filter(s => s.collected === 1);
});

const openStickerDetailModal = (sticker: any) => {
  selectedSticker.value = sticker;
  isModalOpen.value = true;
};

const closeStickerDetailModal = () => {
  isModalOpen.value = false;
  selectedSticker.value = null;
  // Correção: Forçar o carregamento das figurinhas (passando 'all' e string vazia para limpar a busca)
  loadStickers('all', '');
};

// Correção: Ao entrar na aba, sempre resetar o estado de busca e forçar o carregamento completo
onIonViewWillEnter(() => {
  loadStickers('all', '');
});

// Importação do sticker globalmente no script para a computed property funcionar
const { stickers } = useAlbum();
</script>