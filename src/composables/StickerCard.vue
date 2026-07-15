<template>
  <ion-card @click="handleCardClick" :class="{ 'sticker-collected': sticker.collected }">
    <ion-card-content class="sticker-card-content">
      <img :src="sticker.photo" :alt="sticker.nome" class="sticker-image" />
      <div class="sticker-info">
        <ion-text>
          <h3>{{ sticker.nome }}</h3>
        </ion-text>
        <ion-text>
          <p>{{ sticker.team }}</p>
        </ion-text>
        <div class="badges-container">
          <ion-badge :color="sticker.collected ? 'success' : 'medium'">
            {{ sticker.collected ? 'Coletada' : 'Pendente' }}
          </ion-badge>
          <ion-badge :color="getRarityColor(sticker.raridade)">
            {{ sticker.raridade || 'comum' }}
          </ion-badge>
          <ion-icon
            v-if="sticker.favorite"
            :icon="star"
            color="warning"
            class="favorite-icon"
          ></ion-icon>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonText, IonBadge, IonIcon } from '@ionic/vue';
import { star } from 'ionicons/icons';

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

const props = defineProps<{
  sticker: Sticker
}>();

const emit = defineEmits<{
  'view-details': [sticker: Sticker]
}>();

const getRarityColor = (rarity?: string) => {
  if (!rarity) return 'medium';

  switch (rarity.toLowerCase()) {
    case 'rara': return 'warning';
    case 'brilhante': return 'secondary';
    default: return 'medium';
  }
};

const handleCardClick = () => {
  emit('view-details', props.sticker);
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
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.sticker-info {
  padding: 12px;
  text-align: center;
  width: 100%;
  position: relative; /* Para posicionar o ícone de favorito */
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
  align-items: center;
}

.favorite-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 1.5em;
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