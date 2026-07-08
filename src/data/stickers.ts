export interface Sticker {
  id: number;
  name: string;
  team: string;
  photo: string;
  collected: boolean;
  raridade?: string; // Remova a interrogação (?) daqui
}


export const initialStickers: Sticker[] = [
  { id: 1, name: 'Neymar Jr', team: 'Brasil', photo: 'https://th.bing.com/th?id=OIF.47rH6yHU0EQg1ewDnq%2bCmg&r=0&rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
  { id: 2, name: 'Lionel Messi', team: 'Argentina', photo: 'https://canal12web.com/wp-content/uploads/2026/03/asi-sera-la-figurita-de-messi-en-el-album-del-mundial-2026_w862.webp', collected: false },
  { id: 3, name: 'Cristiano Ronaldo', team: 'Portugal', photo: 'https://tse3.mm.bing.net/th/id/OIP.7f12DlI3vzfG6uHO3WEVZQHaKI?rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
  { id: 4, name: 'Gavi', team: 'Espanha', photo: 'https://down-br.img.susercontent.com/file/br-11134207-7qukw-li0tks6nqma6d6', collected: false },
  { id: 5, name: 'Kevin De Bruyne', team: 'Bélgica', photo: 'https://tse3.mm.bing.net/th/id/OIP.3eaxe7561wX0mSFFi306IgHaLG?rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
  { id: 6, name: 'Vinícius Jr', team: 'Brasil', photo: 'https://tse4.mm.bing.net/th/id/OIP.aA0LN6kbqGuDJsKfR60Q4wHaKk?rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
  { id: 7, name: 'Robert Lewandowski', team: 'Polônia', photo: 'https://a.allegroimg.com/original/11dd4d/fa50e98e467892b1293c8a079a1c/PANINI-FIFA-365-2026-FANS-FAVOURITE-blue-FAN73-ROBERT-LEWANDOWSKI-BARCELONA', collected: false },
  { id: 8, name: 'Luka Modric', team: 'Croácia', photo: 'https://tse4.mm.bing.net/th/id/OIP.a5w5lZJrZdUZNjRMPW0lSAHaJw?rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
  { id: 9, name: 'Harry Kane', team: 'Inglaterra', photo: 'https://tse3.mm.bing.net/th/id/OIP.Uk-6lbQCxckIFvru78Yi8QHaKc?rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
  { id: 10, name: 'Son Heung-min', team: 'Coreia do Sul', photo: 'https://tse1.mm.bing.net/th/id/OIP.vfdqt02ElbkSoTM6efJjuwHaJ0?rs=1&pid=ImgDetMain&o=7&rm=3', collected: false },
];
