<template>
  <ion-page>
    <AppHeader title="Meu Álbum" show-logout @logout="handleLogout" />
    
    <ion-content>
      <ion-card class="ion-margin">
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-text>
                  <h3>Total</h3>
                  <p class="stat-number">{{ totalStickers }}</p>
                </ion-text>
              </ion-col>
              <ion-col size="6">
                <ion-text>
                  <h3>Coletadas</h3>
                  <p class="stat-number">{{ collectedStickersCount }}</p>
                </ion-text>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-progress-bar :value="totalStickers > 0 ? collectedStickersCount / totalStickers : 0"></ion-progress-bar>
        </ion-card-content>
      </ion-card>

      <ion-item lines="none" class="ion-margin">
        <ion-label>Filtro:</ion-label>
        <ion-select v-model="filterType" @ionChange="updateFilter">
          <ion-select-option value="all">Todas</ion-select-option>
          <ion-select-option value="collected">Coletadas</ion-select-option>
          <ion-select-option value="pending">Pendentes</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-searchbar 
        placeholder="Buscar por nome ou seleção" 
        :value="searchQuery"
        @ionInput="updateSearch">
      </ion-searchbar>

      <!-- StickerList agora recebe filteredStickers que definimos no useAlbum -->
      <StickerList :stickers="filteredStickers" @toggle-collect="toggleCollect" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonCard, IonCardContent, IonGrid, IonRow, 
  IonCol, IonText, IonItem, IonLabel, IonSelect, IonSelectOption, 
  IonSearchbar, IonProgressBar 
} from '@ionic/vue';

import { useAuth } from '../composables/useAuth';
import { useAlbum } from '../composables/useAlbum';
import AppHeader from '@/composables/AppHeader.vue'; 
import StickerList from '@/composables/StickerList.vue';

const router = useRouter();
const { logout } = useAuth();
const { 
  filteredStickers, 
  totalStickers, 
  collectedStickersCount, 
  marcarColetada, 
  pesquisar, 
  setFilter, 
  filterType, 
  loadStickers,
  searchQuery
} = useAlbum();

onMounted(async () => {
  await loadStickers();
});

const updateSearch = (event: any) => {
  pesquisar(event.detail.value || '');
};

const updateFilter = () => {
  setFilter(filterType.value);
};

const toggleCollect = async (id: number) => {
  await marcarColetada(id);
};

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>

<style scoped>
.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #3880ff;
  margin: 0;
}
</style>
