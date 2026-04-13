const AUTH_BASE = 'https://auth.samilososami.com'
const ACCOUNTS_BASE = 'https://accounts.samilososami.com'

export interface SamiAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
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
}

export class SamiAuth {
  private clientId: string
  private clientSecret: string
  private redirectUri: string

  constructor(config: SamiAuthConfig) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
  }

  /**
   * Returns the URL to redirect the user to for authorization.
   * Use this to build your "Sign in with Sami ID" button.
   *
   * @example
   * const url = samiAuth.getAuthUrl({ state: 'random-csrf-token' })
   * res.redirect(url)
   */
  getAuthUrl(options: AuthUrlOptions = {}): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
    })
    if (options.state) params.set('state', options.state)
    return `${AUTH_BASE}/authorize?${params.toString()}`
  }

  /**
   * Exchanges an authorization code for an access token.
   * Call this from your /callback endpoint.
   *
   * @example
   * const { access_token } = await samiAuth.exchangeCode(req.query.code)
   */
  async exchangeCode(code: string): Promise<TokenResponse> {
    const res = await fetch(`${AUTH_BASE}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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

  /**
   * Returns the authenticated user's profile.
   *
   * @example
   * const user = await samiAuth.getUser(access_token)
   * console.log(user.email)
   */
  async getUser(accessToken: string): Promise<UserInfo> {
    const res = await fetch(`${AUTH_BASE}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error fetching user')
    return data as UserInfo
  }
}

/**
 * Browser-side helper — redirects the user to the Sami ID login page.
 * Use in client-side apps (React, vanilla JS, etc.)
 *
 * @example
 * <button onClick={() => samiIdLogin({ clientId: 'my-app', redirectUri: 'https://myapp.com/callback' })}>
 *   Sign in with Sami ID
 * </button>
 */
export function samiIdLogin(config: { clientId: string; redirectUri: string; state?: string }) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
  })
  if (config.state) params.set('state', config.state)
  window.location.href = `${AUTH_BASE}/authorize?${params.toString()}`
}

export default SamiAuth
