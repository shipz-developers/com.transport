import { WebSocketServer } from 'ws';
import { PacketHandler } from './data/handler.js';
import { CODES } from './data/com.codes.js';
import { TransportSettings } from './cache/transport.configs.js';
import { sid } from './crypto/sid.js';
import { CleanupClient } from './entities/cleanup.js';
import { Heartbeat } from './entities/heartbeat.js';
import { ChallengeManager } from './entities/challenge.js';

export const Transport = {
    server: null,
    clients: new Map(),
    ActiveIPs: new Map(),
    IPBucked: new Map(),
    IPBucketReset: Date.now(),

    Start: (HttpServer) => {
        Transport.server = new WebSocketServer({
            server: HttpServer,
            perMessageDeflate: false,
            maxPayload: TransportSettings.MAX_CLIENT_PAYLOAD
        });

        Heartbeat.Init(Transport, TransportSettings.TRANSPORT_BEAT_INTERVAL_MS);

        PacketHandler.SetCommunicationsMap(CODES);
        Transport.server.binaryType = 'arraybuffer';
        console.log('[Transport] Communications active.');

        Transport.server.on('connection', (ws, req) => {
            const RemoteIP = req.socket.remoteAddress;
            const now = Date.now();

            const IPCons = (Transport.ActiveIPs.get(RemoteIP) || 0) + 1;
            if (IPCons > TransportSettings.MAX_IP_CONNECTIONS || Transport.clients.size >= TransportSettings.MAX_RAW_CONNECTIONS) {
                ws.terminate();
                return;
            }

            Transport.ActiveIPs.set(RemoteIP, IPCons);
            ws.RemoteIP = RemoteIP;
            ws.pps = 0;
            ws.LastPPSReset = now;
            ws.LastSeen = now;

            if (TransportSettings.LOG_CONNECTIONS) {
                console.log(`[Transport] new connection connected.`)
            }

            ws.IsConnected = true;

            ws.on('pong', () => {
                ws.LastSeen = Date.now();
            });

            ws.FirePacket = (event, data) => {
                const jsonStr = JSON.stringify(data);
                if (TransportSettings.BLOCK_OUT.some(b => jsonStr.toLowerCase().includes(b))) {
                    return;
                }
                const packet = PacketHandler.encode(event, data);
                if (packet.byteLength > TransportSettings.MAX_SERVER_PAYLOAD) {
                    return;
                }
                if (ws.readyState === 1) ws.send(packet);
            };

            ws.send(JSON.stringify({ type: 'com.codes', codes: CODES }));

            ws.on('message', function incoming(data, IsBinary) {
                ws.LastSeen = Date.now();

                const CurrentTime = Date.now();
                const rawData = data.toString();

                if (CurrentTime - Transport.IPBucketReset > 1000) {
                    Transport.IPBucked.clear();
                    Transport.IPBucketReset = CurrentTime;
                }

                const CurrentCount = (Transport.IPBucked.get(RemoteIP) || 0) + 1;
                Transport.IPBucked.set(RemoteIP, CurrentCount);

                if (CurrentCount > TransportSettings.MAX_PPS_IP) {
                    return;
                }

                if (CurrentTime - ws.LastPPSReset > 1000) {
                    ws.pps = 0;
                    ws.LastPPSReset = CurrentTime;
                }

                ws.pps++;
                if (ws.pps > TransportSettings.MAX_PPS_CLIENT) {
                    ws.terminate();
                    return;
                }

                if (data.length > TransportSettings.MAX_CLIENT_PAYLOAD) {
                    ws.terminate();
                    return;
                }

                if (TransportSettings.BLOCK_IN.some(b => rawData.toLowerCase().includes(b))) {
                    return;
                }

                try {
                    let decoded = IsBinary
                        ? PacketHandler.decode(Uint8Array.from(data).buffer)
                        : { event: 'text', data: rawData };

                    if (decoded.event === 'com.codes.recv') {
                        ws.FirePacket(CODES["com.challenge"], Buffer.from(JSON.stringify(ChallengeManager.GetChallenge(Transport, ws))).toString('base64'));
                    } else if (decoded.event === 'com.challenge_response') {
                        ChallengeManager.SolveChallenge(Transport, ws, decoded.data.data);
                    } else {
                        if (ws.IsConnected && ws.sid) NewPacketHandler(Transport, ws, { event: decoded.event, data: decoded.data });
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            ws.on('error', () => { });

            ws.on('close', () => {
                CleanupClient(ws, Transport);
            });
        });

        return Transport.server;
    },

    Broadcast: (event, data) => {
        Transport.clients.forEach((client) => {
            if (client.readyState === 1 && client.sid) {
                client.FirePacket(event, data);
            }
        });
    },

    FirePacket: (ClientID, event, data) => {
        const client = Transport.clients.get(ClientID);
        if (client && client.readyState === 1) {
            client.FirePacket(event, data);
        }
    }
};

export default Transport;