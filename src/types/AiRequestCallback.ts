import type { ServiceType } from '@/types/ServiceType'

export type AiRequestCallback = (input: string) => Promise<boolean>

export type SetServiceCallback = (service: ServiceType) => Promise<void>
