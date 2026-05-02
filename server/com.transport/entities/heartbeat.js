import { TransportSettings } from '../cache/transport.configs.js';
import { CleanupClient } from './cleanup.js';

export const Heartbeat = {
    interval: null,

    Init: (Transport) => {
        const IntervalMS = TransportSettings.TRANSPORT_BEAT_INTERVAL_MS;
        const TimeoutMS = TransportSettings.TRANSPORT_BEAT_TIMEOUT_MS;

        if (Heartbeat.interval) clearInterval(Heartbeat.interval);

        Heartbeat.interval = setInterval(() => {
            const now = Date.now();

            Transport.clients.forEach((ws) => {
                if (now - ws.LastSeen > TimeoutMS) {
                    console.log(`[Heartbeat] Timeout Terminating ${ws.sid} (Inactive for ${now - ws.LastSeen}ms)`);

                    if (ws.readyState === 1) ws.send('com.heartbeat_timeout');

                    return ws.terminate();
                }

                if (ws.readyState === 1) ws.ping();
            });
        }, IntervalMS);

        console.log(`[Heartbeat] Active. Interval with ${IntervalMS}ms and Timeout ${TimeoutMS}ms`);
    },

    Stop: () => {
        clearInterval(Heartbeat.interval);
    }
};