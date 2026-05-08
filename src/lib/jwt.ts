import { sign, verify, decode } from 'hono/jwt'

const ACCESS_TOKEN_EXPIRY = 40 * 60
const REFRESH_TOKEN_EXPIRY = 14 * 24 * 60 * 60

const getSecret = (): string => {
  return 'default-secret-change-in-production'
}

export const createAccessToken = async (userId: string, email: string, accountType: string): Promise<string> => {
  return sign(
    {
      sub: userId,
      email,
      accountType: accountType || 'Personal',
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
      iat: Math.floor(Date.now() / 1000),
    },
    getSecret(),
    'HS256'
  )
}

export const createRefreshToken = async (userId: string, email: string, accountType: string): Promise<string> => {
  return sign(
    {
      sub: userId,
      email,
      accountType: accountType || 'Personal',
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
      iat: Math.floor(Date.now() / 1000),
    },
    getSecret(),
    'HS256'
  )
}

export const verifyToken = async (token: string) => {
  try {
    const payload = await verify(token, getSecret(), 'HS256')
    return payload
  } catch {
    return null
  }
}

export const decodeToken = (token: string) => {
  const { payload } = decode(token)
  return payload
}

export { verify }

export const getAccessTokenExpiry = (): number => ACCESS_TOKEN_EXPIRY
export const getRefreshTokenExpiry = (): number => REFRESH_TOKEN_EXPIRY