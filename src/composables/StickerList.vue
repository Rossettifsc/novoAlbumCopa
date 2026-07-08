<template>
  <div>
    <ion-grid>
      <ion-row>
        <ion-col size="12" size-md="6" size-lg="4" v-for="sticker in stickers" :key="sticker.id">
          <StickerCard :sticker="sticker" @toggle-collect="$emit('toggle-collect', sticker.id)" />
        </ion-col>
      </ion-row>
    </ion-grid>
    <div v-if="stickers.length === 0" class="ion-text-center ion-padding">
      <ion-text>
        <p>Nenhuma figurinha encontrada</p>
      </ion-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonGrid, IonRow, IonCol, IonText } from '@ionic/vue';
import { Sticker } from '../data/stickers';
import StickerCard from './StickerCard.vue';

defineProps<{
  stickers: Sticker[]
}>();

defineEmits<{
  'toggle-collect': [id: number]
}>();
</script>
