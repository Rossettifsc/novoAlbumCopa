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
              <h2>Usuário</h2>
            </ion-label>
          </ion-item>
          <ion-item lines="none">
            <ion-label>
              <p>E-mail</p>
              <h2>usuario@exemplo.com</h2>
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
              <h2>{{ Math.round((collectedStickersCount / totalStickers) * 100) }}%</h2>
            </ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from '@ionic/vue';
import { useAlbum } from '../composables/useAlbum';
import AppHeader from '../components/AppHeader.vue';

const { totalStickers, collectedStickersCount } = useAlbum();

const handleLogout = () => {
  console.log('Logout clicado');
};
</script>