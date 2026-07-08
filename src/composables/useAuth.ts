import { ref, readonly } from 'vue';
import { realizarLogin, addUsuario, syncInitialStickers } from '@/services/database';

const user = ref<any>(null);
const isAuthenticated = ref(false);

export function useAuth() {
  const login = async (username: string, password: string) => {
    try {
      const users = await realizarLogin(username, password);
      if (users && users.length > 0) {
        user.value = users[0];
        isAuthenticated.value = true;
        await syncInitialStickers(user.value.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const register = async (nome: string, loginStr: string, senha: string) => {
    try {
      await addUsuario(nome, loginStr, senha);
      return true;
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return false;
    }
  };

  const logout = () => {
    user.value = null;
    isAuthenticated.value = false;
  };

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    login,
    register,
    logout
  };
}
