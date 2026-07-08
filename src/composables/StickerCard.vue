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
        <div class="badges-container">
          <ion-badge :color="sticker.collected ? 'success' : 'medium'">
            {{ sticker.collected ? 'Coletada' : 'Pendente' }}
          </ion-badge>
          <ion-badge :color="getRarityColor(sticker.raridade)">
            {{ sticker.raridade }}
          </ion-badge>
        </div>
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

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'rara': return 'warning';
    case 'brilhante': return 'secondary';
    default: return 'medium';
  }
};

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

.badges-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;
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
