<template>
  <ion-card @click="handleToggle" :class="{ 'sticker-collected': sticker.collected }">
    <ion-card-content class="sticker-card-content">
      <img :src="sticker.photo" :alt="sticker.name" class="sticker-image" />
      <div class="sticker-info">
        <ion-text>
          <h3>{{ sticker.name }}</h3>
        </ion-text>
        <ion-text>
          <p>{{ sticker.team }}</p>
        </ion-text>
        <ion-badge v-if="sticker.collected" color="success">Coletada</ion-badge>
        <ion-badge v-else color="warning">Pendente</ion-badge>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonText, IonBadge } from '@ionic/vue';
import { Sticker } from '../data/stickers';

defineProps<{
  sticker: Sticker
}>();

const emit = defineEmits<{
  'toggle-collect': []
}>();

const handleToggle = () => {
  emit('toggle-collect');
};
</script>

<style scoped>
.sticker-card-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sticker-image {
  width: 25%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.sticker-info {
  padding: 12px;
  text-align: center;
  width: 100%;
}

.sticker-info h3 {
  margin: 8px 0 4px 0;
  font-size: 14px;
}

.sticker-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

ion-card {
  cursor: pointer;
  transition: transform 0.2s;
}

ion-card:active {
  transform: scale(0.98);
}

.sticker-collected {
  opacity: 0.7;
}
</style>