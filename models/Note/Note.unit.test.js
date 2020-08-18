const db = require('../../db');
const Note = require('./Note');

jest.mock('../../db');

// sample note data, according to schema
const noteData = { 
  id: 1,
  entryId: 1,
  content: 'lorem ipsum',
  created_at: '',
  updated_at: '',
};

describe('Note', () => {
  describe('getOne()', () => {
    it('should be a function', () => {
      expect(typeof Note.getOne).toBe('function');
    });

    it('should call db.query() with passed id', async () => {
      db.query.mockResolvedValueOnce({ rows: [Promise.resolve(noteData)] });
      const res = await Note.getOne(noteData.id);
      expect(db.query).toHaveBeenCalled();
      expect(res.id).toBe(noteData.id);
      const lastQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      expect(lastQueryCall[0]['values'][0]).toBe(noteData.id);
    });

    it('should return an error if something\'s wrong', async () => {
      const errorMessage = 'note not found';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Note.getOne(1);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });

    it('should not return an array', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(noteData)] });
      const res = await Note.getOne(noteData.id);
      expect(typeof res).not.toBe('Array');
    });
  });

  describe('create()', () => {
    it('should be a function', () => {
      expect(typeof Note.create).toBe('function');
    });

    it('should call db.query() with note data', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(noteData)] });
      const res = await Note.create({ 
        entryId: noteData.entryId,
        content: noteData.content,
      });
      const lastQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      expect(lastQueryCall[0]['values'][0]).toBe(noteData.id);
      expect(lastQueryCall[0]['values'][1]).toBe(noteData.content);
    });

    it('should return an error if something\'s wrong', async () => {
      const errorMessage = 'note creation failed';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Note.create({ 
          entryId: noteData.entryId,
          content: noteData.content,
        });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });

    it('should not return an array', async () => {
      db.query.mockResolvedValue({ rows: [Promise.resolve(noteData)] });
      const res = await Note.create({ 
        entryId: noteData.entryId,
        content: noteData.content,
      });
      expect(typeof res).not.toBe('Array');
    });
  });

  describe('remove()', () => {
    it('should be a function', () => {
      expect(typeof Note.remove).toBe('function');
    });

    // this test (and others like it) pass 
    // even if the function body is empty...
    it('should call db.query() with note id', async () => {
      db.query.mockResolvedValue(Promise.resolve(1));
      const res = await Note.remove({ id: noteData.id });
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(noteData.id);
    });

    it('should retrun an error when something is wrong', async () => {
      const errorMessage = 'could not remove note';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Note.remove({ id: noteData.id });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });
});
