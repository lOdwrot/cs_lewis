"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:4173', // vite preview
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
];
exports.default = ({ env }) => {
    const clientUrl = env('CLIENT_URL', '');
    const origins = clientUrl
        ? [...new Set([...defaultOrigins, clientUrl])]
        : defaultOrigins;
    return [
        'strapi::logger',
        'strapi::errors',
        'strapi::security',
        {
            name: 'strapi::cors',
            config: {
                origin: origins,
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
                keepHeaderOnError: true,
            },
        },
        'strapi::poweredBy',
        'strapi::query',
        'strapi::body',
        'strapi::session',
        'strapi::favicon',
        'strapi::public',
    ];
};
