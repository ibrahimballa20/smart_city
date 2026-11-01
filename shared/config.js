import { fileURLToPath } from 'node:url';
import path from 'node:path';
import dotenv from 'dotenv';

export const rootDir = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: path.join(rootDir, '.env'), quiet: true });

function port(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535`);
  }
  return value;
}
function origin(name, fallback) {
  const url = new URL(process.env[name] ?? fallback);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTP(S) origin without credentials`);
  }
  return url.origin;
}

const ports = {
  gateway: port('GATEWAY_PORT', 3000),
  users: port('USER_SERVICE_PORT', 3001),
  complaints: port('COMPLAINT_SERVICE_PORT', 3002),
  geo: port('GEO_SERVICE_PORT', 3003),
  frontend: port('FRONTEND_PORT', 5173),
};
if (new Set(Object.values(ports)).size !== Object.keys(ports).length) {
  throw new Error('Each application must have a different port');
}
export const config = {
  ports,
  dataDir: path.resolve(rootDir, process.env.DATA_DIR ?? 'data'),
  services: {
    users: origin('USER_SERVICE_URL', `http://127.0.0.1:${ports.users}`),
    complaints: origin('COMPLAINT_SERVICE_URL', `http://127.0.0.1:${ports.complaints}`),
    geo: origin('GEO_SERVICE_URL', `http://127.0.0.1:${ports.geo}`),
  },
};
