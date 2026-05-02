import { PacketHandler, DYNAMIC_CODES } from './handler.js';
import { HandlePackets } from '../script.js';

export const Transport = {
    socket: null,
    sid: null,

    connect: function (url) {
        if (this.socket && this.socket.readyState <= 1) {
            console.warn("Transport is already connecting or connected.");
            return;
        }

        if (!url) {
            console.error("Transport Error No URL provided.");
            return;
        }

        this.socket = new WebSocket(url);
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = () => console.log(`Transport connected.`);
        this.socket.onmessage = (event) => this._HandleMsg(event);
        this.socket.onclose = () => console.log("Transport closed.");
        this.socket.onerror = (err) => console.error("Transport Error", err);
    },

    disconnect: function () {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.sid = null;
            console.log("Transport disconnected.");
        }
    },

    FirePacket: function (event, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const packet = PacketHandler.encode(event, data);
            this.socket.send(packet);
        } else {
            console.warn("Cannot fire packet - Transport is not connected.");
        }
    },

    _HandleMsg: function (event) {
        if (typeof event.data === 'string') {
            const msg = JSON.parse(event.data);
            if (msg.type === 'com.codes') {
                PacketHandler.SetCommunicationsMap(msg.codes);
                const code = DYNAMIC_CODES["com.codes.recv"];
                if (code !== undefined) {
                    this.FirePacket(code);
                    console.log(`Confirmed protocol with byte code ${code}`);
                }
                return;
            }
        }

        const decoded = PacketHandler.decode(event.data);
        if (!decoded) return;

        const { id, event: type, data } = decoded;

        switch (type) {
            case 'com.sid':
                this.sid = data.sid;
                console.log('Transport SID active:', this.sid);
                this.FirePacket(DYNAMIC_CODES["com.enter"], { sid: this.sid });
                break;

            case 'com.challenge':
                const [ChipBase, val1, val2] = JSON.parse(atob(data));
                this.FirePacket(DYNAMIC_CODES["com.challenge_response"], {
                    data: val1 + val2,
                    chip: ChipBase - val2
                });
                break;

            default:
                HandlePackets(this, type, data);
                break;
        }
    }
};