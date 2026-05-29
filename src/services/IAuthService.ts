export default interface IAuthService {
  initClient(): Promise<boolean>
}

export interface IAuthServiceStatic extends IAuthService {}