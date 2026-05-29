import { ServiceType } from '@/types/ServiceType'
import type { IMusicServiceStatic } from '@/services/IMusicService'
import Spotify from '@/services/Spotify'
import YM from '@/services/Youtube'
import SpotifyAuth from '@/services/SpotifyAuth'
import YoutubeAuth from '@/services/YoutubeAuth'

export async function createMusicService(type: ServiceType): Promise<IMusicServiceStatic | null> {
  switch (type) {
    case ServiceType.Spotify:
      if (!(await SpotifyAuth.initClient())) return null
      return Spotify

    case ServiceType.Youtube:
      if (!(await YoutubeAuth.initClient())) return null
      return YM

    default:
      return null
  }
}
