import { createContext, useContext } from "solid-js";
import Cookie from "./cookie";

const genToken = () => Math.random().toString(36).substring(2);

const TokenContext = createContext<string>();

export function TokenProvider(props: any) {
  let token = Cookie.get("token");
  if (!token) {
    token = genToken();
    Cookie.set("token", token);
  }

  return (
    <TokenContext.Provider value={token}>
      {props.children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const token = useContext(TokenContext);
  if (!token) throw new Error("token not set");

  return token;
}
