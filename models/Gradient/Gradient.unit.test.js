const db = require('../../db');
const Gradient = require('./Gradient');

jest.mock('../../db');

const gradientData = {
  id: '1',
  name: 'default',
  start_color: 'ffffff',
  end_color: '000000',
  created_at: '',
};

describe('Gradient', () => {
  it('should exist', () => {
    expect(Gradient).toBeDefined();
  });

  describe('getOne()', () => {
    it('should be a function', () => {
      expect(typeof Gradient.getOne).toBe('function');
    });

    it('should call db.query() with supplied id', async () => {
      db.query.mockResolvedValue({ rows: [gradientData] });
      const res = await Gradient.getOne(gradientData.id);
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(gradientData.id);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find Gradient';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Gradient.getOne(gradientData.id);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('create()', () => {
    it('should be a function', () => {
      expect(typeof Gradient.create).toBe('function');
    });

    it('should call db.query() with supplied Gradient data', async () => {
      db.query.mockResolvedValue({ rows: [gradientData] });
      const res = await Gradient.create({
        name: gradientData.name,
        start: gradientData.start_color,
        end: gradientData.end_color,
      });
      const dbQueryCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      const dbQueryQueryValues = dbQueryCall[0]['values'];
      expect(dbQueryQueryValues[0]).toBe(gradientData.name);
      expect(dbQueryQueryValues[1]).toBe(gradientData.start_color);
      expect(dbQueryQueryValues[2]).toBe(gradientData.end_color);
    });

    it('should return an error when something goes wrong', async () => {
      const errorMessage = 'could not find Gradient';
      db.query.mockRejectedValue(new Error(errorMessage));
      try {
        await Gradient.create({
        });
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });
});
