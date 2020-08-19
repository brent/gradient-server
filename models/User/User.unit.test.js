const db = require('../../db');
const User = require('./User');

jest.mock('../../db');

const userData = {
  id: 1,
  email: 'user@email.ext',
  password: 'password1',
  gradient_id: 1,
};

describe('User', () => {
  describe('getOne()', () => {
    it('should be a function', () => {
      expect(typeof User.getOne).toBe('function');
    });

    it('should return a single result', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.getOne(userData.id);
      expect(result.length).toBeUndefined();
    });

    it('should call db.query() with passed id', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.getOne(userData.id);
      const getOneCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const getOneCallValues = getOneCall[0]['values'];
      expect(getOneCallValues[0]).toBe(userData.id);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find user';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await User.getOne(userData.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('findByEmail()', () => {
    it('should be a function', () => {
      expect(typeof User.findByEmail).toBe('function');
    });

    it('should return a single result', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.findByEmail(userData.email);
      expect(result.length).toBeUndefined();
    });

    it('should call db.query() with passed id', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.findByEmail(userData.email);
      const findByEmailCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const findByEmailCallValues = findByEmailCall[0]['values'];
      expect(findByEmailCallValues[0]).toBe(userData.email);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find user';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await User.findByEmail(userData.email);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('create()', () => {
    it('should be a function', () => {
      expect(typeof User.create).toBe('function');
    });

    it('should return a single result', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.create({
        email: userData.email,
        password: userData.password,
      });
      expect(result.length).toBeUndefined();
    });

    it('should call db.query() with passed data', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.create({
        email: userData.email,
        password: userData.password,
      });
      const createCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const createCallValues = createCall[0]['values'];
      expect(createCallValues[0]).toBe(userData.email);
      expect(createCallValues[1]).toBeDefined();
    });
  });

  describe('generateHash()', () => {
    it('should be a function', () => {
      expect(typeof User.generateHash).toBe('function');
    });
  });
 
  describe('update()', () => {
    it('should be a function', () => {
      expect(typeof User.update).toBe('function');
    });

    it('should return a single result', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.update({
        id: userData.id,
        email: userData.email,
        password: userData.password,
      });
      expect(result.length).toBeUndefined();
    });

    it('should call db.query() with passed data', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const result = await User.update({
        id: userData.id,
        email: userData.email,
        password: userData.password,
      });
      const updateCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const updateCallValues = updateCall[0]['values'];
      expect(updateCallValues[0]).toBe(userData.id);
      expect(updateCallValues[1]).toBe(userData.email);
      expect(updateCallValues[2]).toBeDefined();
    });
  });

  describe('getAll()', () => {
    it('should be a function', () => {
      expect(typeof User.getAll).toBe('function');
    });

    it('should call db.query()', async () => {
      db.query.mockResolvedValue({ rows: [userData] });
      const res = await User.getAll();
      expect(db.query).toHaveBeenCalled();
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find users';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await User.getAll();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('comparePassword()', () => {
    it('should be a function', () => {
      expect(typeof User.comparePassword).toBe('function');
    });
  });

  describe('remove()', () => {
    it('should be a function', () => {
      expect(typeof User.remove).toBe('function');
    });

    it('should call db.query() with user id', async () => {
      db.query.mockResolvedValue(1);
      const res = await User.remove({ id: userData.id });
      const removeCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const removeCallValues = removeCall[0]['values'];
      expect(removeCallValues.length).toBe(1);
      expect(removeCallValues[0]).toBe(1);
    });

    it('should throw an error', async () => {
      const errorMessage = 'could not delete user';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await User.remove({ id: userData.id });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });
});
