import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite'
import { initialStickers } from '../data/stickers'

const dbName = 'appdata'
let db: SQLiteDBConnection | null = null
let initialized = false
const sqliteConnection = new SQLiteConnection(CapacitorSQLite)

async function ensureDatabase() {
  if (initialized && db) return
  try {
    if (!db) {
      db = await sqliteConnection.createConnection(dbName, false, 'no-encryption', 1, false)
    }
    await db.open()

    // Tabela de Usuários
    await db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        login TEXT NOT NULL UNIQUE,
        senha TEXT
      );
    `)

    // Tabela de Figurinhas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS figurinhas (
        id INTEGER PRIMARY KEY,
        nome TEXT NOT NULL,
        team TEXT NOT NULL,
        photo TEXT,
        raridade TEXT DEFAULT 'comum',
        collected INTEGER DEFAULT 0,
        favorite INTEGER DEFAULT 0, /* NOVA COLUNA */
        collected_at DATETIME,     /* NOVA COLUNA */
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES usuarios(id)
      );
    `)

    // Tabela de Conquistas (Achievements)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT NOT NULL,
        icone TEXT,
        tipo TEXT NOT NULL,
        valor_requisito INTEGER NOT NULL
      );
    `)

    // Tabela de Conquistas do Usuário
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id INTEGER NOT NULL,
        data_desbloqueio TEXT,
        FOREIGN KEY(user_id) REFERENCES usuarios(id),
        FOREIGN KEY(achievement_id) REFERENCES achievements(id)
      );
    `)

    // Inserir conquistas iniciais se não existirem
    const checkAchiv = await db.query('SELECT count(*) as count FROM achievements')
    if (checkAchiv.values?.[0].count === 0) {
      const initialAchievements = [
        ['Primeira Figurinha', 'Desbloquear ao coletar a primeira figurinha.', 'star', 'total', 1],
        ['Iniciante', 'Coletar 10 figurinhas.', 'medal', 'total', 10],
        ['Colecionador', 'Coletar 25 figurinhas.', 'trophy', 'total', 25],
        ['Caçador de Raras', 'Coletar 5 figurinhas raras.', 'diamond', 'rara', 5],
        ['Mestre das Brilhantes', 'Coletar 10 figurinhas brilhantes.', 'sunny', 'brilhante', 10]
      ]
      for (const ach of initialAchievements) {
        await db.run('INSERT INTO achievements (nome, descricao, icone, tipo, valor_requisito) VALUES (?, ?, ?, ?, ?)', ach)
      }
    }

    initialized = true
    console.log('Banco inicializado com sucesso')
  } catch (error) {
    console.error('Erro ao inicializar banco', error)
    throw error
  }
}

function getDB() {
  if (!db) throw new Error('Banco de dados ainda não inicializado')
  return db
}

export async function initDatabase() {
  await ensureDatabase()
}

/* USUÁRIOS */
export async function addUsuario(nome: string, login: string, senha: string) {
  await ensureDatabase()
  await getDB().run('INSERT INTO usuarios (nome, login, senha) VALUES (?, ?, ?);', [nome, login, senha])
}

export async function realizarLogin(login: string, senha: string) {
  await ensureDatabase()
  const result = await getDB().query('SELECT * FROM usuarios WHERE login = ? AND senha = ?;', [login, senha])
  return result.values || []
}

/* FIGURINHAS */
export async function syncInitialStickers(userId: number) {
  await ensureDatabase()
  const check = await getDB().query('SELECT count(*) as count FROM figurinhas WHERE user_id = ?', [userId])
  if (check.values?.[0].count === 0) {
    for (const s of initialStickers) {
      const raridade = s.id % 5 === 0 ? 'rara' : (s.id % 3 === 0 ? 'brilhante' : 'comum')
      await getDB().run(
        'INSERT INTO figurinhas (id, nome, team, photo, raridade, collected, favorite, collected_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.team, s.photo, raridade, 0, 0, null, userId] /* Adicionado favorite e collected_at */
      )
    }
  }
}

