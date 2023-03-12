import { MatrixCapabilities, WidgetApi } from "matrix-widget-api";

function parseFragment() {
  const fragmentString = window.location.search || "?";
  return new URLSearchParams(fragmentString.substring(1));
}

const qs = parseFragment();
let widgetId = qs.get("widgetId");
export const USERID = qs.get("userId") || '@unknown:sleroq.link'
export const GROUP_PACKS = qs.get("groupPacks");
// TODO: Handle default themes

let widgetApi = new WidgetApi()
if (widgetId) {
  widgetApi = new WidgetApi(widgetId);
  widgetApi.requestCapability(MatrixCapabilities.StickerSending);
  widgetApi.start();
}

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
