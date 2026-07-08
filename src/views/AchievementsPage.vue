<template>
  <ion-page>
    <AppHeader title="Conquistas" />
    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          <ion-col size="12" v-for="ach in achievements" :key="ach.id">
            <ion-card :class="{ 'locked': !ach.unlocked }">
              <ion-card-header>
                <div class="header-container">
                  <ion-icon :icon="getIcon(ach.icone)" :color="ach.unlocked ? 'primary' : 'medium'" size="large"></ion-icon>
                  <div class="title-container">
                    <ion-card-title>{{ ach.nome }}</ion-card-title>
                    <ion-badge :color="ach.unlocked ? 'success' : 'medium'">
                      {{ ach.unlocked ? 'Desbloqueada' : 'Bloqueada' }}
                    </ion-badge>
                  </div>
                </div>
              </ion-card-header>
              <ion-card-content>
                <p>{{ ach.descricao }}</p>
                <p v-if="ach.unlocked" class="unlock-date">
                  Desbloqueada em: {{ formatDate(ach.data_desbloqueio) }}
                </p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonBadge 
} from '@ionic/vue';
import { star, medal, trophy, diamond, sunny, lockClosed } from 'ionicons/icons';
import AppHeader from '@/composables/AppHeader.vue';
import { useAuth } from '@/composables/useAuth';
import { listUserAchievements } from '@/services/database';

const { user } = useAuth();
const achievements = ref<any[]>([]);

const loadAchievements = async () => {
  if (user.value) {
    achievements.value = await listUserAchievements(user.value.id);
  }
};

const getIcon = (name: string) => {
  const icons: any = { star, medal, trophy, diamond, sunny };
  return icons[name] || lockClosed;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

onMounted(loadAchievements);
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  gap: 15px;
}
.title-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.locked {
  opacity: 0.6;
  filter: grayscale(1);
}
.unlock-date {
  font-size: 0.8em;
  margin-top: 10px;
  color: var(--ion-color-medium);
}
</style>
