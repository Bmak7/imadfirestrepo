import { openDB } from 'idb'

const DB_NAME = 'enterprise-qcm-local-db'
const DB_VERSION = 2

export const ROLES = {
  admin: 'admin',
  chef: 'chef',
}

let dbPromise
let seedPromise

function createId(prefix) {
  if (crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' })
          usersStore.createIndex('email', 'email', { unique: true })
          usersStore.createIndex('role', 'role')
        }

        if (!db.objectStoreNames.contains('campaigns')) {
          db.createObjectStore('campaigns', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('responses')) {
          db.createObjectStore('responses', { keyPath: 'id' })
        }
      },
    })
  }

  return dbPromise
}

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const db = await getDb()
      const adminEmail = 'admin1@gmail.com'
      const existingAdmin = await db.getFromIndex('users', 'email', adminEmail)

      if (!existingAdmin) {
        await db.put('users', {
          id: 'admin-default',
          role: ROLES.admin,
          name: 'Administrator',
          email: adminEmail,
          password: 'admin@123',
          department: 'Direction',
          createdAt: new Date().toISOString(),
        })
      }
    })()
  }

  await seedPromise
}

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

export async function authenticateUser({ email, password, role }) {
  await ensureSeedData()
  const db = await getDb()
  const normalizedEmail = normalizeEmail(email)
  const user = await db.getFromIndex('users', 'email', normalizedEmail)

  if (!user || user.password !== password || user.role !== role) {
    throw new Error('Email, mot de passe ou role invalide.')
  }

  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    department: user.department,
  }
}

export async function getUserById(userId) {
  await ensureSeedData()
  const db = await getDb()
  const user = await db.get('users', userId)

  if (!user) {
    return null
  }

  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    department: user.department,
  }
}

export async function listChefAccounts() {
  await ensureSeedData()
  const db = await getDb()
  const chefs = await db.getAllFromIndex('users', 'role', ROLES.chef)
  return chefs
    .map((chef) => ({
      id: chef.id,
      role: chef.role,
      name: chef.name,
      email: chef.email,
      department: chef.department,
      createdAt: chef.createdAt,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function createChefAccount(payload) {
  await ensureSeedData()
  const db = await getDb()

  const email = normalizeEmail(payload.email)
  const existingUser = await db.getFromIndex('users', 'email', email)

  if (existingUser) {
    throw new Error('Cet email existe deja.')
  }

  const chef = {
    id: createId('chef'),
    role: ROLES.chef,
    name: payload.name.trim(),
    department: payload.department.trim(),
    email,
    password: payload.password,
    createdAt: new Date().toISOString(),
  }

  await db.put('users', chef)

  return {
    id: chef.id,
    role: chef.role,
    name: chef.name,
    email: chef.email,
    department: chef.department,
    createdAt: chef.createdAt,
  }
}

export async function createCampaign(payload) {
  await ensureSeedData()
  const db = await getDb()

  const campaign = {
    id: createId('campaign'),
    title: payload.title.trim(),
    description: payload.description.trim(),
    isAssignedToAll: payload.isAssignedToAll,
    assignedChefIds: payload.isAssignedToAll ? [] : payload.assignedChefIds,
    createdBy: payload.createdBy,
    createdAt: new Date().toISOString(),
    questionnaireCode: 'climat-social-2026',
  }

  await db.put('campaigns', campaign)
  return campaign
}

export async function listCampaigns() {
  await ensureSeedData()
  const db = await getDb()
  const campaigns = await db.getAll('campaigns')
  return campaigns.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function getCampaignById(campaignId) {
  await ensureSeedData()
  const db = await getDb()
  return db.get('campaigns', campaignId)
}

export async function listResponses() {
  await ensureSeedData()
  const db = await getDb()
  const responses = await db.getAll('responses')
  return responses.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

export async function submitSurveyResponse(payload) {
  await ensureSeedData()
  const db = await getDb()
  const campaign = await db.get('campaigns', payload.campaignId)

  if (!campaign) {
    throw new Error('Campagne introuvable.')
  }

  if (
    !campaign.isAssignedToAll &&
    !campaign.assignedChefIds.includes(payload.chefId)
  ) {
    throw new Error("Ce Chef de Service n'est pas assigne a cette campagne.")
  }

  const response = {
    id: createId('response'),
    campaignId: payload.campaignId,
    chefId: payload.chefId,
    employeeName: payload.employeeName.trim(),
    generalData: {
      chantier: payload.generalData.chantier.trim(),
      poste: payload.generalData.poste.trim(),
      seniority: payload.generalData.seniority,
    },
    likertAnswers: payload.likertAnswers,
    openAnswers: {
      strengths: payload.openAnswers.strengths.trim(),
      priorities: payload.openAnswers.priorities.trim(),
      suggestions: payload.openAnswers.suggestions.trim(),
    },
    submittedAt: new Date().toISOString(),
  }

  await db.put('responses', response)
  return response
}
