import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const Webserver = {
    Start: (port, host) => {
        const app = express();

        app.disable('x-powered-by');

        app.use(compression());

        app.use(express.json({ limit: '2kb' }));
        app.use(express.urlencoded({ extended: false, limit: '2kb' }));

        app.use((req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });

        if (process.env.SERVE_CONTENT === 'true') {
            const pubpath = path.resolve(__dirname, '../../../public');

            app.use(express.static(pubpath, {
                dotfiles: 'ignore',
                index: 'index.html',
                etag: true,
                lastModified: true,
                maxAge: 0
            }));

            console.log(`[Delivery] Serving static content from ${pubpath}`);
        } else {
            app.all('*', (req, res) => {
                res.status(403).send('403 Forbidden');
            });
            console.log('[Delivery] Content serving is disabled.');
        }

        const server = app.listen(port, host, () => {
            console.log(`[Delivery] HTTP-Receiver active on port ${port}`);
        });
        
        return server;
    }
};

export default Webserver;