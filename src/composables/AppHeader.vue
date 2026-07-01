<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start" v-if="showBackButton">
        <ion-back-button default-href="/tabs/album"></ion-back-button>
      </ion-buttons>
      <ion-title>{{ title }}</ion-title>
      <ion-buttons slot="end" v-if="showLogout">
        <ion-button @click="handleLogout">
          <ion-icon slot="icon-only" :icon="logOut"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBackButton } from '@ionic/vue';
import { logOut } from 'ionicons/icons';

defineProps<{
  title: string;
  showBackButton?: boolean;
  showLogout?: boolean;
}>();

const emit = defineEmits<{
  'logout': []
}>();

const handleLogout = () => {
  emit('logout');
};
</script>