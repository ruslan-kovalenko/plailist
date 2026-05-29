import type { IAuthServiceStatic } from '@/services/IAuthService'
import SpotifyAuth from '@/services/SpotifyAuth'
import YoutubeAuth from '@/services/YoutubeAuth'
import { ServiceType } from '@/types/ServiceType'

const registry = {
  [ServiceType.Spotify]: SpotifyAuth,
  [ServiceType.Youtube]: YoutubeAuth
} satisfies Record<ServiceType, IAuthServiceStatic>

export function getAuthService(type: ServiceType): IAuthServiceStatic {
  return registry[type]
}
