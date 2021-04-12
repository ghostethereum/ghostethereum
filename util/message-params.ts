export const createProfile = {
    domain: {
        chainId: 4,
        version: '1',
    },
    primaryType: 'Profile',
    types: {
        EIP712Domain: [
            { name: 'chainId', type: 'uint' },
            { name: 'version', type: 'string' },
        ],
        Profile: [
            { name: 'adminUrl', type: 'string' },
            { name: 'adminAPIKey', type: 'string' },
            { name: 'plans', type: 'Plan[]' },
        ],
        Plan: [
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'currency', type: 'string' },
            { name: 'amount', type: 'uint' },
        ]
    },
};