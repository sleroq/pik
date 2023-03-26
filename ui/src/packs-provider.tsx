import {
  createSignal,
  createContext,
  useContext,
  createResource,
  JSX,
  ResourceReturn,
} from "solid-js";
import { GROUP_PACKS, USERID } from "./lib/connect-widget";
import PikApi, { ServerStickerPack } from "./lib/pik-api";
import { AuthData } from "./lib/auth";

interface PacksData {
  userPacksRes: ResourceReturn<ServerStickerPack[]>;
  groupPacksRes: ResourceReturn<ServerStickerPack[]>;
  trendingPacksRes: ResourceReturn<ServerStickerPack[]>;
}

const PacksContext = createContext<PacksData>();

type ParentProps<P = {}> = P & { children?: JSX.Element };
export function PacksProvider(props: ParentProps<{ authData: AuthData }>) {
  const { authData } = props;
  const [userId] = createSignal(USERID);
  const trendingUser = import.meta.env.VITE_TRENDING_USER;

  const pik = new PikApi(import.meta.env.VITE_API_URL, authData.apiToken);
  const getPacks = pik.userPacks.bind(pik);

  const userPacksRes = createResource(userId, getPacks);
  const groupPacksRes = createResource(GROUP_PACKS, getPacks);
  const trendingPacksRes = createResource(trendingUser, getPacks);

  const packsData = {
    userPacksRes,
    groupPacksRes,
    trendingPacksRes,
  };

  return (
    <PacksContext.Provider value={packsData}>
      {props.children}
    </PacksContext.Provider>
  );
}

export function usePacks(): PacksData {
  const packs = useContext(PacksContext);
  if (!packs) throw new Error("Packs context returns undefined :(");
  return packs;
}
