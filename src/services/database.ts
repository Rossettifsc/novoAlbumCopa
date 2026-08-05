import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite'
import { Capacitor } from '@capacitor/core'
import initSqlJs from 'sql.js'
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { initialStickers } from '../data/stickers'

const dbName = 'appdata'
let db: SQLiteDBConnection | BrowserSqlDb | null = null
let initialized = false
const sqliteConnection = new SQLiteConnection(CapacitorSQLite)
let sqlJsDatabase: any = null

type BrowserSqlDb = {
  execute: (sql: string) => Promise<void>
  run: (sql: string, params?: any[]) => Promise<void>
  query: (sql: string, params?: any[]) => Promise<{ values?: any[] }>
}

function createBrowserDb(): BrowserSqlDb {
  return {
    async execute(sql: string) {
      if (!sqlJsDatabase) throw new Error('Banco web não inicializado')
      sqlJsDatabase.exec(sql)
      await persistBrowserDatabase()
    },
    async run(sql: string, params: any[] = []) {
      if (!sqlJsDatabase) throw new Error('Banco web não inicializado')
      const statement = sqlJsDatabase.prepare(sql)
      if (params.length > 0) {
        statement.bind(params)
      }
      statement.step()
      statement.free()
      await persistBrowserDatabase()
    },
    async query(sql: string, params: any[] = []) {
      if (!sqlJsDatabase) throw new Error('Banco web não inicializado')
      const statement = sqlJsDatabase.prepare(sql)
      if (params.length > 0) {
        statement.bind(params)
      }

      const values: any[] = []
      while (statement.step()) {
        values.push(statement.getAsObject())
      }
      statement.free()

      return { values }
    }
  }
}

async function persistBrowserDatabase() {
  if (!sqlJsDatabase || Capacitor.getPlatform() !== 'web') return
  const binary = sqlJsDatabase.export() as Uint8Array
  const binaryString = Array.from(binary).map((byte: number) => String.fromCharCode(byte)).join('')
  localStorage.setItem(dbName, btoa(binaryString))
}

async function ensureSqlJsDatabase() {
  if (sqlJsDatabase) return

  const SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl
  })

  const storedDb = localStorage.getItem(dbName)
  if (storedDb) {
    const binaryString = atob(storedDb)
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
    sqlJsDatabase = new SQL.Database(bytes)
  } else {
    sqlJsDatabase = new SQL.Database()
  }
}

