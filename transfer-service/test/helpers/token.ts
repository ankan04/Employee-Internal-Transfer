import { SignJWT, generateKeyPair, exportJWK, KeyLike } from 'jose';

let priv: KeyLike;
let pub: KeyLike;

export async function initKeys() {
  if (!priv) {
    const kp = await generateKeyPair('RS256');
    priv = kp.privateKey;
    pub = kp.publicKey;
  }
  return { priv, pub };
}

export async function jwks() {
  await initKeys();
  const jwk = await exportJWK(pub);
  return { keys: [{ ...jwk, alg: 'RS256', use: 'sig', kid: 'test-key' }] };
}

export async function tokenFor(subjectRef: string, roles: string[] = []) {
  await initKeys();
  return new SignJWT({ sub: subjectRef, roles })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(priv);
}
