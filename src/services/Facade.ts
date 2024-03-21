import type IMusicService from '@/services/IMusicService'
import Ai from './Ai'
import Spotify from './Spotify'
import { ServiceType } from '@/types/ServiceType'

class Facade {
  static musicService: IMusicService | null = null

  static async initMusicServiceInstance(): ServiceType | null {
    return await this.isSpotify()
  }

  static async isSpotify(): ServiceType | null {
    const isExpired = await Spotify.isTokenExpired()

    if (!isExpired) {
      this.musicService = Spotify
      return ServiceType.Spotify
    }
  }

  static async createPlaylist(input: string): boolean {
    if (!this.musicService) return false

    let success = false

    try {
      const songs = await Ai.generatePlaylist(input, 10)
      const songsUris = await this.musicService.searchSongs(songs)
      const newPlaylist = await this.musicService.createPlaylist(input)
      const songsAdded = await this.musicService.addSongsToPlaylist(newPlaylist, songsUris)
      success = true
    } catch (err) {
      success = false
      console.log(err)
    } finally {
      return success
    }

    return true
  }
}

export default Facade
