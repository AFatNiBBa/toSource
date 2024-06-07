
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
            formats: [ "cjs" ],
            fileName: "index"
        },
        rollupOptions: {
            output: { globals: x => x.replace(/\W(\w)/g, (_, x) => x.toUpperCase()) },
            external: [ "uneval.js", "internal-prop" ]
        }
    }
});