<template>
  <ion-page>
    <AppHeader title="Sobre" show-back-button />
    <ion-content class="ion-padding">
      <div class="about-container">
        <ion-img src="/favicon.png" class="logo"></ion-img>
        <h2>Álbum da Copa 2026</h2>
        <p>Versão 1.0.0</p>
        
        <ion-list class="ion-margin-top">
          <ion-item button @click="openLink('https://exemplo.com/termos' )">
            <ion-label>Termos de Uso</ion-label>
            <ion-icon :icon="chevronForward" slot="end"></ion-icon>
          </ion-item>
          <ion-item button @click="openLink('https://exemplo.com/privacidade' )">
            <ion-label>Política de Privacidade</ion-label>
            <ion-icon :icon="chevronForward" slot="end"></ion-icon>
          </ion-item>
        </ion-list>

        <div class="footer">
          <p>© 2026 Manus AI - Todos os direitos reservados</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonList, IonItem, IonLabel, IonIcon, IonImg } from '@ionic/vue';
import { chevronForward } from 'ionicons/icons';
import AppHeader from '@/composables/AppHeader.vue';

const openLink = (url: string) => {
  window.open(url, '_blank');
};
</script>

<style scoped>
.about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 40px;
}
.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}
.footer {
  margin-top: 50px;
  color: var(--ion-color-medium);
  font-size: 0.9em;
}
</style>
