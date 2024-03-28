import type { Song } from '@/types/Song'
import OpenAI from 'openai'

class Ai {
  static async generatePlaylist(prompt: string, count: number): Promise<Song[]> {
    let songsJson = []

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      })

      const exampleJson = [
        { song: 'Everybody hurts', artist: 'R.E.M.' },
        { song: 'Nothing else matters', artist: 'Metallica' },
        { song: 'Poison', artist: 'The Prodigy' },
        { song: 'Club Foot', artist: 'Kasabian' },
        { song: 'Starlight', artist: 'Muse' }
      ]

      const messages = [
        {
          role: 'system',
          content: `You are a helpful playlist generating assistant. 
          You should generate a list of songs and their artists according to a text prompt.
          You should return a JSON array, where each element follows this format: {song: <song_title>, artist: <artist_name>}`
        },
        {
          role: 'user',
          content: 'Generate a playlist of 5 songs based in this prompt: songs to walk on the Moon'
        },
        {
          role: 'assistant',
          content: JSON.stringify(exampleJson)
        },
        {
          role: 'user',
          content: `Generate a playlist of ${count} songs based in this prompt: ${prompt}`
        }
      ]

      const response = await openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo'
      })
      const choices = response.choices

      if (!choices.length) return []

      songsJson = JSON.parse(choices[0].message.content)
      return songsJson
    } catch (err) {
      console.error('Error parsing OpenAI response: ', err)
    } finally {
      return songsJson
    }
  }
}

export default Ai
