const request = require('supertest');
const app = require('../../app');

const User = require('../../models/User');
const Entry = require('../../models/Entry');
const Note = require('../../models/Note');

const BASE_URL = '/api/v1';

let testUser = {
  email: 'testUser@email.ext',
  password: 'password1',
};

let testEntry = {
  color: '777777',
  sentiment: 50,
  noteContent: 'Lorem ipsum...',
};


describe('api', () => {
  let createUserResponse;
  let createEntryResponse;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    createUserResponse = await request(app)
      .post(`${BASE_URL}/auth/signup`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(testUser);

    testUser = {
      ...testUser,
      id: createUserResponse.body.user.id,
    };

    accessToken = createUserResponse.body.tokens.access;
    refreshToken = createUserResponse.body.tokens.refresh;

    createEntryResponse = await request(app)
      .post(`${BASE_URL}/entries`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send(testEntry);

    testEntry = {
      ...testEntry,
      id: createEntryResponse.body.id,
      userId: createEntryResponse.body.user_id,
      noteId: createEntryResponse.body.note.id,
    };
  });

  describe('public routes', () => {
    describe('GET /', () => {
      it('should respond with ok', async () => {
        const response = await request(app).get(`${BASE_URL}/`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('OK');
      });
    });

    describe('POST /auth/signup', () => {
      it('should respond with a 201', () => {
        expect(createUserResponse.status).toBe(201);
      });

      test('response body should include user', () => {
        expect(createUserResponse.body.user.id).toBeDefined();
        expect(createUserResponse.body.user.email).toBeDefined();
        expect(createUserResponse.body.user.gradient_id).toBeDefined();
      });

      test('response body should include tokens', () => {
        expect(createUserResponse.body.tokens.access).toBeDefined();
        expect(createUserResponse.body.tokens.refresh).toBeDefined();
      });
    });

    describe('POST /auth/login', () => {
      let response;

      beforeAll(async () => {
        response = await request(app)
          .post(`${BASE_URL}/auth/login`)
          .send(testUser);

        accessToken = response.body.tokens.access;
        refreshToken = response.body.tokens.refresh;
      });

      it('should respond with a 200', () => {
        expect(response.status).toBe(200);
      });

      test('response body should include user', () => {
        expect(response.body.user.id).toBeDefined();
        expect(response.body.user.email).toBeDefined();
        expect(response.body.user.gradientId).toBeDefined();
      });

      test('response body should include tokens', () => {
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
      });
    });
  });

  describe('private routes', () => {
    beforeAll(async () => {
      const logInResponse = await request(app)
        .post(`${BASE_URL}/auth/login`)
        .send(testUser);

      accessToken = logInResponse.body.tokens.access;
      refreshToken = logInResponse.body.tokens.refresh;
    });

    describe('GET /entries', () => {
      let response;

      beforeAll(async () => {
        response = await request(app)
          .get(`${BASE_URL}/entries`)
          .set('Authorization', `Bearer ${accessToken}`);
      });

      it('should respond with a 200', () => {
        expect(response.status).toBe(200);
      });

      test('response body should be an array', () => {
        expect(response.body).toBeDefined();
        expect(typeof response.body.length).toBe('number');
      });
    });

    describe('POST /auth/signup', () => {
      it('should respond with a 201', () => {
        expect(createUserResponse.status).toBe(201);
      });

      it('should respond with a user object', () => {
        expect(createUserResponse.body.user).toBeDefined();
        expect(typeof createUserResponse.body.user.id).toBe('number');
        expect(typeof createUserResponse.body.user.email).toBe('string');
        expect(typeof createUserResponse.body.user.gradient_id).toBe('number');
      });
    });

    describe('POST /entries', () => {
      it('should respond with a 201', async () => {
        expect(createEntryResponse.status).toBe(201);
      });

      it('should respond with an entry object', () => {
        expect(createEntryResponse.body.id).toBeDefined();
        expect(createEntryResponse.body.user_id).toBeDefined();
        expect(createEntryResponse.body.color).toBeDefined();
        expect(createEntryResponse.body.sentiment).toBeDefined();
      });

      it('should create a note if supplied one', () => {
        expect(createEntryResponse.body.note.id).toBe(testEntry.noteId);
        expect(createEntryResponse.body.note.content).toBe(testEntry.noteContent);
      });
    });
  });

  afterAll(async () => {
    await Note.remove({ id: testEntry.noteId });
    await Entry.remove({ id: testEntry.id });
    await User.remove({ id: testUser.id });
  });
});
