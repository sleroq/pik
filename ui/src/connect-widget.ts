import {IStickerActionRequestData, MatrixCapabilities, WidgetApi} from "matrix-widget-api";

function parseFragment() {
  const fragmentString = window.location.search || "?";
  return new URLSearchParams(fragmentString.substring(1));
}

function assertParam(fragment: URLSearchParams, name: string) {
  const val = fragment.get(name);
  if (!val)
    throw new Error(`${name} is not present in URL - cannot load widget`);
  return val;
}

const qs = parseFragment();
let widgetId = assertParam(qs, "widgetId");
export const USERID = assertParam(qs, "userId");
export const GROUP_PACKS = qs.get("groupPacks");
// TODO: Handle default themes

const widgetApi = new WidgetApi(widgetId);
widgetApi.requestCapability(MatrixCapabilities.StickerSending);
widgetApi.start();

export default widgetApi;

// Custom API implementation, in case matrix-widget-api is broken in some way
// export function sendSticker(sticker: IStickerActionRequestData) {
//   const data = {
//     content: {
//       ...sticker.content,
//     },
//     // `name` is for Element Web (and also the spec)
//     // Element Android uses content -> body as the name
//     name: sticker.name,
//   };
//
//   // This is for Element iOS
//   const widgetData = {
//     ...data,
//     description: sticker.description,
//     file: `${sticker.name}.png`,
//   };
//
//   window.parent.postMessage(
//     {
//       api: "fromWidget",
//       action: "m.sticker",
//       requestId: `sticker-${Date.now()}`,
//       widgetId,
//       data,
//       widgetData,
//     },
//     "*"
//   );
// }