const db = require('../../db');
const Entry = require('./Entry');

jest.mock('../../db');
db.query = jest.fn();

// sample entry data, according to schema
const entryData = {
  id: 1,
  user_id: 1,
  color: 'ff00ff',
  sentiment: 50,
  created_at: '',
  updated_at: '',
};

describe('Entry', () => {
  describe('getAll()', () => {
    it('should be a function', () => {
      expect(typeof Entry.getAll).toBe('function');
    });

    it('should call db.query() with supplied id', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(entryData)] });
      const res = await Entry.getAll(1);
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(entryData.user_id);
    });

    it('should call db.query() with no id if not supplied', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(entryData)] });
      const res = await Entry.getAll();
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues).not.toBeDefined();
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find entries';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Entry.getAll();
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('getOne()', () => {
    it('should be a function', () => {
      expect(typeof Entry.getOne).toBe('function');
    });

    it('should call db.query() with supplied id', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(entryData)] });
      const res = await Entry.getOne(entryData.id);
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(entryData.id);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find entry';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Entry.getOne(entryData.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('create()', () => {
    it('should be a function', () => {
      expect(typeof Entry.create).toBe('function');
    });

    it('should call db.query() with supplied user entry data', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(entryData)] });
      const res = await Entry.create({
        userId: entryData.user_id,
        color: entryData.color,
        sentiment: entryData.sentiment,
      });
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(entryData.user_id);
      expect(dbQueryQueryValues[1]).toBe(entryData.color);
      expect(dbQueryQueryValues[2]).toBe(entryData.sentiment);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find entry';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Entry.create({
          userId: entryData.user_id,
          color: entryData.color,
          sentiment: entryData.sentiment,
        });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('remove()', () => {
    it('should be a function', () => {
      expect(typeof Entry.remove).toBe('function');
    });

    it('should call db.query() with entry id', async () => {
      db.query.mockResolvedValue(Promise.resolve(1));
      await Entry.remove({ id: entryData.id });
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(entryData.id);
    });

    it('should retrun an error when something is wrong', async () => {
      const errorMessage = 'could not remove entry';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Entry.remove({ id: entryData.id });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });
});
