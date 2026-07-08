<template>
  <ion-page>
    <AppHeader title="Perfil" show-logout @logout="handleLogout" />
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Informações do Usuário</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-label>
              <p>Nome</p>
              <h2>{{ user?.nome || 'Usuário' }}</h2>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label>
              <p>Login</p>
              <h2>{{ user?.login || 'Não logado' }}</h2>
            </ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Estatísticas</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-label>
              <p>Total de Figurinhas</p>
              <h2>{{ totalStickers }}</h2>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label>
              <p>Figurinhas Coletadas</p>
              <h2>{{ collectedStickersCount }}</h2>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label>
              <p>Progresso</p>
              <h2>{{ totalStickers > 0 ? Math.round((collectedStickersCount / totalStickers) * 100) : 0 }}%</h2>
            </ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <ion-list class="ion-margin-top">
        <ion-item button router-link="/about">
          <ion-label>Sobre o Aplicativo</ion-label>
          <ion-icon :icon="informationCircleOutline" slot="end"></ion-icon>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonList, IonIcon } from '@ionic/vue';
import { informationCircleOutline } from 'ionicons/icons';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useAlbum } from '../composables/useAlbum';
import AppHeader from '../composables/AppHeader.vue';

const router = useRouter();
const { user, logout } = useAuth();
const { totalStickers, collectedStickersCount, loadStickers } = useAlbum();

onMounted(async () => {
  await loadStickers();
});

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>
