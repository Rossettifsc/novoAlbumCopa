<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalhes da Figurinha</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Fechar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" v-if="sticker">
      <ion-card>
        <img :src="sticker.photo" :alt="sticker.nome" />
        <ion-card-header>
          <ion-card-title>{{ sticker.nome }}</ion-card-title>
          <ion-card-subtitle>{{ sticker.team }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-item>
            <ion-label>Raridade:</ion-label>
            <ion-badge :color="rarityColor(sticker.raridade)">{{ sticker.raridade }}</ion-badge>
          </ion-item>
          <ion-item>
            <ion-label>Coletada:</ion-label>
            <ion-icon
              :icon="sticker.collected ? checkmarkCircle : closeCircle"
              :color="sticker.collected ? 'success' : 'danger'"
            ></ion-icon>
          </ion-item>
          <ion-item v-if="sticker.collected_at">
            <ion-label>Data de Coleta:</ion-label>
            <ion-text>{{ formatDate(sticker.collected_at) }}</ion-text>
          </ion-item>

          <ion-button expand="block" :color="sticker.collected ? 'danger' : 'success'" @click="toggleCollected(sticker.id)">
            <ion-icon slot="start" :icon="sticker.collected ? removeCircle : addCircle"></ion-icon>
            {{ sticker.collected ? 'Remover da Coleção' : 'Adicionar à Coleção' }}
          </ion-button>

          <ion-button expand="block" :color="sticker.favorite ? 'warning' : 'medium'" @click="toggleFavorite(sticker.id)" class="ion-margin-top">
            <ion-icon slot="start" :icon="sticker.favorite ? star : starOutline"></ion-icon>
            {{ sticker.favorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos' }}
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon,
  IonText,
} from '@ionic/vue';
import { checkmarkCircle, closeCircle, addCircle, removeCircle, star, starOutline } from 'ionicons/icons';
import { useAlbum } from '@/composables/useAlbum';

const props = defineProps({
  isOpen: Boolean,
  sticker: Object,
});

const emit = defineEmits(['close']);

const { marcarColetada, marcarFavorita } = useAlbum();

const toggleCollected = async (id: number) => {
  await marcarColetada(id);
  emit('close'); // Fecha o modal após a ação
};

const toggleFavorite = async (id: number) => {
  await marcarFavorita(id);
  // Não fecha o modal, permite que o usuário continue interagindo
};

const rarityColor = computed(() => (raridade: string) => {
  switch (raridade) {
    case 'rara': return 'tertiary';
    case 'brilhante': return 'secondary';
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
img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
</style>