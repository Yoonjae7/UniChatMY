import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// In-memory storage for development when PostgreSQL is not available
const inMemoryStore = {
  users: new Map<string, User>(),
  verificationCodes: new Map<string, VerificationCode>(),
  sessions: new Map<string, Session>(),
}

interface User {
  id: string
  email: string
  email_domain: string
  university_name: string
  country_code: string
  verified_at: Date | null
  created_at: Date
}

interface VerificationCode {
  id: string
  email: string
  code: string
  expires_at: Date
  used: boolean
  created_at: Date
}

interface Session {
  id: string
  user_id: string
  pseudonym: string
  socket_id: string | null
  status: string
  matched_with: string | null
  room_id: string | null
  created_at: Date
}

let pool: pg.Pool | null = null
let useInMemory = false

export async function initDatabase() {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unichat',
    })
    
    const client = await pool.connect()
    
    try {
      // Create tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          email_domain VARCHAR(255) NOT NULL,
          university_name VARCHAR(255) NOT NULL,
          country_code VARCHAR(10) NOT NULL,
          verified_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS verification_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL,
          code VARCHAR(6) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          pseudonym VARCHAR(100) NOT NULL,
          socket_id VARCHAR(255),
          status VARCHAR(50) DEFAULT 'online',
          matched_with UUID,
          room_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_country ON users(country_code);
        CREATE INDEX IF NOT EXISTS idx_verification_email ON verification_codes(email);
        CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_socket ON sessions(socket_id);
      `)
      
      console.log('✅ PostgreSQL database initialized')
    } finally {
      client.release()
    }
  } catch (error) {
    console.log('⚠️  PostgreSQL not available, using in-memory storage')
    console.log('   To use PostgreSQL, set DATABASE_URL in server/.env')
    useInMemory = true
    pool = null
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export async function query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }> {
  if (!useInMemory && pool) {
    return pool.query(text, params)
  }
  
  // In-memory query simulation
  const normalizedText = text.trim().toLowerCase()
  
  // INSERT INTO verification_codes
  if (normalizedText.includes('insert into verification_codes')) {
    const id = generateId()
    const code: VerificationCode = {
      id,
      email: params?.[0] as string,
      code: params?.[1] as string,
      expires_at: params?.[2] as Date,
      used: false,
      created_at: new Date(),
    }
    inMemoryStore.verificationCodes.set(id, code)
    return { rows: [code] }
  }
  
  // UPDATE verification_codes SET used = TRUE WHERE email
  if (normalizedText.includes('update verification_codes set used = true where email')) {
    const email = params?.[0] as string
    for (const code of inMemoryStore.verificationCodes.values()) {
      if (code.email === email && !code.used) {
        code.used = true
      }
    }
    return { rows: [] }
  }
  
  // UPDATE verification_codes SET used = TRUE WHERE id
  if (normalizedText.includes('update verification_codes set used = true where id')) {
    const id = params?.[0] as string
    const code = inMemoryStore.verificationCodes.get(id)
    if (code) {
      code.used = true
    }
    return { rows: [] }
  }
  
  // SELECT FROM verification_codes
  if (normalizedText.includes('select') && normalizedText.includes('from verification_codes')) {
    const email = params?.[0] as string
    const codeStr = params?.[1] as string
    const now = new Date()
    
    for (const code of inMemoryStore.verificationCodes.values()) {
      if (code.email === email && code.code === codeStr && !code.used && code.expires_at > now) {
        return { rows: [code] }
      }
    }
    return { rows: [] }
  }
  
  // SELECT FROM users WHERE email
  if (normalizedText.includes('select') && normalizedText.includes('from users where email')) {
    const email = params?.[0] as string
    for (const user of inMemoryStore.users.values()) {
      if (user.email === email) {
        return { rows: [user] }
      }
    }
    return { rows: [] }
  }
  
  // SELECT FROM users WHERE id
  if (normalizedText.includes('select') && normalizedText.includes('from users where id')) {
    const id = params?.[0] as string
    const user = inMemoryStore.users.get(id)
    return { rows: user ? [user] : [] }
  }
  
  // INSERT INTO users
  if (normalizedText.includes('insert into users')) {
    const id = generateId()
    const user: User = {
      id,
      email: params?.[0] as string,
      email_domain: params?.[1] as string,
      university_name: params?.[2] as string,
      country_code: params?.[3] as string,
      verified_at: new Date(),
      created_at: new Date(),
    }
    inMemoryStore.users.set(id, user)
    return { rows: [user] }
  }
  
  // UPDATE users SET verified_at
  if (normalizedText.includes('update users set verified_at')) {
    const id = params?.[0] as string
    const user = inMemoryStore.users.get(id)
    if (user) {
      user.verified_at = new Date()
    }
    return { rows: [] }
  }
  
  return { rows: [] }
}
