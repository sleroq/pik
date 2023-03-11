import { MatrixCapabilities, WidgetApi } from "matrix-widget-api";

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
// TODO: Handle default themes

const widgetApi = new WidgetApi(widgetId);
widgetApi.requestCapability(MatrixCapabilities.StickerSending);
widgetApi.start();

// const widgetApi = new PikWidget(widgetId);
// widgetApi.connect()

export default widgetApi;

// Custom API implementation, in case matrix-widget-api is broken in some way

// class PikWidget extends EventEmitter {
//   widgetId: string | undefined;
//
//   constructor(widgetId?: string) {
//     super()
//     if (widgetId) {
//       this.widgetId = widgetId;
//     }
//   }
//
//   connect() {
//     window.onmessage = (event) => {
//       if (!window.parent || !event.data) {
//         return
//       }
//
//       const request = event.data;
//       if (
//         !request.requestId ||
//         !request.widgetId ||
//         !request.action ||
//         request.api !== "toWidget"
//       ) {
//         return
//       }
//
//       if (this.widgetId) {
//         if (this.widgetId !== request.widgetId) {
//           return
//         }
//       } else {
//         this.widgetId = request.widgetId;
//       }
//
//       let response;
//
//       if (request.action === "visibility") {
//         response = {};
//       } else if (request.action === "capabilities") {
//         response = { capabilities: ["m.sticker"] };
//       } else {
//         response = { error: { message: "Action not supported" } };
//       }
//
//       window.parent.postMessage({ ...request, response }, event.origin);
//
//       this.emit("ready")
//     };
//   }
//
//   sendSticker(sticker: IStickerActionRequestData) {
//     const data = {
//       content: sticker.content,
//       // `name` is for Element Web (and also the spec)
//       // Element Android uses content -> body as the name
//       name: sticker.name,
//     };
//
//     // This is for Element iOS
//     const widgetData = {
//       ...data,
//       description: sticker.description,
//       file: `${sticker.name}.png`,
//     };
//     // Element iOS explodes if there are extra fields present
//     // delete widgetData.content["net.maunium.telegram.sticker"];
//
//     window.parent.postMessage(
//       {
//         api: "fromWidget",
//         action: "m.sticker",
//         requestId: `sticker-${Date.now()}`,
//         widgetId,
//         data,
//         widgetData,
//       },
//       "*"
//     );
//   }
// }
