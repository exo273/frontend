import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		port: 5173,
		host: '0.0.0.0',
		strictPort: true,
		hmr: {
			clientPort: 443,
			protocol: 'wss'
		},
		proxy: {
			'/api': {
				target: 'http://nginx', // API Gateway interno
				changeOrigin: true
			}
		}
	}
});
