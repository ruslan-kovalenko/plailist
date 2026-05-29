import { gapi as gapiTypes, loadGapiInsideDOM } from 'gapi-script'
import type { IAuthServiceStatic } from '@/services/IAuthService'

type Gapi = typeof gapiTypes

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES =
  'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube'

class YoutubeAuth {
  static isClientInitialized = false

  static async getGapi(): Promise<Gapi> {
    if (typeof window !== 'undefined' && (window as Window & { gapi?: Gapi }).gapi?.load) {
      return (window as unknown as Window & { gapi: Gapi }).gapi
    }
    return loadGapiInsideDOM()
  }

  static async initAuth2(): Promise<boolean> {
    const gapi = await this.getGapi()

    await new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', {
        callback: () => resolve(),
        onerror: reject
      })
    })

    await gapi.client.init({
      clientId: CLIENT_ID,
      scope: SCOPES,
      plugin_name: 'PlaylistsAI'
    })

    const authInstance = gapi.auth2.getAuthInstance()

    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn({ prompt: 'select_account' })
    }

    return authInstance.isSignedIn.get()
  }

  static async loadYoutubeApiClient(): Promise<void> {
    const gapi = await this.getGapi()
    await gapi.client.load(
      'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
    )
  }

  static async initClient(): Promise<boolean> {
    try {
      const signedIn = await this.initAuth2()
      if (!signedIn) return false

      await this.loadYoutubeApiClient()
      console.log('YouTube auth: initClient success')
      this.isClientInitialized = true
      return true
    } catch (error) {
      const err = error as { error?: string; details?: string }
      if (err?.error === 'popup_closed_by_user') {
        console.warn('YouTube auth: popup closed')
        return false
      }
      console.error('YouTube auth error:', error)
      return false
    }
  }
}

const youtubeAuth: IAuthServiceStatic = YoutubeAuth

export { YoutubeAuth }
export default youtubeAuth
