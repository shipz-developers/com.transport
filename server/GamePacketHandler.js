import { TransportSettings } from "../../networking/cache/transport.configs.js";
import { CODES } from "./com.transport/data/com.codes.js";

export const NewPacketHandler = (Transport, TransportClient, Payload) => {
    const { event, data } = Payload;

    if (TransportSettings.LOG_PACKETS) console.log(`[Packet] Received event ${event} from client ${TransportClient.sid}`);

    switch (event) {
        case 'com.example_packet':
            console.log(`Received com.example_packet with data:`, data);

            console.log('Sending packet back to client...');
            Transport.FirePacket(CODES['com.example_packet'], { CustomObjectName: 'CustomDataString 123' });
            console.log('Packet sent back to client.');

            break;
    }
}