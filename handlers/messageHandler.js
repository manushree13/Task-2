const userService = require('../services/userService');
const { ValidationError, UserError } = require('../utils/errors');

function validateMessage(message) {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new ValidationError('Message cannot be empty');
    }
}

function handleMessage(io, socket, message) {
    try {
        validateMessage(message);
        const user = userService.getUser(socket.id);
        if (!user) {
            throw new UserError('User not found');
        }

        io.to(user.room).emit('receive_message', {
            username: user.username,
            message: message.trim(),
            time: new Date().toLocaleTimeString()
        });
    } catch (error) {
        socket.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

function handlePrivateMessage(io, socket, { targetUsername, message }) {
    try {
        validateMessage(message);
        if (!targetUsername) {
            throw new ValidationError('Target username is required');
        }

        const sender = userService.getUser(socket.id);
        if (!sender) {
            throw new UserError('Sender not found');
        }

        const [targetSocketId] = userService.getUserByUsername(targetUsername) || [];
        if (!targetSocketId) {
            throw new UserError('Target user not found');
        }

        io.to(targetSocketId).emit('private_message', {
            from: sender.username,
            message: message.trim(),
            time: new Date().toLocaleTimeString()
        });
        socket.emit('private_message', {
            to: targetUsername,
            message: message.trim(),
            time: new Date().toLocaleTimeString()
        });
    } catch (error) {
        socket.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

function handleTyping(io, socket, isTyping) {
    try {
        const user = userService.getUser(socket.id);
        if (!user) {
            throw new UserError('User not found');
        }

        socket.to(user.room).emit('user_typing', {
            username: user.username,
            isTyping: Boolean(isTyping)
        });
    } catch (error) {
        socket.emit('error', { 
            type: error.code || 'ERROR',
            message: error.message 
        });
    }
}

module.exports = {
    handleMessage,
    handlePrivateMessage,
    handleTyping
};