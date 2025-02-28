const TestSetup = require('./testUtils');

describe('Message Functionality', () => {
    let testSetup;
    let clientSocket1;
    let clientSocket2;

    beforeAll(async () => {
        testSetup = new TestSetup();
        await testSetup.setup();
    });

    afterAll(async () => {
        await testSetup.teardown();
    });

    beforeEach(async () => {
        clientSocket1 = await testSetup.connectClient();
        clientSocket2 = await testSetup.connectClient();
    });

    afterEach(() => {
        clientSocket1.close();
        clientSocket2.close();
    });

    test('should handle sending and receiving messages', (done) => {
        const testUser = { username: 'testUser', room: 'general' };
        const testMessage = 'Hello, world!';

        clientSocket1.emit('join_room', testUser);

        clientSocket1.on('receive_message', (data) => {
            expect(data.username).toBe(testUser.username);
            expect(data.message).toBe(testMessage);
            expect(data.time).toBeDefined();
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('send_message', testMessage);
        }, 100);
    });

    test('should handle private messages', (done) => {
        const user1 = { username: 'user1', room: 'general' };
        const user2 = { username: 'user2', room: 'general' };
        const privateMessage = 'Private message test';

        clientSocket1.emit('join_room', user1);
        clientSocket2.emit('join_room', user2);

        clientSocket2.on('private_message', (data) => {
            expect(data.from).toBe(user1.username);
            expect(data.message).toBe(privateMessage);
            expect(data.time).toBeDefined();
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('private_message', {
                targetUsername: user2.username,
                message: privateMessage
            });
        }, 100);
    });

    test('should handle typing indicators', (done) => {
        const user = { username: 'testUser', room: 'general' };
        
        clientSocket1.emit('join_room', user);
        clientSocket2.emit('join_room', { username: 'user2', room: 'general' });

        clientSocket2.on('user_typing', (data) => {
            expect(data.username).toBe(user.username);
            expect(data.isTyping).toBe(true);
            done();
        });

        setTimeout(() => {
            clientSocket1.emit('typing', true);
        }, 100);
    });
});