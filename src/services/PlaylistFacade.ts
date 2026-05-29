import type { IMusicServiceStatic } from '@/services/IMusicService'
import { createMusicService } from '@/services/MusicServiceFactory'
import { ServiceType } from '@/types/ServiceType'
import Ai from './Ai'

class PlaylistFacade {
  static musicService: IMusicServiceStatic | null = null

  static async useService(type: ServiceType): Promise<boolean> {
    const service = await createMusicService(type)

    if (!service) return false

    this.musicService = service

    return true
  }

  static async createPlaylist(input: string): Promise<boolean> {
    if (!this.musicService) return false

    try {
      const songs = await Ai.generatePlaylist(input, 10)
      const songsUris = await this.musicService.searchSongs(songs)
      const newPlaylist = await this.musicService.createPlaylist(input)
      await this.musicService.addSongsToPlaylist(newPlaylist, songsUris)
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }
}

export default PlaylistFacade