export async function listFigurinhas(userId: number, filter: string = 'all', search: string = '') {
  await ensureDatabase()
  let query = 'SELECT * FROM figurinhas WHERE user_id = ?'
  const params: any[] = [userId]

  if (filter === 'collected') query += ' AND collected = 1'
  else if (filter === 'pending') query += ' AND collected = 0'
  else if (filter === 'favorite') query += ' AND favorite = 1' /* NOVO FILTRO */

  if (search) {
    query += ' AND (nome LIKE ? OR team LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const result = await getDB().query(query, params)
  return result.values || []
}

export async function toggleSticker(id: number, userId: number) {
  await ensureDatabase()
  const currentSticker = await getDB().query('SELECT collected FROM figurinhas WHERE id = ? AND user_id = ?', [id, userId])
  const isCollected = currentSticker.values?.[0]?.collected === 1
  const newCollectedState = isCollected ? 0 : 1
  const collectedAt = isCollected ? null : new Date().toISOString() // Define collected_at apenas se for coletar

  await getDB().run('UPDATE figurinhas SET collected = ?, collected_at = ? WHERE id = ? AND user_id = ?', [newCollectedState, collectedAt, id, userId])
  await checkAndGrantAchievements(userId)
}

export async function toggleFavorite(id: number, userId: number) { /* NOVA FUNÇÃO */
  await ensureDatabase()
  await getDB().run('UPDATE figurinhas SET favorite = 1 - favorite WHERE id = ? AND user_id = ?', [id, userId])
}

export async function getStickerDetails(id: number, userId: number) { /* NOVA FUNÇÃO */
  await ensureDatabase()
  const result = await getDB().query('SELECT * FROM figurinhas WHERE id = ? AND user_id = ?', [id, userId])
  return result.values?.[0] || null
}

export async function listLastCollectedStickers(userId: number, limit: number = 10) { /* NOVA FUNÇÃO */
  await ensureDatabase()
  const result = await getDB().query('SELECT * FROM figurinhas WHERE user_id = ? AND collected = 1 AND collected_at IS NOT NULL ORDER BY collected_at DESC LIMIT ?', [userId, limit])
  return result.values || []
}

export async function getAlbumStatistics(userId: number) { /* NOVA FUNÇÃO */
  await ensureDatabase()
  const result = await getDB().query(`
    SELECT 
      COUNT(*) AS totalFigurinhas,
      SUM(CASE WHEN collected = 1 THEN 1 ELSE 0 END) AS totalColetadas,
      SUM(CASE WHEN collected = 0 THEN 1 ELSE 0 END) AS totalFaltantes,
      SUM(CASE WHEN raridade = 'rara' AND collected = 1 THEN 1 ELSE 0 END) AS rarasColetadas,
      SUM(CASE WHEN raridade = 'brilhante' AND collected = 1 THEN 1 ELSE 0 END) AS brilhantesColetadas
    FROM figurinhas
    WHERE user_id = ?
  `, [userId])
  const stats = result.values?.[0] || {}

  const totalFigurinhas = stats.totalFigurinhas || 0
  const totalColetadas = stats.totalColetadas || 0
  const percentualConclusao = totalFigurinhas > 0 ? (totalColetadas / totalFigurinhas) * 100 : 0

  return {
    totalFigurinhas,
    totalColetadas,
    totalFaltantes: stats.totalFaltantes || 0,
    rarasColetadas: stats.rarasColetadas || 0,
    brilhantesColetadas: stats.brilhantesColetadas || 0,
    percentualConclusao: parseFloat(percentualConclusao.toFixed(2))
  }
}

export async function getCollectorRanking(userId: number) { /* NOVA FUNÇÃO */
  await ensureDatabase()
  const result = await getDB().query(`
    SELECT 
      SUM(CASE WHEN collected = 1 AND raridade = 'comum' THEN 1
               WHEN collected = 1 AND raridade = 'rara' THEN 5
               WHEN collected = 1 AND raridade = 'brilhante' THEN 10
               ELSE 0 END) AS pontuacaoTotal
    FROM figurinhas
    WHERE user_id = ?
  `, [userId])
  const pontuacaoTotal = result.values?.[0]?.pontuacaoTotal || 0

  let nivel = ''
  if (pontuacaoTotal >= 501) nivel = 'Diamante'
  else if (pontuacaoTotal >= 251) nivel = 'Ouro'
  else if (pontuacaoTotal >= 101) nivel = 'Prata'
  else nivel = 'Bronze'

  return {
    pontuacaoTotal,
    nivel
  }
}

/* CONQUISTAS */
async function checkAndGrantAchievements(userId: number) {
  const stats = await getDB().query(`
    SELECT 
      count(*) as total,
      sum(case when raridade = 'rara' and collected = 1 then 1 else 0 end) as raras,
      sum(case when raridade = 'brilhante' and collected = 1 then 1 else 0 end) as brilhantes,
      sum(case when collected = 1 then 1 else 0 end) as coletadas
    FROM figurinhas WHERE user_id = ?
  `, [userId])
  
  const s = stats.values?.[0]
  const achievements = await getDB().query('SELECT * FROM achievements')
  
  for (const ach of achievements.values || []) {
    let reached = false
    if (ach.tipo === 'total' && s.coletadas >= ach.valor_requisito) reached = true
    if (ach.tipo === 'rara' && s.raras >= ach.valor_requisito) reached = true
    if (ach.tipo === 'brilhante' && s.brilhantes >= ach.valor_requisito) reached = true

    if (reached) {
      const owned = await getDB().query('SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [userId, ach.id])
      if (owned.values?.length === 0) {
        await getDB().run('INSERT INTO user_achievements (user_id, achievement_id, data_desbloqueio) VALUES (?, ?, ?)', 
          [userId, ach.id, new Date().toISOString()])
      }
    }
  }
}

export async function listUserAchievements(userId: number) {
  await ensureDatabase()
  const query = `
    SELECT a.*, ua.data_desbloqueio, 
    CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
  `
  const result = await getDB().query(query, [userId])
  return result.values || []
}