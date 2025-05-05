import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        sourcemap: true,
    },
    server: {
        host: true,
        port: 4173,
        open: true,
    },
}); 