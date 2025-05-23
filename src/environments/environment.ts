// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl:"https://api-dev.montylocal.net/contents",
  apiUrlConfig:"https://api-dev.montylocal.net/configurations",
  oauthApi: 'https://iam-dev.montylocal.net/realms/integration-dev/protocol/openid-connect/token',
  client_id: 'cms-service',
  grant_type: 'password',
  client_secret: 'pxOcCcfRBti1SCQUP2cxKhdAITJTDKTL'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
