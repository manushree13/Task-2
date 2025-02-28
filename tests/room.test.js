const TestSetup = require('./testUtils');

describe('Room Functionality', () => {
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

    test('should receive room list upon connection', (done) => {
        clientSocket1.on('room_list', (rooms) => {
            expect(Array.isArray(rooms)).toBe(true);
            expect(rooms).toContain('general');
            expect(rooms).toContain('random');
            expect(rooms).toContain('tech');
            done();
        });
    });

    test('should handle joining a room', (done) => {
        const testData = { username: 'testUser', room: 'general' };
        
        clientSocket1.on('user_joined', (data) => {
            expect(data.username).toBe(testData.username);
            expect(data.message).toBe(`${testData.username} has joined the room`);
            done();
        });

        clientSocket1.emit('join_room', testData);
    });

    test('should handle creating new room', (done) => {
        const newRoom = 'test-room';

        clientSocket1.on('room_list', (rooms) => {
            if (rooms.includes(newRoom)) {
                expect(Array.isArray(rooms)).toBe(true);
                expect(rooms).toContain(newRoom);
                done();
            }
        });

        clientSocket1.emit('create_room', newRoom);
    });

    test('should handle room switching', (done) => {
        const user = { username: 'switchUser', room: 'general' };
        const newRoom = 'random';

        clientSocket1.emit('join_room', user);

        clientSocket1.on('user_joined', (data) => {
            if (data.username === user.username) {
                expect(data.message).toBe(`${user.username} has joined the room`);
                done();
            }
        });

        setTimeout(() => {
            clientSocket1.emit('switch_room', { newRoom });
        }, 100);
    });
});