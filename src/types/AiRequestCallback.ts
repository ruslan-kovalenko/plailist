import IMusicService from '@/services/IMusicService'

export default interface AiRequestCallback {
  (input: string, service: IMusicService): boolean
}
