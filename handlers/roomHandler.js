const userService = require('../services/userService');
const roomService = require('../services/roomService');
const { ValidationError, RoomError, UserError } = require('../utils/errors');

function validateRoomData(room, username = null) {
    if (!room || typeof room !== 'string' || room.trim().length === 0) {
        throw new ValidationError('Room name cannot be empty');
    }
    if (username && (!username || typeof username !== 'string' || username.trim().length === 0)) {
        throw new ValidationError('Username cannot be empty');
    }
}

function handleJoinRoom(io, socket, { username, room }) {
    try {
        validateRoomData(room, username);
        if (!roomService.hasRoom(room)) {
            throw new RoomError('Room does not exist');
        }

        socket.join(room);
        userService.addUser(socket.id, username.trim(), room);
        
        io.to(room).emit('user_joined', {
            username,
            message: `${username} has joined the room`
        });

        const roomUsers = userService.getRoomUsers(room);
        io.to(room).emit('room_users', roomUsers);
    } catch (error) {
        socket.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

function handleCreateRoom(io, roomName) {
    try {
        validateRoomData(roomName);
        if (roomService.addRoom(roomName.trim())) {
            io.emit('room_list', roomService.getRooms());
        } else {
            throw new RoomError('Room already exists');
        }
    } catch (error) {
        io.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

function handleSwitchRoom(io, socket, { newRoom }) {
    try {
        validateRoomData(newRoom);
        if (!roomService.hasRoom(newRoom)) {
            throw new RoomError('Target room does not exist');
        }

        const user = userService.getUser(socket.id);
        if (!user) {
            throw new UserError('User not found');
        }

        const oldRoom = user.room;
        socket.leave(oldRoom);
        io.to(oldRoom).emit('user_left', {
            username: user.username,
            message: `${user.username} has left the room`
        });

        const oldRoomUsers = userService.getRoomUsers(oldRoom);
        io.to(oldRoom).emit('room_users', oldRoomUsers);

        socket.join(newRoom);
        userService.updateUserRoom(socket.id, newRoom);
        
        io.to(newRoom).emit('user_joined', {
            username: user.username,
            message: `${user.username} has joined the room`
        });

        const newRoomUsers = userService.getRoomUsers(newRoom);
        io.to(newRoom).emit('room_users', newRoomUsers);
    } catch (error) {
        socket.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

function handleDisconnect(io, socket) {
    try {
        const user = userService.getUser(socket.id);
        if (!user) {
            return;
        }

        io.to(user.room).emit('user_left', {
            username: user.username,
            message: `${user.username} has left the room`
        });
        
        userService.removeUser(socket.id);
        const roomUsers = userService.getRoomUsers(user.room);
        io.to(user.room).emit('room_users', roomUsers);
    } catch (error) {
        io.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

module.exports = {
    handleJoinRoom,
    handleCreateRoom,
    handleSwitchRoom,
    handleDisconnect
};