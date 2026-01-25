import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      '@fullcalendar/core',
      '@fullcalendar/react',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/notifications',
      'react-router-dom',
      'zustand',
      'axios'
    ],
  },

  // Build optimizations
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Mantine UI library
          'mantine': ['@mantine/core', '@mantine/hooks', '@mantine/dates', '@mantine/notifications'],
          // FullCalendar library (only loaded on calendar page)
          'fullcalendar': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction'
          ]
        }
      }
    },
    // Increase chunk size warning limit (these are heavy libraries)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },

  // Server configuration for faster HMR
  server: {
    // Enable faster dependency pre-bundling
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/routing/AppRouter.tsx',
        './src/pages/home.page.tsx'
      ]
    }
  }
})
