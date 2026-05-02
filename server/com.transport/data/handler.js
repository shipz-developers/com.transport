import { CODES } from "./com.codes.js";

let REVERSE_CODES = Object.fromEntries(Object.entries(CODES).map(([k, v]) => [v, k]));

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const PacketHandler = {
    SetCommunicationsMap: (codes) => {
        REVERSE_CODES = Object.fromEntries(
            Object.entries(codes).map(([k, v]) => [Number(v), k])
        );
        console.log('[Cache] Server-Transport maps cached.');
    },

    encode: (event, data) => {
        const code = typeof event === 'number' ? event : (CODES[event] || 0);
        
        const jsonstr = encoder.encode(JSON.stringify(data));
        const packet = new Uint8Array(1 + jsonstr.length);
        packet[0] = code;
        packet.set(jsonstr, 1);
        return packet.buffer;
    },

    decode: (buffer) => {
        const view = new Uint8Array(buffer);
        const eventn = REVERSE_CODES[view[0]] || 'unknown';

        const jsonstr = decoder.decode(view.slice(1));
        try {
            return { event: eventn, data: JSON.parse(jsonstr) };
        } catch (e) {
            return { event: eventn, data: jsonstr };
        }
    }
};