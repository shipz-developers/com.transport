import { Transport } from "./com.transport/transport";

// Example connection
document.addEventListener('DOMContentLoaded', () => {
    Transport.connect(`ws://mytransportserver.com`);
});

// Example packet handler 
export function HandlePackets(TransportClient, event, data) {
    switch (event) {
        case 'com.custom_packet':
            CreatePlayer(data.id);
            break;

        case 'com.abc123':
            console.log(`Received com.abc123 with data:`, data); // eg string, number, object, ...
            break;

        default:
            console.warn(`Unknown packet event: ${event} for ${TransportClient.sid}`);
            break;
    }
}