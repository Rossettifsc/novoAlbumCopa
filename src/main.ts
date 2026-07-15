import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

// Importações para o SQLite Web
import { defineCustomElements as defineSQLiteElements } from '@capacitor-community/sqlite/dist/web';
import { setupSQLite } from '@capacitor-community/sqlite';

// Define os elementos customizados para o SQLite Web
defineSQLiteElements(window);
setupSQLite({
  sqlite: {
    // Adicione qualquer configuração específica para web aqui, se necessário
  },
  electron: {
    // Adicione qualquer configuração específica para electron aqui, se necessário
  }
});

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
// ... outros imports CSS

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});

// Inicializa o banco de dados após a montagem do aplicativo
// Isso garante que o driver web esteja pronto antes das operações de banco de dados
import { initDatabase } from './services/database';
initDatabase().then(() => {
  console.log('Banco de dados inicializado de main.ts');
}).catch(e => {
  console.error('Falha ao inicializar o banco de dados de main.ts:', e);
});