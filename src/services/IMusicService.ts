import type { Song } from '@/types/Song'

export default interface IMusicService {
  searchSong(songName: string, artist: string): Promise<string>
  searchSongs(songs: Song[]): Promise<string[]>
  createPlaylist(playlistName: string): Promise<string>
  addSongsToPlaylist(playlistId: string, uris: string[]): Promise<void>
}

export interface IMusicServiceStatic extends IMusicService {}