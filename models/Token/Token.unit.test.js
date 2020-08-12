const db = require('../../db');
const Token = require('./Token');

jest.mock('../../db');

const tokenData = {
  id: '1',
  user_id: '1',
  token: '6630402c-bdb7-4777-a8ab-12dc330f5749',
  created_at: '',
  updated_at: '',
};

describe('Token', () => {
  it('should exist', () => {
    expect(Token).toBeDefined();
  });

  describe('save()', () => {
    it('should be a function', () => {
      expect(typeof Token.save).toBe('function');
    });

    it('should call db.query() with supplied token data', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(tokenData.token)] });
      const res = await Token.save(tokenData.user_id);
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(tokenData.user_id);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not save token';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Token.save(tokenData.user_id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('generateRefreshToken()', () => {
    it('should be a function', () => {
      expect(typeof Token.generateRefreshToken).toBe('function');
    });

    it('should return a uuidv4 formatted string', () => {
      const uuid = Token.generateRefreshToken();
      const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });
  });

  describe('generateAccessToken()', () => {
    it('should be a function', () => {
      expect(typeof Token.generateAccessToken).toBe('function');
    });

    it('should return properly formatted jwt', () => {
      const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
      const jwt = Token.generateAccessToken();
      expect(jwt).toMatch(jwtRegex);
    });
  });

  describe('decode()', () => {
    it('should be a function', () => {
      expect(typeof Token.decode).toBe('function');
    });

    it('should properly decode a jwt', async () => {
      const encodedToken = {
        gradient_id: 1,
        user_id: 1,
        email: 'user@email.ext',
      };

      const token = Token.generateAccessToken(encodedToken);
      const decodedToken = await Token.decode(token);
      expect(decodedToken.gradient_id).toBe(encodedToken.gradient_id);
      expect(decodedToken.user_id).toBe(encodedToken.user_id);
      expect(decodedToken.email).toBe(encodedToken.email);
      expect(decodedToken.exp).toBeDefined();
      expect(decodedToken.iat).toBeDefined();
    });
  });

  describe('findTokenForUser()', () => {
    it('should be a function', () => {
      expect(typeof Token.findTokenForUser).toBe('function');
    });

    it('should call db.query() with user id', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(tokenData.token)] });
      const response = await Token.findTokenForUser(tokenData.id);
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(tokenData.user_id);
    });
  });

  describe('updateRefreshToken()', () => {
    it('should be a function', () => {
      expect(typeof Token.updateRefreshToken).toBe('function');
    });
  });
});
