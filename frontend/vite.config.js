import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@": srcDir,
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@reduxjs|react-redux|redux|immer|reselect)[\\/]/,
              priority: 20,
            },
            {
              name: "markdown-vendor",
              test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|rehype-|micromark|mdast-|hast-|unist-|vfile|vfile-|unist-|unified|bail|trough|property-information|space-separated-tokens|comma-separated-tokens|html-url-attributes|devlop|decode-named-character-reference|character-entities|react-syntax-highlighter|refractor|prismjs|highlight\.js)[\\/]/,
              priority: 15,
            },
            {
              name: "chart-vendor",
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|@kurkle)[\\/]/,
              priority: 15,
            },
            {
              name: "animation-vendor",
              test: /[\\/]node_modules[\\/](framer-motion|motion|motion-dom|motion-utils|gsap)[\\/]/,
              priority: 15,
            },
            {
              name: "ui-vendor",
              test: /[\\/]node_modules[\\/](lucide-react|react-icons|@mui|@emotion|styled-components|swiper|class-variance-authority|clsx|tailwind-merge|radix-ui|@radix-ui)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
