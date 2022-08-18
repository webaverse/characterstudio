// vite.config.ts
import { defineConfig } from "vite";
import path from "path";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
var vite_config_default = defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    assetsInlineLimit: 65536,
    lib: {
      entry: path.resolve("./src/index.ts"),
      name: "meshbaker",
      fileName: (format) => `meshbaker.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCJcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cblxuLy8gU2VlIGd1aWRlIG9uIGhvdyB0byBjb25maWd1cmUgVml0ZSBhdDpcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgZHRzKHtpbnNlcnRUeXBlc0VudHJ5OiB0cnVlfSldLFxuICBidWlsZDoge1xuICAgIGFzc2V0c0lubGluZUxpbWl0OiA2NTUzNixcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoJy4vc3JjL2luZGV4LnRzJyksXG4gICAgICBuYW1lOiAnbWVzaGJha2VyJyxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgbWVzaGJha2VyLiR7Zm9ybWF0fS5qc2BcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIG1ha2Ugc3VyZSB0byBleHRlcm5hbGl6ZSBkZXBzIHRoYXQgc2hvdWxkbid0IGJlIGJ1bmRsZWRcbiAgICAgIC8vIGludG8geW91ciBsaWJyYXJ5XG4gICAgICBleHRlcm5hbDogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBQcm92aWRlIGdsb2JhbCB2YXJpYWJsZXMgdG8gdXNlIGluIHRoZSBVTUQgYnVpbGRcbiAgICAgICAgLy8gZm9yIGV4dGVybmFsaXplZCBkZXBzXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogJ1JlYWN0J1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxXQUFXO0FBS2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxFQUFDLGtCQUFrQixLQUFJLENBQUMsQ0FBQztBQUFBLEVBQ2hELE9BQU87QUFBQSxJQUNMLG1CQUFtQjtBQUFBLElBQ25CLEtBQUs7QUFBQSxNQUNILE9BQU8sS0FBSyxRQUFRLGdCQUFnQjtBQUFBLE1BQ3BDLE1BQU07QUFBQSxNQUNOLFVBQVUsQ0FBQyxXQUFXLGFBQWE7QUFBQSxJQUNyQztBQUFBLElBQ0EsZUFBZTtBQUFBLE1BR2IsVUFBVSxDQUFDLFNBQVMsV0FBVztBQUFBLE1BQy9CLFFBQVE7QUFBQSxRQUdOLFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxRQUNUO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
