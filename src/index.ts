export const SAMI_AUTH_BASE = 'https://auth.samilososami.com'
export const SAMI_ID_BASE = 'https://id.samilososami.com'

export const SAMI_ID_ASSETS = {
  icon: `${SAMI_ID_BASE}/brand/sami-id-icon.png`,
  full: `${SAMI_ID_BASE}/brand/sami-id-full.png`,
} as const

export interface SamiAuthConfig {
  clientId: string
  clientSecret?: string
  redirectUri: string
  authBaseUrl?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface UserInfo {
  id: string
  email: string
  name?: string
  surname?: string
  username?: string
}

export interface AuthUrlOptions {
  state?: string
  scope?: string
  responseType?: 'code'
}

export interface BrowserLoginConfig {
  clientId: string
  redirectUri: string
  state?: string
  scope?: string
  authBaseUrl?: string
}

export interface LoginButtonOptions {
  label?: string
  variant?: 'full' | 'icon'
  className?: string
}

function authBase(config?: { authBaseUrl?: string }) {
  return (config?.authBaseUrl || SAMI_AUTH_BASE).replace(/\/+$/, '')
}

export function generateSamiState(length = 32): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  const bytes = new Uint8Array(length)

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export function buildSamiAuthUrl(config: BrowserLoginConfig, options: AuthUrlOptions = {}): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: options.responseType || 'code',
    scope: options.scope || config.scope || 'profile email',
  })

  const state = options.state || config.state
  if (state) params.set('state', state)

  return `${authBase(config)}/authorize?${params.toString()}`
}

export class SamiAuth {
  private clientId: string
  private clientSecret?: string
  private redirectUri: string
  private authBaseUrl: string

  constructor(config: SamiAuthConfig) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
    this.authBaseUrl = authBase(config)
  }

  getAuthUrl(options: AuthUrlOptions = {}): string {
    return buildSamiAuthUrl({
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      authBaseUrl: this.authBaseUrl,
    }, options)
  }

  async exchangeCode(code: string): Promise<TokenResponse> {
    if (!this.clientSecret) {
      throw new Error('clientSecret is required to exchange an authorization code on the server')
    }

    const res = await fetch(`${this.authBaseUrl}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error exchanging code')
    return data as TokenResponse
  }

  async getUser(accessToken: string): Promise<UserInfo> {
    const res = await fetch(`${this.authBaseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error fetching user')
    return data as UserInfo
  }
}

export function samiIdLogin(config: BrowserLoginConfig, options: AuthUrlOptions = {}) {
  window.location.href = buildSamiAuthUrl(config, options)
}

export function getSamiLoginButtonHtml(authUrl: string, options: LoginButtonOptions = {}): string {
  const variant = options.variant || 'full'
  const label = options.label || 'Iniciar sesión con Sami ID'
  const image = variant === 'icon' ? SAMI_ID_ASSETS.icon : SAMI_ID_ASSETS.full
  const className = options.className ? ` class="${options.className}"` : ''
  const alt = variant === 'icon' ? 'Sami ID' : label

  return `<a${className} href="${authUrl}" aria-label="${label}"><img src="${image}" alt="${alt}" /></a>`
}

export default SamiAuth
