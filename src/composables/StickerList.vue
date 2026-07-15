<template>
  <ion-grid>
    <ion-row>
      <ion-col size="6" size-md="4" size-lg="3" v-for="sticker in stickers" :key="sticker.id">
        <StickerCard :sticker="sticker" @view-details="$emit('view-details', sticker)" />
      </ion-col>
    </ion-row>
    <ion-row v-if="stickers.length === 0">
      <ion-col class="ion-text-center ion-padding">
        <ion-text color="medium">
          <p>Nenhuma figurinha encontrada.</p>
        </ion-text>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonText } from '@ionic/vue';
import StickerCard from './StickerCard.vue';

interface Sticker {
  id: number;
  nome: string;
  team: string;
  photo: string;
  raridade?: string;
  collected: number;
  favorite: number;
  collected_at?: string;
}

defineProps<{
  stickers: Sticker[]
}>();

defineEmits<{
  'view-details': [sticker: Sticker]
}>();
</script>

<style scoped>
ion-col {
  display: flex;
}
</style>