import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@auth': '/src/auth',
      '@context': '/src/context',
    },
  },
  build: {
    // You can remove this line later when you want it minified for real production
    minify: false, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          // 1. Check specific libraries FIRST before checking for generic "react"
          if (id.includes('lucide-react') || id.includes('react-icons')) return 'ui-vendor';
          if (id.includes('react-router')) return 'router-vendor';
          if (id.includes('react-player')) return 'media-vendor';
          if (id.includes('emoji-picker-react')) return 'emoji-vendor';

          // 2. Be highly specific about Core React
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('scheduler')) {
            return 'react-vendor';
          }

          // 3. The rest of your specific vendors
          if (id.includes('firebase')) return 'firebase-vendor';
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'socket-vendor';
          if (id.includes('framer-motion')) return 'motion-vendor';
          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'editor-vendor';
          if (id.includes('@tensorflow') || id.includes('@mediapipe')) return 'vision-vendor';
          if (id.includes('peerjs')) return 'peer-vendor';
          if (id.includes('papaparse')) return 'data-vendor';
          if (id.includes('qrcode.react') || id.includes('qrcode-generator')) return 'qr-vendor';
          if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor';

          return 'vendor';
        },
      },
    },
    target: 'esnext',
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})