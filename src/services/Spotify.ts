import type { Song } from '@/types/Song'
import type IMusicService from '@/services/IMusicService'
import SpotifyAuth from './SpotifyAuth'

class Spotify extends SpotifyAuth implements IMusicService {
  static async createPlaylist(playlistName: string): string {
    const response = await fetch(
      `https://api.spotify.com/v1/users/${import.meta.env.VITE_SPOTIFY_USER_ID}/playlists`,
      {
        method: 'POST',
        body: JSON.stringify({ name: playlistName }),
        headers: { Authorization: 'Bearer ' + this.currentToken.access_token }
      }
    )

    const data = await response.json()

    return data.id
  }

  static async addSongsToPlaylist(playlistId: string, uris: string[]): string[] {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: 'Post',
      body: JSON.stringify({
        uris: uris
      }),
      headers: { Authorization: 'Bearer ' + this.currentToken.access_token }
    })

    const data = await response.json()

    return data
  }

  static async searchSong(songName: string, artist: string): string {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${songName} ${artist}&type=track&limit=5`,
      {
        method: 'Get',
        headers: { Authorization: 'Bearer ' + this.currentToken.access_token }
      }
    )

    const tracksInfo = await response.json()
    const guessList = tracksInfo.tracks.items

    if (!guessList.length) return ''

    return guessList[0].uri
  }

  static async searchSongs(songs: Song[]): string[] {
    const songsPromises = songs.map((song: Song) => this.searchSong(song.song, song.artist))
    const songUris = Promise.all(songsPromises)

    return songUris
  }
}

export default Spotify
