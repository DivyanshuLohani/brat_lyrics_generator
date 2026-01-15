import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/search": "http://127.0.0.1:8000",
      "/generate": "http://127.0.0.1:8000",
      "/history": "http://127.0.0.1:8000",
      "/generated": "http://127.0.0.1:8000",
      "/status": "http://127.0.0.1:8000",
    },
  },
});
