import { CODES } from '../data/com.codes.js';
import { TransportSettings } from '../cache/transport.configs.js';

export const ChallengeManager = {
    GetChallenge: (Transport, ws) => {
        if (ws.ChallengePending) return null;

        const k1 = Math.floor(Math.random() * 1e14),
            k2 = Math.floor(Math.random() * 1e9) + 1e6;

        ws.ChallengeAnswer = k1 + k2;
        ws.ChallengeCompleted = false;
        ws.ChallengePending = true;

        setTimeout(() => {
            if (ws.readyState === 1 && !ws.ChallengeCompleted) {
                ws.terminate();
            }
        }, TransportSettings.TRANSPORT_CHALLENGE_TIMEOUT || 2000);

        return [k2 * 2, k1, k2, k1 - k2, k1 * k2];
    },

    SolveChallenge: (Transport, ws, answer) => {
        if (ws.ChallengeAnswer && Number(answer) === ws.ChallengeAnswer) {
            if (!ws.sid) {
                ws.sid = sid.GenerateSID();
                Transport.clients.set(ws.sid, ws);
            }

            ws.ChallengeCompleted = true;
            ws.ChallengePending = false;
            ws.FirePacket(CODES["com.sid"], { sid: ws.sid });
        } else {
            ws.terminate();
        }
    }
};