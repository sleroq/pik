import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig(() => {
  const apiUrl = "https://pik.sleroq.link/";
  const trendingUser = "@trending-packs:sleroq.link";

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
    define: {
      "env.API_URL": `"${apiUrl}"`,
      "env.TRENDING_USER": `"${trendingUser}"`,
    },
  };
});
