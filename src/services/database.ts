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
        'INSERT INTO figurinhas (id, nome, team, photo, raridade, collected, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.team, s.photo, raridade, 0, userId]
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

  if (search) {
    query += ' AND (nome LIKE ? OR team LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const result = await getDB().query(query, params)
  return result.values || []
}

export async function toggleSticker(id: number, userId: number) {
  await ensureDatabase()
  await getDB().run('UPDATE figurinhas SET collected = 1 - collected WHERE id = ? AND user_id = ?', [id, userId])
  await checkAndGrantAchievements(userId)
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
