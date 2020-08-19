const db = require('../../db');
const tableName = 'gradientns';

function getOne(gradientId) {
  return new Promise((resolve, reject) => {
    const getOneSQL = `
      SELECT *
      FROM gradients
      WHERE id = $1
      LIMIT 1;
    `;

    const query = {
      text: getOneSQL,
      values: [gradientId],
    };

    db.query(query)
      .then((res) => resolve(res.rows[0]))
      .catch((err) => reject(err));
  });
}

function create({ name, start, end }) {
  return new Promise((resolve, reject) => {
    const createSQL = `
      INSERT INTO gradients (name, start_color, end_color)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const query = {
      text: createSQL,
      values: [name, start, end],
    };

    db.query(query)
      .then((res) => resolve(res.rows[0]))
      .catch((err) => reject(err));
  });
}

module.exports = {
  getOne,
  create,
}
