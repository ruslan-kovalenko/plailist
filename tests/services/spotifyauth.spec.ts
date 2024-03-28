import SpotifyAuth from '@/services/SpotifyAuth'
import { beforeEach, vitest } from 'vitest'
import { assert, expect, test } from 'vitest'
import { JSDOM } from 'jsdom'

function setupFakeLocation(searchParams) {
  const jsdom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost:5173' })
  const { window } = jsdom
  const url = `${window.location.origin}/?${searchParams}`
  window.history.replaceState({}, '', url)
  global.window = window
}

describe('Spotify Auth service', () => {
  it('should return a SpotifyToken object', async () => {
    const accessToken = 'test-token'
    const refreshToken = 'test-refresh-token'

    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scope: 'playlist-read-private'
      })
    })

    const code = 'test-code'
    const token = await SpotifyAuth.getToken(code)

    expect(window.fetch).toHaveBeenCalledWith(
      import.meta.env.VITE_SPOTIFY_TOKEN_ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: expect.any(URLSearchParams)
      })
    )

    expect(token).toEqual({
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: 'playlist-read-private'
    })
  })

  it('should return true if token is successfully refreshed', async () => {
    const newAccessToken = 'new-access-token'
    const newRefreshToken = 'new-refresh-token'
    const currentRefreshToken = 'current-refresh-token'

    const mockTokenResponse = {
      access_token: newAccessToken,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: 'playlist-read-private'
    }
    const mockFetch = vi.fn().mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockTokenResponse)
    })
    window.fetch = mockFetch

    const mockCurrentToken = {
      refresh_token: currentRefreshToken,
      save: vi.fn()
    }
    SpotifyAuth.currentToken = mockCurrentToken

    const result = await SpotifyAuth.refreshToken()

    expect(result).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith(
      SpotifyAuth.tokenEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: expect.any(URLSearchParams)
      })
    )
    expect(mockCurrentToken.save).toHaveBeenCalledWith(mockTokenResponse)
  })

  it('should redirect to authUrl', async () => {
    const mockAuthUrl = SpotifyAuth.authorizationEndpoint
    global.URL = vi.fn().mockImplementation(() => ({
      search: '',
      toString: vi.fn().mockReturnValue(mockAuthUrl)
    }))
    global.window = {
      location: { href: 'http://localhost:5173/' }
    }

    await SpotifyAuth.loginWithSpotifyClick()

    expect(global.window.location.href).toBe(mockAuthUrl)
  })
})
