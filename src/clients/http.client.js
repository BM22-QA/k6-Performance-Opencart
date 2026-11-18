
import http from 'k6/http';
import { baseUrl } from '../../config/env.config.js';

const DEFAULT_PARAMS = {
    timeout: '30s',
    headers: {
        Accept: '*/*'
    }
};

// Build the complete URL.
function buildUrl(path) {
    return `${baseUrl}/${String(path).replace(/^\/+/, '')}`;
}

// Merge default and request-specific parameters.
function buildParams(params = {}) {
    return {
        ...DEFAULT_PARAMS,
        ...params,
        headers: {
            ...DEFAULT_PARAMS.headers,
            ...(params.headers || {})
        }
    };
}

// Reusable GET request.
export function get(path, params = {}) {
    return http.get(
        buildUrl(path),
        buildParams(params)
    );
}

// Reusable POST request.
export function post(path, body, params = {}) {
    return http.post(
        buildUrl(path),
        body,
        buildParams(params)
    );
}
