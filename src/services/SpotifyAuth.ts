import type { SpotifyToken } from '@/types/SpotifyToken'
import type { IAuthServiceStatic } from '@/services/IAuthService'

type CurrentToken = {
  accessToken: string | null
  refreshToken: string | null
  expiresIn: string | null
  expires: string | null
  save: (token: SpotifyToken) => void
}

class SpotifyAuth {
  static clientId: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  static redirectUrl: string = import.meta.env.VITE_SPOTIFY_CALLBACK_URL
  static meUrl: string = import.meta.env.VITE_SPOTIFY_ME_URL
  static authorizationEndpoint: string = import.meta.env.VITE_SPOTIFY_AUTH_ENDPOINT
  static tokenEndpoint: string = import.meta.env.VITE_SPOTIFY_TOKEN_ENDPOINT
  static scope: string = 'playlist-modify-public playlist-modify-private'
  static currentToken: CurrentToken | null = null

  static getExpiryDate(expiresIn: unknown): Date {
    const seconds = Number(expiresIn)
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error(`Invalid expiresIn value: ${String(expiresIn)}`)
    }

    return new Date(Date.now() + seconds * 1000)
  }

  static async init(): Promise<string | null> {
    this.currentToken = {
      accessToken: localStorage.getItem('access_token') || null,
      refreshToken: localStorage.getItem('refresh_token') || null,
      expiresIn: localStorage.getItem('expires_in') || null,
      expires: localStorage.getItem('expires') || null,
      save: (token: SpotifyToken) => {
        const accessToken = token.access_token
        const expiresIn = token.expires_in
        const refreshToken = token.refresh_token ?? this.currentToken?.refreshToken ?? null

        if (!accessToken || !refreshToken) return

        const expiry = SpotifyAuth.getExpiryDate(expiresIn)
        const expiresIso = expiry.toISOString()

        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('expires_in', String(expiresIn))
        localStorage.setItem('expires', expiresIso)

        const currentToken = this.currentToken
        if (!currentToken) return

        currentToken.accessToken = accessToken
        currentToken.refreshToken = refreshToken
        currentToken.expiresIn = String(expiresIn)
        currentToken.expires = expiresIso
      }
    }

    const args = new URLSearchParams(window.location.search)
    const code = args.get('code')

    if (code) {
      const token = await this.getToken(code)
      this.currentToken?.save(token)

      const url = new URL(window.location.href)
      url.searchParams.delete('code')

      const updatedUrl = url.search ? url.href : url.href.replace('?', '')
      window.history.replaceState({}, document.title, updatedUrl)
    }

    return code
  }

  static async initClient(): Promise<boolean> {
    const hasValidToken = await this.ensureValidToken()

    if (hasValidToken) return true

    this.loginWithSpotifyClick()

    return false
  }

  static async getToken(code: string): Promise<SpotifyToken> {
    const codeVerifier = localStorage.getItem('code_verifier')
    if (!codeVerifier) throw new Error('Missing PKCE code_verifier')

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUrl,
        code_verifier: codeVerifier
      })
    })

    const token = (await response.json()) as SpotifyToken & {
      error?: string
      error_description?: string
    }

    if (!response.ok) {
      throw new Error(token.error_description ?? token.error ?? `Token request failed (${response.status})`)
    }

    if (!token.access_token || token.expires_in == null) {
      throw new Error('Invalid token response from Spotify')
    }

    return token
  }

  /** Loads tokens and refreshes access token when expired. */
  static async ensureValidToken(): Promise<boolean> {
    await this.init()

    const accessToken = this.currentToken?.accessToken
    const refreshToken = this.currentToken?.refreshToken
    const expires = this.currentToken?.expires

    if (!accessToken || !refreshToken) return false

    const isExpired = !expires || new Date() > new Date(expires)
    if (!isExpired) return true

    return this.refreshToken()
  }

  static async refreshToken(): Promise<boolean> {
    try {
      if (!this.currentToken?.refreshToken) throw new Error('Missing refresh token')

      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'refresh_token',
          refresh_token: this.currentToken.refreshToken
        })
      })

      const token = (await response.json()) as SpotifyToken & {
        error?: string
        error_description?: string
      }

      if (!response.ok) {
        throw new Error(token.error_description ?? token.error ?? `Refresh failed (${response.status})`)
      }

      if (!token.access_token || token.expires_in == null) {
        throw new Error('Invalid refresh response from Spotify')
      }

      this.currentToken.save({
        ...token,
        refresh_token: token.refresh_token ?? this.currentToken.refreshToken
      })

      return this.currentToken.accessToken != null
    } catch (err) {
      console.log('Refresh token error: ', err)
      return false
    }
  }

  static async loginWithSpotifyClick(): Promise<void> {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(64))
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '')

    const codeVerifier = randomString
    const data = new TextEncoder().encode(codeVerifier)
    const hashed = await crypto.subtle.digest('SHA-256', data)

    const codeChallengeBase64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    localStorage.setItem('code_verifier', codeVerifier)

    const authUrl = new URL(this.authorizationEndpoint)
    const params = {
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallengeBase64,
      redirect_uri: this.redirectUrl
    }

    authUrl.search = new URLSearchParams(params).toString()
    window.location.href = authUrl.toString()
  }
}

const spotifyAuth: IAuthServiceStatic = SpotifyAuth

export { SpotifyAuth }
export default spotifyAuth
