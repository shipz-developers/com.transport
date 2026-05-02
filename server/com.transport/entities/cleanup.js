import { TransportSettings } from '../cache/transport.configs.js';

export const CleanupClient = (ws, Transport) => {
    if (!ws) return;

    if (TransportSettings.LOG_CONNECTIONS) {
        console.log(`[Transport] Client ${ws.sid || 'unknown'} disconnected`);
    }

    if (ws.RemoteIP) {
        const CurrentCount = Transport.ActiveIPs.get(ws.RemoteIP) || 1;
        if (CurrentCount <= 1) {
            Transport.ActiveIPs.delete(ws.RemoteIP);
        } else {
            Transport.ActiveIPs.set(ws.RemoteIP, CurrentCount - 1);
        }
    }

    if (ws.sid) {
        Transport.clients.delete(ws.sid);
    }

    ws.FirePacket = null; 
};