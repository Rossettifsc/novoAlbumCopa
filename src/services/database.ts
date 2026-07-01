import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite'
 
const dbName = 'appdata'
 
let db: SQLiteDBConnection | null = null
let initialized = false
 
const sqliteConnection = new SQLiteConnection(CapacitorSQLite)
 
async function ensureDatabase() {
  if (initialized && db) {
    return
  }
 
  try {
    if (!db) {
      db = await sqliteConnection.createConnection(
        dbName,
        false,
        'no-encryption',
        1,
        false
      )
    }
 
    await db.open()
 
    await db.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        login TEXT NOT NULL UNIQUE,
        senha TEXT
      );
    `)
 
    await db.execute(`
      CREATE TABLE IF NOT EXISTS contatos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT
      );
    `)
 
    initialized = true
 
    console.log('Banco inicializado com sucesso')
  } catch (error) {
    console.error('Erro ao inicializar banco', error)
    throw error
  }
}
 
function getDB() {
  if (!db) {
    throw new Error('Banco de dados ainda não inicializado')
  }
 
  return db
}
 
export async function initDatabase() {
  try {
    await ensureDatabase()
  } catch (error) {
    console.error('Erro ao iniciar DB', error)
    throw error
  }
}
 
/* ==========================
   USUÁRIOS
========================== */
 
export async function addUsuario(
  nome: string,
  login: string,
  senha: string
) {
  await ensureDatabase()
 
  const query =
    'INSERT INTO usuarios (nome, login, senha) VALUES (?, ?, ?);'
 
  await getDB().run(query, [nome, login, senha])
}
 
export async function updateUsuario(
  id: number,
  nome: string,
  login: string,
  senha: string
) {
  await ensureDatabase()
 
  const query =
    'UPDATE usuarios SET nome = ?, login = ?, senha = ? WHERE id = ?;'
 
  await getDB().run(query, [nome, login, senha, id])
}
 
export async function realizarLogin(
  login: string,
  senha: string
) {
  await ensureDatabase()
 
  const query =
    'SELECT * FROM usuarios WHERE login = ? AND senha = ?;'
 
  const result = await getDB().query(query, [login, senha])
 
  return result.values || []
}
 
export async function listUsuarios() {
  await ensureDatabase()
 
  const result = await getDB().query(
    'SELECT id, nome, login FROM usuarios;'
  )
 
  return result.values || []
}
 
export async function findUsuarioById(id: number) {
  await ensureDatabase()
 
  const query =
    'SELECT id, nome, login FROM usuarios WHERE id = ?;'
 
  const result = await getDB().query(query, [id])
 
  return result.values?.[0] || null
}
 
/* ==========================
   CONTATOS
========================== */
 
export async function addContato(
  nome: string,
  email: string,
  telefone: string
) {
  await ensureDatabase()
 
  const query =
    'INSERT INTO contatos (nome, email, telefone) VALUES (?, ?, ?);'
 
  await getDB().run(query, [nome, email, telefone])
}
 
export async function listContatos() {
  await ensureDatabase()
 
  const result = await getDB().query(
    'SELECT * FROM contatos;'
  )
 
  return result.values || []
}
 
export async function deleteContatoById(id: number) {
  await ensureDatabase()
 
  const query =
    'DELETE FROM contatos WHERE id = ?;'
 
  return await getDB().run(query, [id])
}
 
export async function updateContato(
  id: number,
  nome: string,
  email: string,
  telefone: string
) {
  await ensureDatabase()
 
  const query =
    'UPDATE contatos SET nome = ?, email = ?, telefone = ? WHERE id = ?;'
 
  await getDB().run(query, [
    nome,
    email,
    telefone,
    id
  ])
}
 
export async function findContatoById(id: number) {
  await ensureDatabase()
 
  const query =
    'SELECT * FROM contatos WHERE id = ?;'
 
  const result = await getDB().query(query, [id])
 
  return result.values || []
}