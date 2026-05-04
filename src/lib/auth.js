import { authenticateUser, getUserById } from './db'

const SESSION_KEY = 'enterprise-qcm-session'

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export async function login({ email, password, role }) {
  const user = await authenticateUser({ email, password, role })
  writeSession({
    userId: user.id,
    role: user.role,
  })
  return user
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function restoreUserFromSession() {
  const session = readSession()

  if (!session?.userId) {
    return null
  }

  return getUserById(session.userId)
}
