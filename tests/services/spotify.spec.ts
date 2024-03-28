import SpotifyAuth from '@/services/SpotifyAuth'
import { beforeEach, vitest } from 'vitest'
import { assert, expect, test } from 'vitest'
import { JSDOM } from 'jsdom'
import Spotify from '@/services/Spotify'

describe('Spotify service', () => {
  beforeEach(() => {
    const mockCurrentToken = {
      access_token: 'access token'
    }
    SpotifyAuth.currentToken = mockCurrentToken
  })

  it('should create playlist', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({ id: 'mock-playlist-id' })
    })

    const playlistName = 'playlist name'
    const playlistId = await Spotify.createPlaylist(playlistName)

    expect(global.fetch).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/users/${import.meta.env.VITE_SPOTIFY_USER_ID}/playlists`,
      {
        method: 'POST',
        body: JSON.stringify({ name: playlistName }),
        headers: { Authorization: 'Bearer access token' }
      }
    )

    expect(playlistId).toBe('mock-playlist-id')
  })

  it('should add songs to playlist', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(['1', '2', '3', '4', '5'])
    })

    const playlistId = 'test id'
    const uris = ['url1', 'url2', 'url3', 'url4', 'url5']
    const songIds = await Spotify.addSongsToPlaylist(playlistId, uris)

    expect(window.fetch).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      expect.objectContaining({
        method: 'Post',
        headers: { Authorization: 'Bearer access token' },
        body: JSON.stringify({
          uris: uris
        })
      })
    )

    expect(songIds).toEqual(['1', '2', '3', '4', '5'])
  })

  it('should search song', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        tracks: {
          items: [
            {
              uri: '1'
            },
            {
              uri: '2'
            },
            {
              uri: '3'
            },
            {
              uri: '4'
            },
            {
              uri: '5'
            }
          ]
        }
      })
    })

    const testSong = 'test song'
    const testArtist = 'test artist'
    const uri = await Spotify.searchSong(testSong, testArtist)

    expect(window.fetch).toHaveBeenCalledWith(
      `https://api.spotify.com/v1/search?q=${testSong} ${testArtist}&type=track&limit=5`,
      expect.objectContaining({
        method: 'Get',
        headers: { Authorization: 'Bearer access token' }
      })
    )

    expect(typeof uri).toBe('string')
  })

  it('should search songs', async () => {
    const testSongs = [
      { song: 'Song 1', artist: 'Artist 1' },
      { song: 'Song 2', artist: 'Artist 2' },
      { song: 'Song 3', artist: 'Artist 3' }
    ]
    const mockUriList = ['uri1', 'uri2', 'uri3']
    vi.spyOn(Spotify, 'searchSong')
      .mockResolvedValueOnce('uri1')
      .mockResolvedValueOnce('uri2')
      .mockResolvedValueOnce('uri3')

    const result = await Spotify.searchSongs(testSongs)

    expect(result).toEqual(mockUriList)
    expect(Spotify.searchSong).toHaveBeenCalledTimes(3)
    testSongs.forEach((song, index) => {
      expect(Spotify.searchSong).toHaveBeenCalledWith(song.song, song.artist)
    })
  })
})
