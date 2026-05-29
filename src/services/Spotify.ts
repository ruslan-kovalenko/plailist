import type { Song } from '@/types/Song'
import type { IMusicServiceStatic } from '@/services/IMusicService'
import { SpotifyAuth } from './SpotifyAuth'

class Spotify extends SpotifyAuth {
  static async spotifyFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const hasValidToken = await this.ensureValidToken()
    if (!hasValidToken || !this.currentToken?.accessToken) {
      throw new Error('Spotify access token is not available')
    }

    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: 'Bearer ' + this.currentToken.accessToken,
        ...init.headers
      }
    })

    if (!response.ok) {
      const message = (await response.text()).trim()
      throw new Error(message || `Spotify API error ${response.status}`)
    }

    return response
  }

  static async createPlaylist(playlistName: string): Promise<string> {
    const response = await this.spotifyFetch(
      `${import.meta.env.VITE_SPOTIFY_BASE_API}/users/${import.meta.env.VITE_SPOTIFY_USER_ID}/playlists`,
      {
        method: 'POST',
        body: JSON.stringify({ name: playlistName }),
        headers: { 'Content-Type': 'application/json' }
      }
    )

    const data = await response.json()

    return data.id
  }

  static async addSongsToPlaylist(playlistId: string, uris: string[]): Promise<void> {
    await this.spotifyFetch(
      `${import.meta.env.VITE_SPOTIFY_BASE_API}/playlists/${playlistId}/tracks`,
      {
        method: 'POST',
        body: JSON.stringify({ uris }),
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  static async searchSong(songName: string, artist: string): Promise<string> {
    const params = new URLSearchParams({
      q: `${songName} ${artist}`,
      type: 'track',
      limit: '5'
    })

    const response = await this.spotifyFetch(
      `${import.meta.env.VITE_SPOTIFY_BASE_API}/search?${params.toString()}`,
      { method: 'GET' }
    )

    const tracksInfo = await response.json()
    const guessList = tracksInfo.tracks?.items ?? []

    if (!guessList.length) return ''

    return guessList[0].uri
  }

  static async searchSongs(songs: Song[]): Promise<string[]> {
    if (!songs.length) return []

    const songsPromises = songs.map((song: Song) => this.searchSong(song.song, song.artist))

    return Promise.all(songsPromises)
  }
}

const spotifyService: IMusicServiceStatic = Spotify

export default spotifyService
