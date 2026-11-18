
const environmentName = __ENV.ENV || 'demo';

const environmentFiles = {
    demo: './environments/demo.json'
};

if (!environmentFiles[environmentName]) {
    throw new Error(
        `Unsupported environment: ${environmentName}. ` +
        `Available environments: ${Object.keys(environmentFiles).join(', ')}`
    );
}


const SUPPORTED_WORKLOAD_PROFILES = [
    'smoke',
    'baseline',
    'load',
    'stress',
    'spike',
    'soak'
];

const HIGH_RISK_WORKLOAD_PROFILES = [
    'stress',
    'spike',
    'soak'
];

function assertHighRiskProfileAllowed(profile, layer) {
    if (
        HIGH_RISK_WORKLOAD_PROFILES.includes(profile) &&
        __ENV.ALLOW_HIGH_RISK_TESTS !== 'true'
    ) {
        throw new Error(
            `Execution blocked: ${layer} ${profile} testing requires ` +
            'ALLOW_HIGH_RISK_TESTS=true.'
        );
    }
}

export function assertWorkloadExecutionAllowed(
    profileName,
    layer = 'api'
) {
    const profile = String(profileName || 'smoke').toLowerCase();

    if (!SUPPORTED_WORKLOAD_PROFILES.includes(profile)) {
        throw new Error(
            `Unsupported workload profile: ${profile}. ` +
            `Available profiles: ${SUPPORTED_WORKLOAD_PROFILES.join(', ')}`
        );
    }

    if (!['api', 'browser', 'hybrid'].includes(layer)) {
        throw new Error(`Unsupported testing layer: ${layer}`);
    }

    assertHighRiskProfileAllowed(profile, layer);
}


export function assertHybridExecutionAllowed(
    apiProfileName = 'smoke',
    browserProfileName = 'smoke'
) {
    // Validate the two workloads independently.
    assertWorkloadExecutionAllowed(apiProfileName, 'api');

    assertWorkloadExecutionAllowed(browserProfileName, 'browser');
}



// Load environment configuration during the k6 init stage.
export const env = JSON.parse(
    open(environmentFiles[environmentName])
);

if (!env.baseUrl) {
    throw new Error('Environment configuration is missing baseUrl.');
}

export const baseUrl = env.baseUrl.replace(/\/+$/, '');

// These fixed scenarios only support smoke execution.
export function assertExecutionAllowed() {
    const requestedProfiles = [
        ['TEST_TYPE', __ENV.TEST_TYPE],
        ['API_PROFILE', __ENV.API_PROFILE],
        ['BROWSER_PROFILE', __ENV.BROWSER_PROFILE]
    ];

    const nonSmokeProfile = requestedProfiles.find(
        ([, profile]) =>
            profile && profile.toLowerCase() !== 'smoke'
    );

    if (nonSmokeProfile) {
        throw new Error(
            `Execution blocked: this scenario uses a fixed smoke workload; ` +
            `${nonSmokeProfile[0]} does not change its workload. ` +
            'Use the corresponding workload scenario for non-smoke profiles.'
        );
    }
}
