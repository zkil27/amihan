import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'AMIHAN';

createInertiaApp({
    title: (title) => (title ? `${title} · ${appName}` : `${appName} · Steeped in Altitude`),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    // The storefront uses its own "mist pass" transition; this thin bar
    // only appears for slower admin requests.
    progress: {
        color: '#B08D57',
        delay: 400,
        showSpinner: false,
    },
});
