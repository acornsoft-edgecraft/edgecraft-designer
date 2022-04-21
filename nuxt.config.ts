import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    // Server side rendering
    ssr: false,
    // App mode
    mode: 'spa',
    // Source folder
    srcDir: 'src/',
    // Stylesheets
    css: [
        'primevue/resources/themes/bootstrap4-light-blue/theme.css',
        'primevue/resources/primevue.css',
        'primeicons/primeicons.css',
        'primeflex/primeflex.css',
        'prismjs/themes/prism-coy.css',
        '~/assets/scss/layout.scss',
        '~/assets/scss/designer.scss',
        "~/assets/scss/app.scss"
    ],
    // Runtime config
    runtimeConfig: {
        public: {
            DRAGGABLE_DEBUG: process.env.DRAGGABLE_DEBUG || true
        }
    },
    // Build modules
    buildModules: [
        '@vueuse/nuxt',
        'vite-plugin-vue-type-imports/nuxt'
    ],
    // Build
    build: {
        transpile: [
            'primevue',
        ],
        extractCSS: true,
        splitChunks: {
            layouts: true
        }
    },
    // Vite
    // vite: {
    //     plugins: [
    //     ],
    //     // optimizeDeps: {
    //     //     include: ['vue', '@vueuse/core', 'd3-zoom', 'd3-selection'],
    //     // },
    // }
})
