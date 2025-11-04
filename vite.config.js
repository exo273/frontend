import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:8000', // API Gateway
				changeOrigin: true
			}
		}
	}
});
