import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig(() => {
  return {
    plugins: [solidPlugin()],
    base: "",
    server: {
      port: 3000,
      cors: false,
    },
    build: {
      target: "esnext",
    },
  };
});
