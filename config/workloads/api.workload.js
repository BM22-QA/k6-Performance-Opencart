
const API_WORKLOADS = {
    // 1. Smoke: validate that the script and application work.
    smoke: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        maxDuration: '1m'
    },

    // 2. Baseline: establish normal application behaviour.
    baseline: {
        executor: 'constant-vus',
        vus: 5,
        duration: '2m',
        gracefulStop: '30s'
    },

    // 3. Load: gradually increase the iteration arrival rate.
    load: {
        executor: 'ramping-arrival-rate',
        startRate: 5,
        timeUnit: '1s',
        preAllocatedVUs: 10,
        maxVUs: 30,
        stages: [
            { duration: '1m', target: 10 },
            { duration: '2m', target: 20 },
            { duration: '1m', target: 20 },
            { duration: '1m', target: 0 }
        ],
        gracefulStop: '30s'
    },

    // 4. Stress: progressively increase traffic beyond normal load.
    stress: {
        executor: 'ramping-arrival-rate',
        startRate: 10,
        timeUnit: '1s',
        preAllocatedVUs: 20,
        maxVUs: 100,
        stages: [
            { duration: '2m', target: 20 },
            { duration: '2m', target: 40 },
            { duration: '2m', target: 60 },
            { duration: '1m', target: 80 },
            { duration: '1m', target: 0 }
        ],
        gracefulStop: '30s'
    },

    // 5. Spike: rapidly increase traffic and observe recovery.
    spike: {
        executor: 'ramping-arrival-rate',
        startRate: 5,
        timeUnit: '1s',
        preAllocatedVUs: 20,
        maxVUs: 80,
        stages: [
            { duration: '2m', target: 5 },
            { duration: '10s', target: 50 },
            { duration: '1m', target: 50 },
            { duration: '10s', target: 5 },
            { duration: '2m', target: 5 }
        ],
        gracefulStop: '30s'
    },

    // 6. Soak: sustain a steady arrival rate for an extended period.
    soak: {
        executor: 'constant-arrival-rate',
        rate: 10,
        timeUnit: '1s',
        duration: '30m',
        preAllocatedVUs: 20,
        maxVUs: 50,
        gracefulStop: '30s'
    }
};

export function getApiWorkload(profileName) {
    const normalizedName = String(profileName || 'smoke').toLowerCase();

    const profile = API_WORKLOADS[normalizedName];

    if (!profile) {
        throw new Error(
            `Invalid API workload: ${normalizedName}. ` +
            `Available profiles: ${Object.keys(API_WORKLOADS).join(', ')}`
        );
    }

    // Return a copy so scenarios cannot accidentally modify the original.
    return JSON.parse(JSON.stringify(profile));
}

export const apiProfileName = (
    __ENV.API_PROFILE || __ENV.TEST_TYPE || 'smoke'
).toLowerCase();

export const apiWorkload = getApiWorkload(apiProfileName);
