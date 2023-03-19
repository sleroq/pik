import { aesGcmEncrypt } from "./crypto";

const genString = () => crypto.randomUUID().replaceAll("-", "");

const getToken = async (secret: string, password: string): Promise<string> => {
  const token = await aesGcmEncrypt(secret, password);
  return token.slice(0, 8);
};

export interface AuthData {
  token: string;
  apiToken: string;
}
export default async function createToken(): Promise<AuthData> {
  const password = genString();
  const secret = genString();
  const token = await getToken(secret, password);
  return {
    token: token,
    apiToken: secret + "." + password,
  };
}
