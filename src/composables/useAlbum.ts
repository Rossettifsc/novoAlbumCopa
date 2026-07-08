import { ref, computed } from 'vue';
import { listFigurinhas, toggleSticker } from '@/services/database';
import { useAuth } from './useAuth';

export function useAlbum() {
  const { user } = useAuth();
  const stickers = ref<any[]>([]);
  const searchQuery = ref('');
  const filterType = ref<'all' | 'collected' | 'pending'>('all');

  const loadStickers = async () => {
    if (user.value) {
      // Busca as figurinhas do banco de dados
      const data = await listFigurinhas(user.value.id, filterType.value, searchQuery.value);
      stickers.value = data;
    }
  };

  // ESTA É A PARTE QUE ESTAVA FALTANDO:
  const filteredStickers = computed(() => {
    return stickers.value; // O filtro já é feito no banco de dados, então apenas retornamos o que veio de lá
  });

  const totalStickers = computed(() => stickers.value.length);
  const collectedStickersCount = computed(() => stickers.value.filter(s => s.collected).length);

  const marcarColetada = async (id: number) => {
    if (user.value) {
      await toggleSticker(id, user.value.id);
      await loadStickers(); // Recarrega para atualizar estatísticas e conquistas
    }
  };

  const pesquisar = async (query: string) => {
    searchQuery.value = query;
    await loadStickers();
  };

  const setFilter = async (type: 'all' | 'collected' | 'pending') => {
    filterType.value = type;
    await loadStickers();
  };

  return {
    stickers,
    filteredStickers, // Agora exportado corretamente
    totalStickers,
    collectedStickersCount,
    marcarColetada,
    pesquisar,
    setFilter,
    filterType,
    loadStickers,
    searchQuery
  };
}
