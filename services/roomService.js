const { DEFAULT_ROOMS } = require('../config/constants');

class RoomService {
    constructor() {
        this.rooms = new Set(DEFAULT_ROOMS);
    }

    getRooms() {
        return Array.from(this.rooms);
    }

    addRoom(roomName) {
        if (!this.rooms.has(roomName)) {
            this.rooms.add(roomName);
            return true;
        }
        return false;
    }

    hasRoom(roomName) {
        return this.rooms.has(roomName);
    }
}

module.exports = new RoomService();