import { AuthConfig } from "angular-oauth2-oidc";
import { environment } from "environments/environment";


export const authConfig: AuthConfig = {
  issuer: environment.oauthApi,
  redirectUri: `${window.location.origin}/`,
  useSilentRefresh: false,
  silentRefreshTimeout: 0,
  clientId: environment.client_id,
  responseType: 'code',
  scope: 'openid profile',
  showDebugInformation: true,
  timeoutFactor: 0.25,
  requireHttps: true,
  sessionChecksEnabled: false,
  clearHashAfterLogin: false, // https://github.com/manfredsteyer/angular-oauth2-oidc/issues/457#issuecomment-431807040,
  nonceStateSeparator: 'semicolon'
};
