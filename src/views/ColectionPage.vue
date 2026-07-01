<template>
  <ion-page>
    <AppHeader title="Minha Coleção" show-logout @logout="handleLogout" />
    <ion-content>
      <ion-card class="ion-margin">
        <ion-card-content>
          <ion-text>
            <h3>Figurinhas Coletadas</h3>
            <p>Você tem {{ collectedStickersCount }} figurinha(s) coletada(s)</p>
          </ion-text>
        </ion-card-content>
      </ion-card>

      <StickerList :stickers="collectedStickers" @toggle-collect="toggleCollect" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonCard, IonCardContent, IonText } from '@ionic/vue';
// import { useAuth } from '../composables/useAuth';
import { useAlbum } from '../composables/useAlbum';
import AppHeader from '../components/AppHeader.vue';
import StickerList from '../components/StickerList.vue';

const router = useRouter();
// const { logout } = useAuth();
const { stickers, collectedStickersCount, marcarColetada } = useAlbum();

const collectedStickers = computed(() => stickers.value.filter(s => s.collected));

const toggleCollect = (id: number) => {
  marcarColetada(id);
};

const handleLogout = () => {
  console.log('Logout clicado');
};
</script>