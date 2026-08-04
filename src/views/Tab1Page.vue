<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Álbum</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <p class="ion-padding">A navegação principal do álbum está na tela de Álbuns do app.</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>