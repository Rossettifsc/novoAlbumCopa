<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Minhas Favoritas</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="ion-padding" v-if="favoriteStickers.length === 0">
        <ion-card>
          <ion-card-content class="ion-text-center">
            <ion-icon :icon="starOutline" size="large" color="medium"></ion-icon>
            <p>Você ainda não tem figurinhas favoritas.</p>
            <p>Clique em uma figurinha no álbum para favoritá-la!</p>
          </ion-card-content>
        </ion-card>
      </div>

      <StickerList :stickers="favoriteStickers" @view-details="openStickerDetailModal" />

      <StickerDetailModal
        :is-open="isModalOpen"
        :sticker="selectedSticker"
        @close="closeStickerDetailModal"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon
} from '@ionic/vue';
import { starOutline } from 'ionicons/icons';
import StickerList from '@/composables/StickerList.vue';
import StickerDetailModal from '@/components/StickerDetailModal.vue';
import { useAlbum } from '@/composables/useAlbum';

const { stickers, loadStickers } = useAlbum();

const isModalOpen = ref(false);
const selectedSticker = ref<any | null>(null);

const favoriteStickers = computed(() => {
  return stickers.value.filter(s => s.favorite === 1);
});

const openStickerDetailModal = (sticker: any) => {
  selectedSticker.value = sticker;
  isModalOpen.value = true;
};

const closeStickerDetailModal = () => {
  isModalOpen.value = false;
  selectedSticker.value = null;
  loadStickers();
};

onMounted(() => {
  loadStickers();
});
</script>

<style scoped>
ion-card {
  margin-top: 20px;
}
</style>
