export const TransportSettings = {
    Update: function () {
        const s = (v) => (v || "").split(',').filter(x => x !== "").map(x => x.toLowerCase());

        Object.assign(this, {
            MAX_CLIENT_PAYLOAD: parseInt(process.env.TRANSPORT_MAX_PAYLOAD_CLIENT) || 1536,
            MAX_SERVER_PAYLOAD: parseInt(process.env.TRANSPORT_MAX_PAYLOAD_SERVER) || 1048576,
            MAX_RAW_CONNECTIONS: parseInt(process.env.TRANSPORT_MAX_RAW_CONNECTIONS) || 10240,
            MAX_PPS_CLIENT: parseInt(process.env.TRANSPORT_MAX_PPS_CLIENT) || 25,
            MAX_PPS_IP: parseInt(process.env.TRANSPORT_MAX_PPS_IP) || 500,
            MAX_IP_CONNECTIONS: parseInt(process.env.TRANSPORT_MAX_IP_CONNECTIONS) || 30,

            BLOCK_IN: [...s(process.env.TRANSPORT_BLOCK_IN_METACHARS), ...s(process.env.TRANSPORT_BLOCK_IN_PATTERNS)],
            BLOCK_OUT: [...s(process.env.TRANSPORT_BLOCK_OUT_METACHARS), ...s(process.env.TRANSPORT_BLOCK_OUT_PATTERNS)],

            LOG_CONNECTIONS: process.env.TRANSPORT_LOG_CONNECTIONS === 'true',
            LOG_PACKETS: process.env.TRANSPORT_LOG_PACKETS === 'true',

            TRANSPORT_BEAT_INTERVAL_MS: parseInt(process.env.TRANSPORT_BEAT_INTERVAL_MS) || 5000,
            TRANSPORT_BEAT_TIMEOUT_MS: parseInt(process.env.TRANSPORT_BEAT_TIMEOUT_MS) || 25000,

            TRANSPORT_CHALLENGE_TIMEOUT: parseInt(process.env.TRANSPORT_CHALLENGE_TIMEOUT) || 2000
        });

        console.log('[Cache] Transport settings cached.');
    }
};