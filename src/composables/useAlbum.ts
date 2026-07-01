import { ref, computed } from 'vue';
import { initialStickers, Sticker } from '../data/stickers';

const stickers = ref<Sticker[]>([...initialStickers]);

export function useAlbum() {
  const searchQuery = ref('');
  const filterType = ref<'all' | 'collected' | 'pending'>('all');

  const filteredStickers = computed(() => {
    return stickers.value.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                            s.team.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      if (filterType.value === 'collected') return matchesSearch && s.collected;
      if (filterType.value === 'pending') return matchesSearch && !s.collected;
      return matchesSearch;
    });
  });

  const totalStickers = computed(() => stickers.value.length);
  const collectedStickersCount = computed(() => stickers.value.filter(s => s.collected).length);

  const marcarColetada = (id: number) => {
    const sticker = stickers.value.find(s => s.id === id);
    if (sticker) {
      sticker.collected = !sticker.collected;
    }
  };

  const pesquisar = (query: string) => {
    searchQuery.value = query;
  };

  const setFilter = (type: 'all' | 'collected' | 'pending') => {
    filterType.value = type;
  };

  return {
    stickers,
    filteredStickers,
    totalStickers,
    collectedStickersCount,
    marcarColetada,
    pesquisar,
    setFilter,
    filterType
  };
}