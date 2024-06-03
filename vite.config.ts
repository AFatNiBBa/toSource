
import dtsPlugin from "vite-plugin-dts";
import { defineConfig } from "vite";
import { join } from "path";

export default defineConfig({
    plugins: [ dtsPlugin({ rollupTypes: true }) ],
    esbuild: { target: "Es2022" },
    build: {
        minify: false,
        target: "EsNext",
        lib: {
            entry: join(__dirname, "src/index.ts"),
            fileName: "index",
            name: "Uneval"
        }
    }
});