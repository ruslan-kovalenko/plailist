import type { Song } from '@/types/Song'

export default interface IMusicService {
  searchSongs(songs: Song[]): string[]
  createPlaylist(playlistName: string): string
  addSongsToPlaylist(playlistId: string, uris: string[]): string[]
}
