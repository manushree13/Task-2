const io = require('socket.io-client');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { app } = require('../server');

class TestSetup {
    async setup() {
        this.httpServer = createServer(app);
        this.ioServer = new Server(this.httpServer);
        this.port = 3001;
        await new Promise(resolve => this.httpServer.listen(this.port, resolve));
    }

    async teardown() {
        await this.ioServer.close();
        await this.httpServer.close();
    }

    createClientSocket() {
        return io(`http://localhost:${this.port}`);
    }

    async connectClient() {
        const socket = this.createClientSocket();
        await new Promise(resolve => socket.on('connect', resolve));
        return socket;
    }
}

module.exports = TestSetup;