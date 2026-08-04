import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { Capacitor } from '@capacitor/core';
import { IonicVue } from '@ionic/vue';
import { defineCustomElements as defineSQLiteElements } from 'jeep-sqlite/loader';
import { CapacitorSQLite } from '@capacitor-community/sqlite';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router);

const bootDatabase = async () => {
  try {
    if (Capacitor.getPlatform() === 'web') {
      await defineSQLiteElements(window);
      await CapacitorSQLite.initWebStore();
    }

    const { initDatabase } = await import('./services/database');
    await initDatabase();
    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Falha ao inicializar o banco de dados:', error);
  }
};

router.isReady().then(() => {
  app.mount('#app');
  void bootDatabase();
});