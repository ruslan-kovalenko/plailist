import Spotify from './Spotify'

class SpotifyAuth {
  static clientId: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  static redirectUrl: string = import.meta.env.VITE_SPOTIFY_CALLBACK_URL
  static authorizationEndpoint: string = import.meta.env.VITE_SPOTIFY_AUTH_ENDPOINT
  static tokenEndpoint: string = import.meta.env.VITE_SPOTIFY_TOKEN_ENDPOINT
  static scope: string = 'playlist-modify-public playlist-modify-private'
  static currentToken: object | null = null

  static async init() {
    this.currentToken = {
      access_token: localStorage.getItem('access_token') || null,
      refresh_token: localStorage.getItem('refresh_token') || null,
      expires_in: localStorage.getItem('refresh_in') || null,
      expires: localStorage.getItem('expires') || null,
      save: (response) => {
        const { access_token, refresh_token, expires_in } = response
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        localStorage.setItem('expires_in', expires_in)

        const now = new Date()
        const expiry = new Date(now.getTime() + expires_in * 1000)
        localStorage.setItem('expires', expiry)
      }
    }

    const args = new URLSearchParams(window.location.search)
    const code = args.get('code')

    if (code) {
      const token = await this.getToken(code)
      this.currentToken.save(token)

      const url = new URL(window.location.href)
      url.searchParams.delete('code')

      const updatedUrl = url.search ? url.href : url.href.replace('?', '')
      window.history.replaceState({}, document.title, updatedUrl)
    }

    return code
  }

  static async getToken(code: string): Promise<SpotifyToken> {
    const code_verifier = localStorage.getItem('code_verifier')

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
        code_verifier
      })
    })

    const token = await response.json()

    return token
  }

  static isTokenExpired(): boolean {
    this.init()

    const tokenExpiresDate = localStorage.getItem('expires')
    const token = localStorage.getItem('access_token')

    if (!tokenExpiresDate || !token) return true

    const expiresDate = new Date(tokenExpiresDate)
    const currentDate = new Date()
    const isExpired = currentDate > expiresDate

    if (isExpired) {
      return !this.refreshToken()
    } else {
      return isExpired
    }
  }

  static async refreshToken(): boolean {
    let updated = false

    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'refresh_token',
          refresh_token: this.currentToken.refresh_token
        })
      })

      const token = await response.json()
      this.currentToken.save(token)
      updated = true
    } catch (err) {
      console.log('Refresh token error: ', err)
      updated = false
    } finally {
      console.log('refreshToken finally')
      return updated
    }
  }

  static async loginWithSpotifyClick(): void {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(64))
    const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], '')

    const code_verifier = randomString
    const data = new TextEncoder().encode(code_verifier)
    const hashed = await crypto.subtle.digest('SHA-256', data)

    const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    window.localStorage.setItem('code_verifier', code_verifier)

    const authUrl = new URL(this.authorizationEndpoint)
    const params = {
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scope,
      code_challenge_method: 'S256',
      code_challenge: code_challenge_base64,
      redirect_uri: this.redirectUrl
    }

    authUrl.search = new URLSearchParams(params).toString()
    window.location.href = authUrl.toString()
  }
}

export default SpotifyAuth
