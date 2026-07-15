import { ref, computed, watch } from 'vue';
import { listFigurinhas, toggleSticker, toggleFavorite, getAlbumStatistics, getCollectorRanking } from '@/services/database';
import { useAuth } from './useAuth';

interface Sticker {
  id: number;
  nome: string;
  team: string;
  photo: string;
  raridade: string;
  collected: number;
  favorite: number; // Adicionado
  collected_at: string; // Adicionado
}

const stickers = ref<Sticker[]>([]);
const filterType = ref<'all' | 'collected' | 'pending' | 'favorite'>('all'); // Adicionado 'favorite'
const searchQuery = ref('');
const albumStatistics = ref<any>(null);
const collectorRanking = ref<any>(null);

export function useAlbum() {
  const { user } = useAuth();

  const loadStickers = async () => {
    if (user.value?.id) {
      stickers.value = await listFigurinhas(user.value.id, filterType.value, searchQuery.value);
      await loadStatistics();
      await loadRanking();
    }
  };

  const loadStatistics = async () => {
    if (user.value?.id) {
      albumStatistics.value = await getAlbumStatistics(user.value.id);
    }
  };

  const loadRanking = async () => {
    if (user.value?.id) {
      collectorRanking.value = await getCollectorRanking(user.value.id);
    }
  };

  const filteredStickers = computed(() => {
    return stickers.value;
  });

  const totalStickers = computed(() => albumStatistics.value?.totalFigurinhas || 0);
  const collectedStickersCount = computed(() => albumStatistics.value?.totalColetadas || 0);
  const missingStickersCount = computed(() => albumStatistics.value?.totalFaltantes || 0);
  const rareCollectedCount = computed(() => albumStatistics.value?.rarasColetadas || 0);
  const shinyCollectedCount = computed(() => albumStatistics.value?.brilhantesColetadas || 0);
  const completionPercentage = computed(() => albumStatistics.value?.percentualConclusao || 0);

  const collectorScore = computed(() => collectorRanking.value?.pontuacaoTotal || 0);
  const collectorLevel = computed(() => collectorRanking.value?.nivel || 'Bronze');

  const marcarColetada = async (id: number) => {
    if (user.value?.id) {
      await toggleSticker(id, user.value.id);
      await loadStickers(); // Recarrega para atualizar a lista e as estatísticas
    }
  };

  const marcarFavorita = async (id: number) => { // Nova função
    if (user.value?.id) {
      await toggleFavorite(id, user.value.id);
      await loadStickers(); // Recarrega para atualizar a lista e as estatísticas
    }
  };

  const pesquisar = (query: string) => {
    searchQuery.value = query;
    loadStickers();
  };

  const setFilter = (filter: 'all' | 'collected' | 'pending' | 'favorite') => { // Atualizado
    filterType.value = filter;
    loadStickers();
  };

  watch(user, (newVal, oldVal) => {
    if (newVal?.id && newVal.id !== oldVal?.id) {
      loadStickers();
    }
  });

  return {
    stickers: filteredStickers,
    totalStickers,
    collectedStickersCount,
    missingStickersCount,
    rareCollectedCount,
    shinyCollectedCount,
    completionPercentage,
    collectorScore,
    collectorLevel,
    loadStickers,
    marcarColetada,
    marcarFavorita, // Exporta nova função
    pesquisar,
    setFilter,
    filterType,
    albumStatistics,
    collectorRanking
  };
}