async function migrateFigurinhasSchema() {
  const tableExistsResult = await db?.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'figurinhas'")
  const tableExists = (tableExistsResult?.values?.length ?? 0) > 0

  if (!tableExists) return

  const tableInfo = await db?.query('PRAGMA table_info(figurinhas)')
  const columns = (tableInfo?.values || []).map((column: any) => column.name)

  if (columns.includes('sticker_id') && columns.includes('favorite') && columns.includes('collected_at')) {
    return
  }

  await db?.run(`
    CREATE TABLE IF NOT EXISTS figurinhas_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sticker_id INTEGER NOT NULL,
      nome TEXT NOT NULL,
      team TEXT NOT NULL,
      photo TEXT,
      raridade TEXT DEFAULT 'comum',
      collected INTEGER DEFAULT 0,
      favorite INTEGER DEFAULT 0,
      collected_at DATETIME,
      user_id INTEGER,
      UNIQUE(user_id, sticker_id),
      FOREIGN KEY(user_id) REFERENCES usuarios(id)
    );
  `)

  try {
    const oldData = await db?.query('SELECT * FROM figurinhas')
    if (oldData?.values) {
      for (const row of oldData.values) {
        const stickerId = row.sticker_id || row.id
        await db?.run(`
          INSERT OR REPLACE INTO figurinhas_new (sticker_id, nome, team, photo, raridade, collected, favorite, collected_at, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [stickerId, row.nome, row.team, row.photo, row.raridade || 'comum', row.collected || 0, row.favorite || 0, row.collected_at || null, row.user_id])
      }
    }
  } catch (e) {
    console.log('Erro na migração:', e)
  }

  await db?.run('DROP TABLE IF EXISTS figurinhas;')
  await db?.run('ALTER TABLE figurinhas_new RENAME TO figurinhas;')
}

async function ensureDatabase() {
  if (initialized && db) return

  try {
    if (Capacitor.getPlatform() === 'web') {
      await ensureSqlJsDatabase()
      db = createBrowserDb()
    } else {
      if (!db) {
        db = await sqliteConnection.createConnection(dbName, false, 'no-encryption', 1, false)
      }
      const nativeDb = db as SQLiteDBConnection
      await nativeDb.open()
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        login TEXT NOT NULL UNIQUE,
        senha TEXT
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS figurinhas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sticker_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        team TEXT NOT NULL,
        photo TEXT,
        raridade TEXT DEFAULT 'comum',
        collected INTEGER DEFAULT 0,
        favorite INTEGER DEFAULT 0,
        collected_at DATETIME,
        user_id INTEGER,
        UNIQUE(user_id, sticker_id),
        FOREIGN KEY(user_id) REFERENCES usuarios(id)
      );
    `)

    await migrateFigurinhasSchema()

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

    const checkAchiv = await db.query('SELECT count(*) as count FROM achievements')
    if ((checkAchiv.values?.[0]?.count ?? 0) === 0) {
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
  if ((check.values?.[0]?.count ?? 0) === 0) {
    for (const s of initialStickers) {
      const raridade = s.id % 5 === 0 ? 'rara' : (s.id % 3 === 0 ? 'brilhante' : 'comum')
      await getDB().run(
        'INSERT INTO figurinhas (sticker_id, nome, team, photo, raridade, collected, favorite, collected_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.team, s.photo, raridade, 0, 0, null, userId]
      )
    }
  }
}

export async function listFigurinhas(userId: number, filter: string = 'all', search: string = '') {
  await ensureDatabase()
  let query = 'SELECT id as row_id, sticker_id as id, nome, team, photo, raridade, collected, favorite, collected_at, user_id FROM figurinhas WHERE user_id = ?'
  const params: any[] = [userId]

  if (filter === 'collected') query += ' AND collected = 1'
  else if (filter === 'pending') query += ' AND collected = 0'
  else if (filter === 'favorite') query += ' AND favorite = 1'

  if (search) {
    query += ' AND (nome LIKE ? OR team LIKE ?)'
    params.push(\`%\${search}%\`, \`%\${search}%\`)
  }

  const result = await getDB().query(query, params)
  return result.values || []
}

export async function toggleSticker(id: number, userId: number) {
  await ensureDatabase()
  const currentSticker = await getDB().query('SELECT collected FROM figurinhas WHERE sticker_id = ? AND user_id = ?', [id, userId])
  const isCollected = currentSticker.values?.[0]?.collected === 1
  const newCollectedState = isCollected ? 0 : 1
  const collectedAt = isCollected ? null : new Date().toISOString()

  await getDB().run('UPDATE figurinhas SET collected = ?, collected_at = ? WHERE sticker_id = ? AND user_id = ?', [newCollectedState, collectedAt, id, userId])
  await checkAndGrantAchievements(userId)
}

export async function toggleFavorite(id: number, userId: number) {
  await ensureDatabase()
  await getDB().run('UPDATE figurinhas SET favorite = 1 - favorite WHERE sticker_id = ? AND user_id = ?', [id, userId])
}

export async function getStickerDetails(id: number, userId: number) {
  await ensureDatabase()
  const result = await getDB().query('SELECT id as row_id, sticker_id as id, nome, team, photo, raridade, collected, favorite, collected_at, user_id FROM figurinhas WHERE sticker_id = ? AND user_id = ?', [id, userId])
  return result.values?.[0] || null
}

export async function listLastCollectedStickers(userId: number, limit: number = 10) {
  await ensureDatabase()
  const result = await getDB().query('SELECT * FROM figurinhas WHERE user_id = ? AND collected = 1 AND collected_at IS NOT NULL ORDER BY collected_at DESC LIMIT ?', [userId, limit])
  return result.values || []
}

export async function getAlbumStatistics(userId: number) {
  await ensureDatabase()
  const result = await getDB().query(\`
    SELECT 
      COUNT(*) AS totalFigurinhas,
      SUM(CASE WHEN collected = 1 THEN 1 ELSE 0 END) AS totalColetadas,
      SUM(CASE WHEN collected = 0 THEN 1 ELSE 0 END) AS totalFaltantes,
      SUM(CASE WHEN raridade = 'rara' AND collected = 1 THEN 1 ELSE 0 END) AS rarasColetadas,
      SUM(CASE WHEN raridade = 'brilhante' AND collected = 1 THEN 1 ELSE 0 END) AS brilhantesColetadas
    FROM figurinhas
    WHERE user_id = ?
  \`, [userId])
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

export async function getCollectorRanking(userId: number) {
  await ensureDatabase()
  const result = await getDB().query(\`
    SELECT 
      SUM(CASE WHEN collected = 1 AND raridade = 'comum' THEN 1
               WHEN collected = 1 AND raridade = 'rara' THEN 5
               WHEN collected = 1 AND raridade = 'brilhante' THEN 10
               ELSE 0 END) AS pontuacaoTotal
    FROM figurinhas
    WHERE user_id = ?
  \`, [userId])

  const pontuacaoTotal = Number(result.values?.[0]?.pontuacaoTotal || 0)

  let nivel = 'Bronze'
  let proximoNivel = 'Prata'
  let pontosParaProximoNivel = 101
  let percentualProximoNivel = 0

  if (pontuacaoTotal >= 501) {
    nivel = 'Diamante'
    proximoNivel = 'Máximo'
    pontosParaProximoNivel = 0
    percentualProximoNivel = 100
  } else if (pontuacaoTotal >= 251) {
    nivel = 'Ouro'
    proximoNivel = 'Diamante'
    pontosParaProximoNivel = 501 - pontuacaoTotal
    percentualProximoNivel = Number(((pontuacaoTotal - 251) / (501 - 251) * 100).toFixed(2))
  } else if (pontuacaoTotal >= 101) {
    nivel = 'Prata'
    proximoNivel = 'Ouro'
    pontosParaProximoNivel = 251 - pontuacaoTotal
    percentualProximoNivel = Number(((pontuacaoTotal - 101) / (251 - 101) * 100).toFixed(2))
  } else {
    nivel = 'Bronze'
    proximoNivel = 'Prata'
    pontosParaProximoNivel = 101 - pontuacaoTotal
    percentualProximoNivel = Number((pontuacaoTotal / 101 * 100).toFixed(2))
  }

  return {
    pontuacaoTotal,
    nivel,
    proximoNivel,
    pontosParaProximoNivel,
    percentualProximoNivel
  }
}

/* CONQUISTAS */
export async function checkAndGrantAchievements(userId: number) {
  await ensureDatabase()
  const stats = await getDB().query(\`
    SELECT 
      COALESCE(COUNT(*), 0) AS total,
      COALESCE(SUM(CASE WHEN raridade = 'rara' AND collected = 1 THEN 1 ELSE 0 END), 0) AS raras,
      COALESCE(SUM(CASE WHEN raridade = 'brilhante' AND collected = 1 THEN 1 ELSE 0 END), 0) AS brilhantes,
      COALESCE(SUM(CASE WHEN collected = 1 THEN 1 ELSE 0 END), 0) AS coletadas
    FROM figurinhas WHERE user_id = ?
  \`, [userId])

  const s = stats.values?.[0] || { total: 0, raras: 0, brilhantes: 0, coletadas: 0 }
  const achievements = await getDB().query('SELECT * FROM achievements')

  for (const ach of achievements.values || []) {
    let reached = false
    if (ach.tipo === 'total' && Number(s.coletadas) >= Number(ach.valor_requisito)) reached = true
    if (ach.tipo === 'rara' && Number(s.raras) >= Number(ach.valor_requisito)) reached = true
    if (ach.tipo === 'brilhante' && Number(s.brilhantes) >= Number(ach.valor_requisito)) reached = true

    if (reached) {
      const owned = await getDB().query('SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [userId, ach.id])
      if ((owned.values?.length ?? 0) === 0) {
        await getDB().run('INSERT INTO user_achievements (user_id, achievement_id, data_desbloqueio) VALUES (?, ?, ?)',
          [userId, ach.id, new Date().toISOString()])
      }
    }
  }
}

export async function listUserAchievements(userId: number) {
  await ensureDatabase()
  const query = \`
    SELECT a.*, ua.data_desbloqueio,
    CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END as unlocked
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
  \`
  const result = await getDB().query(query, [userId])
  return result.values || []
}