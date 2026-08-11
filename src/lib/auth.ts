import { SignJWT, jwtVerify } from 'jose';

const getSecretKey = () => {
  return process.env.JWT_SECRET || 'nexus-super-secret-key-fallback-for-production-and-dev';
};

const getKey = () => new TextEncoder().encode(getSecretKey());

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getKey());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload;
  } catch (error) {
    return null;
  }
}
