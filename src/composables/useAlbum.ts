import { ref, computed, watch } from 'vue';
import { listFigurinhas, toggleSticker, toggleFavorite, getAlbumStatistics, getCollectorRanking, listLastCollectedStickers } from '@/services/database';
import { useAuth } from './useAuth';

interface Sticker {
  id: number;
  nome: string;
  team: string;
  photo: string;
  raridade: string;
  collected: number;
  favorite: number;
  collected_at: string | null;
}

const stickers = ref<Sticker[]>([]);
const albumStatistics = ref<any>(null);
const collectorRanking = ref<any>(null);
const lastCollectedStickers = ref<any[]>([]);

export function useAlbum() {
  const { user } = useAuth();

  // Estados globais para a aba do Álbum (filtragem)
  const filterType = ref<'all' | 'collected' | 'pending' | 'favorite'>('all');
  const searchQuery = ref('');

  const loadStickers = async (filter: 'all' | 'collected' | 'pending' | 'favorite' = 'all', search: string = '') => {
    if (user.value?.id) {
      // Correção: forçar a busca pelo banco com o filtro atual
      stickers.value = await listFigurinhas(user.value.id, filter, search) as Sticker[];
      await loadStatistics();
      await loadRanking();
      await loadLastCollectedStickers();
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

  const loadLastCollectedStickers = async () => {
    if (user.value?.id) {
      lastCollectedStickers.value = await listLastCollectedStickers(user.value.id, 10);
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
  const collectorNextLevel = computed(() => collectorRanking.value?.proximoNivel || 'Prata');
  const collectorPointsToNextLevel = computed(() => collectorRanking.value?.pontosParaProximoNivel || 0);
  const collectorProgressToNextLevel = computed(() => collectorRanking.value?.percentualProximoNivel || 0);

  const marcarColetada = async (id: number) => {
    if (user.value?.id) {
      await toggleSticker(id, user.value.id);
      // Força recarregar a lista do banco (sempre voltando para o estado atual do álbum)
      await loadStickers(filterType.value, searchQuery.value);
    }
  };

  const marcarFavorita = async (id: number) => {
    if (user.value?.id) {
      await toggleFavorite(id, user.value.id);
      await loadStickers(filterType.value, searchQuery.value);
    }
  };

  const pesquisar = (query: string) => {
    searchQuery.value = query;
    loadStickers(filterType.value, searchQuery.value);
  };

  const setFilter = (filter: 'all' | 'collected' | 'pending' | 'favorite') => {
    filterType.value = filter;
    loadStickers(filterType.value, searchQuery.value);
  };

  watch(user, (newVal) => {
    if (newVal?.id) {
      // Ao carregar, garante que o estado inicial do álbum seja limpo
      loadStickers('all', '');
    }
  }, { immediate: true });

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
    collectorNextLevel,
    collectorPointsToNextLevel,
    collectorProgressToNextLevel,
    loadStickers,
    marcarColetada,
    marcarFavorita,
    pesquisar,
    setFilter,
    filterType,
    searchQuery,
    albumStatistics,
    collectorRanking,
    lastCollectedStickers
  };
}