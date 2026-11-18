
const BROWSER_WORKLOADS = {
    // 1. Smoke: one browser journey.
    smoke: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '2m'
    },

    // 2. Baseline: one concurrent browser user.
    baseline: {
        executor: 'constant-vus',
        vus: 1,
        duration: '2m',
        gracefulStop: '30s'
    },

    // 3. Load: gradually increase browser concurrency.
    load: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
            { duration: '1m', target: 1 },
            { duration: '2m', target: 2 },
            { duration: '1m', target: 3 },
            { duration: '1m', target: 0 }
        ],
        gracefulRampDown: '30s',
        gracefulStop: '30s'
    },

    // 4. Stress: cautiously increase browser concurrency.
    stress: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
            { duration: '1m', target: 2 },
            { duration: '2m', target: 3 },
            { duration: '2m', target: 4 },
            { duration: '1m', target: 0 }
        ],
        gracefulRampDown: '30s',
        gracefulStop: '30s'
    },

    // 5. Spike: rapidly increase browser concurrency.
    spike: {
        executor: 'ramping-vus',
        startVUs: 1,
        stages: [
            { duration: '2m', target: 1 },
            { duration: '10s', target: 4 },
            { duration: '1m', target: 4 },
            { duration: '10s', target: 1 },
            { duration: '1m', target: 1 }
        ],
        gracefulRampDown: '30s',
        gracefulStop: '30s'
    },

    // 6. Soak: sustain a small number of browser users.
    soak: {
        executor: 'constant-vus',
        vus: 1,
        duration: '30m',
        gracefulStop: '30s'
    }
};

export function getBrowserWorkload(profileName) {
    const normalizedName = String(profileName || 'smoke').toLowerCase();

    const profile = BROWSER_WORKLOADS[normalizedName];

    if (!profile) {
        throw new Error(
            `Invalid Browser workload: ${normalizedName}. ` +
            `Available profiles: ${Object.keys(BROWSER_WORKLOADS).join(', ')}`
        );
    }

    return JSON.parse(JSON.stringify(profile));
}

export const browserProfileName = (
    __ENV.BROWSER_PROFILE || __ENV.TEST_TYPE || 'smoke'
).toLowerCase();

export const browserWorkload = getBrowserWorkload(browserProfileName);
