class ChatError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

class ValidationError extends ChatError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR');
    }
}

class RoomError extends ChatError {
    constructor(message) {
        super(message, 'ROOM_ERROR');
    }
}

class UserError extends ChatError {
    constructor(message) {
        super(message, 'USER_ERROR');
    }
}

module.exports = {
    ChatError,
    ValidationError,
    RoomError,
    UserError
};