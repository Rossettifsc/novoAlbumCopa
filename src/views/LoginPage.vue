<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isRegister ? 'Criar Conta' : 'Login' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="login-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ isRegister ? 'Registre-se' : 'Bem-vindo' }}</ion-card-title>
            <ion-card-subtitle>Acesse seu álbum da copa</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <form @submit.prevent="handleSubmit">
              <ion-item v-if="isRegister">
                <ion-label position="stacked">Nome Completo</ion-label>
                <ion-input v-model="formData.nome" type="text" placeholder="Seu nome" required></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Usuário (Login)</ion-label>
                <ion-input v-model="formData.login" type="text" placeholder="Seu login" required></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Senha</ion-label>
                <ion-input v-model="formData.senha" type="password" placeholder="Sua senha" required></ion-input>
              </ion-item>

              <div class="ion-margin-top">
                <ion-button expand="block" type="submit">
                  {{ isRegister ? 'Registrar' : 'Entrar' }}
                </ion-button>
              </div>

              <div class="ion-text-center ion-margin-top">
                <ion-button fill="clear" @click="toggleMode">
                  {{ isRegister ? 'Já tenho uma conta' : 'Não tenho conta, criar agora' }}
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <ion-toast
          :is-open="showToast"
          :message="toastMessage"
          :duration="2000"
          @did-dismiss="showToast = false"
        ></ion-toast>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, 
  IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonToast 
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { login, register } = useAuth();

const isRegister = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

const formData = reactive({
  nome: '',
  login: '',
  senha: ''
});

const toggleMode = () => {
  isRegister.value = !isRegister.value;
};

const handleSubmit = async () => {
  if (isRegister.value) {
    const success = await register(formData.nome, formData.login, formData.senha);
    if (success) {
      toastMessage.value = 'Conta criada com sucesso! Faça login.';
      showToast.value = true;
      isRegister.value = false;
    } else {
      toastMessage.value = 'Erro ao criar conta. Tente outro login.';
      showToast.value = true;
    }
  } else {
    const success = await login(formData.login, formData.senha);
    if (success) {
      router.push('/tabs/tab1');
    } else {
      toastMessage.value = 'Login ou senha incorretos.';
      showToast.value = true;
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
</style>