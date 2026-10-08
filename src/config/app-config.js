export const APP_CONFIG = Object.freeze({
  name: 'TCG Pack Ripper+',
  version: '0.262.0',
  buildId: 'v262-league-internal-qa1',
  saveSchemaVersion: 1,
  assetSchemaVersion: 1,
  cacheVersion: 'tcg-v261-1',
  supabase: Object.freeze({
    projectRef: 'ddeuwrnfmdgvizkrjhii',
    url: 'https://ddeuwrnfmdgvizkrjhii.supabase.co',
    cardArtFunction: 'card-art-v239'
  }),
  featureFlags: Object.freeze({
    modularBoot: true,
    pwa: true,
    collectionWorker: true,
    accountFirstSaves: true,
    binderArtworkCache: true,
    modularBinderV252: true,
    modularPackV253: true,
    revealEngineV253: true,
    revealFxV254: true,
    launchExperienceV2541: true,
    multiplayerArenaV255: false,
    globalChatV255: false,
    tradeHubV256: true,
    nativeShell: false,
    experimentalRenderer: false
  })
});

export function exposeAppConfig(target = window) {
  target.TCG_CONFIG = APP_CONFIG;
  target.TCG_BUILD = APP_CONFIG.buildId;
  target.TCG_VERSION = APP_CONFIG.version;
  target.TCG_SAVE_SCHEMA_VERSION = APP_CONFIG.saveSchemaVersion;
  return APP_CONFIG;
}
