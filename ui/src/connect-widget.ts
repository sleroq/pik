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
export const widgetId = assertParam(qs, "widgetId");
export const userId = assertParam(qs, "userId");

// TODO: Handle themes

export const widgetApi: WidgetApi = new WidgetApi(widgetId);
widgetApi.requestCapability(MatrixCapabilities.StickerSending);
widgetApi.start();
