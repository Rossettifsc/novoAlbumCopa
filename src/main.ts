import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';

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