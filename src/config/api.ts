import localEnvironment from './environment/local.json'
import devEnvironment from './environment/dev.json'

/** Local Vite mode uses the proxy; production builds use the deployed API. */
const environment = import.meta.env.MODE === 'development'
  ? localEnvironment
  : devEnvironment

export const API_BASE_URL = environment.apiBaseUrl.replace(/\/$/, '')
