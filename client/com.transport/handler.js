export const DYNAMIC_CODES = {};
let REVERSE_MAP = {};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const PacketHandler = {
    SetCommunicationsMap: (codes) => {
        for (const key in DYNAMIC_CODES) delete DYNAMIC_CODES[key];
        Object.assign(DYNAMIC_CODES, codes);

        REVERSE_MAP = {};
        
        for (const [name, code] of Object.entries(codes)) {
            REVERSE_MAP[Number(code)] = name;
        }
    },

    encode: (event, data) => {
        const code = typeof event === 'number' ? event : (DYNAMIC_CODES[event] || 0);
        const jsonb = encoder.encode(JSON.stringify(data));
        const packet = new Uint8Array(1 + jsonb.length);
        packet[0] = code;
        packet.set(jsonb, 1);
        return packet.buffer;
    },

    decode: (buffer) => {
        const view = new Uint8Array(buffer);
        const EventCode = view[0];
        const EventName = REVERSE_MAP[EventCode] || 'unknown';

        const jsonstr = decoder.decode(view.slice(1));
        try {
            return { 
                id: EventCode,
                event: EventName, 
                data: JSON.parse(jsonstr) 
            };
        } catch (e) {
            return { id: EventCode, event: EventName, data: jsonstr };
        }
    }
};