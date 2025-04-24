export enum TokenStatus {
    PENDING = 'PENDING',
    VALIDATING = 'VALIDATING',
    VALID = 'VALID',
    INVALID = 'INVALID',
  }
  
  export interface AuthState {
    user?: AuthUser;
    sessionId: string;
    accessToken: string;
    refreshToken: string;
  }
  
  export interface AuthUser {
    id: number;
    firstName: string;
    lastName: string;
  }
  