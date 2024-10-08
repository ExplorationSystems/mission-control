import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
    ssr: {
        external: true
    },
    build: {
        emptyOutDir: false,
        sourcemap: true,
        // minify: true,
        // terserOptions: {
        //     mangle: true,
        //     compress: true,
        // }
    },
    plugins: [react()],
    resolve: {
        alias: [
            { find: 'src', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        ]
    }
})
