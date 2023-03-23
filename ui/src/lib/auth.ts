import { aesGcmEncrypt } from "./crypto";
import Cookie from "./cookie";

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
  const password = Cookie.get("password") || genString();
  const secret = Cookie.get("secret") || genString();
  const token = await getToken(secret, password);

  Cookie.set("password", password);
  Cookie.set("token", token);
  return {
    token: token,
    apiToken: secret + "." + password,
  };
}
