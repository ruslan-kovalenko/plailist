import { gapi } from 'gapi-script'
import type { Song } from '@/types/Song'
import type { IMusicServiceStatic } from './IMusicService'
import { YoutubeAuth } from './YoutubeAuth'

class YM extends YoutubeAuth {
  static async createPlaylist(playlistName: string): Promise<string> {
    let playlistId = ''

    try {
      const playlistData = await gapi.client.youtube.playlists.insert({
        part: ['snippet,status'],
        resource: {
          snippet: {
            title: `${playlistName}`,
            description: "Ruslan's new playlist description."
          }
        }
      })

      playlistId = playlistData.result.id
    } catch (err) {
      console.error('Execute error', err)
    }

    return playlistId
  }

  static async addSongsToPlaylist(playlistId: string, ids: string[]): Promise<void> {
    const validIds = [...new Set(ids.filter(Boolean))]

    for (const videoId of validIds) {
      await gapi.client.youtube.playlistItems.insert({
        part: ['snippet'],
        resource: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId
            }
          }
        }
      })
    }
  }

  static async searchSongs(songs: Song[]): Promise<string[]> {
    if (!songs.length) return []

    const songsPromises = songs.map((song: Song) => this.searchSong(song.song, song.artist))
    const songIds = Promise.all(songsPromises)

    return songIds
  }

  static async searchSong(songName: string, artist: string): Promise<string> {
    let songId = ''

    try {
      const songGuess = await gapi.client.youtube.search.list({
        part: ['snippet'],
        q: `${songName} ${artist}`,
        type: 'video'
      })
      const list = songGuess.result.items

      if (!list.length) return songId

      songId = list[0].id.videoId
    } catch (err) {
      console.error('Execute error', err)
    }

    return songId
  }
}

const youtubeMusicService: IMusicServiceStatic = YM

export default youtubeMusicService
