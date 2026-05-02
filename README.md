# com.transport
Custom high performance &amp; secure networking for the web, used in the new Shipz source

# Feature(s)
* Maximized high-performance web transport with configurable options and easily packet sending over binary
* Connection heartbeat(s)
* Flood protection
* Exploit, XSS, SQL protection
* In-Line challenge to prevent bots
* Binary transport (base en/decoding)
* Supporting thousend(s) of connections, packets single threaded
* Custom handshake webserver + content delivery + transport all-in-one

# Setup server
* git clone repo name or download manual
* cd reponame123
* cd server
* npm install
* npm start
* For dev use 'npm dev'
* Server should now be up and running. Recommed: Use Cloudflare (SSL flexible) or NGINX with SSL and do not handle SSL/TLS on the transport app or encryption will be heavy

# Setup Client
* See client example

# Modify
* (client) How to modify or change the location of "HandlePackets" packet handler at your module script? Go to client/com.transport/transport.js find the same function name and change the function name or/and its path to a custom module script.
* (server) How to add custom packet(s) > Go to server/com.transport/data/com.codes.js and add any packet name with its packet number. The client will receive this by default and able to communicate
* (server) For your server you can do the same as mentioned above.

# Receiving and sending packet(s) at server
* See ./server/com.transport/GamePacketHandler.js
* Make sure the string ['code_name'] exists in server/com.transport/data/com.codes.js

# Broadcasting a packet from server > all connected & authenticated client(s)
* Example:
```javascript
// Example sending a simple string to every client
Transport.Broadcast(CODES['com.hello'], 'Hello');

// Example specific object data
Transport.Broadcast(CODES['com.new_player'], { PlayerIDExample123: 123, MessageObjectName: 'A new player has joined' });
```
Make sure the packet for CODES['xx'] exists at server/com.transport/data/com.codes.js

# Transport tuning
* See all tune options at /server/.env file

# Cloudflare
* Use this transport app behind Cloudflare, set SSL to flexible so you dont have to deal with attackers or heavy encryption.

* Cf-IP header, you may have to edit line 32 at transport.js to get CF-Connecting-IP header
Example: 
```javascript
const RemoteIP = req.headers['cf-connecting-ip'] || 
                     req.headers['x-forwarded-for'] || 
                     req.socket.remoteAddress;
```
