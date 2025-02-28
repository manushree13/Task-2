class UserService {
    constructor() {
        this.users = new Map();
    }

    addUser(socketId, username, room) {
        this.users.set(socketId, { username, room });
    }

    removeUser(socketId) {
        const user = this.users.get(socketId);
        if (user) {
            this.users.delete(socketId);
        }
        return user;
    }

    getUser(socketId) {
        return this.users.get(socketId);
    }

    getUserByUsername(username) {
        return Array.from(this.users.entries())
            .find(([_, user]) => user.username === username);
    }

    updateUserRoom(socketId, newRoom) {
        const user = this.users.get(socketId);
        if (user) {
            user.room = newRoom;
            this.users.set(socketId, user);
        }
        return user;
    }

    getRoomUsers(room) {
        return Array.from(this.users.entries())
            .filter(([_, user]) => user.room === room)
            .map(([_, user]) => user.username);
    }
}

module.exports = new UserService();