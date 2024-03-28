import Ai from '@/services/Ai'
import { beforeEach, vitest } from 'vitest'
import { assert, expect, test } from 'vitest'

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: vi.fn().mockImplementation(async () => {
            return {
              choices: [
                {
                  message: {
                    content:
                      '[\n    {"song": "Happy", "artist": "Pharrell Williams"},\n    {"song": "Can\'t Stop the Feeling!", "artist": "Justin Timberlake"},\n    {"song": "Walking on Sunshine", "artist": "Katrina and the Waves"},\n    {"song": "I Gotta Feeling", "artist": "The Black Eyed Peas"},\n    {"song": "Good Vibrations", "artist": "The Beach Boys"},\n    {"song": "Best Day of My Life", "artist": "American Authors"},\n    {"song": "Uptown Funk", "artist": "Mark Ronson ft. Bruno Mars"},\n    {"song": "Don\'t Stop Believin\'", "artist": "Journey"},\n    {"song": "Happy Together", "artist": "The Turtles"},\n    {"song": "I\'m a Believer", "artist": "The Monkees"}\n]'
                  }
                }
              ]
            }
          })
        }
      }
    }
  })
}))
const OpenAI = require('openai')

describe('OpenAI service', () => {
  it('Should generate playlist', async () => {
    const prompt = 'Songs for a good mood'
    const count = 10
    const songs = await Ai.generatePlaylist(prompt, count)

    expect(Array.isArray(songs)).toBe(true)
    expect(
      songs.every((song) => typeof song === 'object' && 'song' in song && 'artist' in song)
    ).toBe(true)
    expect(songs.length).toBe(count)
  })
})
