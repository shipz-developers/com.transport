import 'dotenv/config';
import Webserver from './webserver/webserver.js';
import Transport from './com.transport/transport.js';
import { TransportSettings } from './com.transport/cache/transport.configs.js';

TransportSettings.Update();

const server = Webserver.Start( // Hooking custom webserver is possible.
    process.env.WEBSERVER_PORT || 80,
    process.env.WEBSERVER_HOST || '0.0.0.0'
);

server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

    console.log('---------------------------------');
    console.log('| 🚀 TRANSPORT REACHABLE');
    console.log(`| 🔗 Running on ws://${process.env.WEBSERVER_HOST || 'localhost'}:${addr.port}`);
    console.log('---------------------------------');
});

const wss = Transport.Start(
    server
);