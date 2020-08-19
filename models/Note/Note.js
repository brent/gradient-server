const db = require('../../db');
const tableName = 'notes';

function getOne(id) {
  return new Promise((resolve, reject) => {
    const getOneSQL = `
      SELECT *
      FROM notes
      WHERE id = $1
      LIMIT 1;
    `;

    const query = {
      text: getOneSQL,
      values: [id],
    };

    db.query(query)
      .then(res => resolve(res.rows[0]))
      .catch(err => reject(err));
  });
}

function create({ entryId, content }) {
  return new Promise((resolve, reject) => {
    const createSQL = `
      INSERT INTO notes (entry_id, content)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const query = {
      text: createSQL,
      values: [entryId, content],
    };

    db.query(query)
      .then(res => resolve(res.rows[0]))
      .catch(err => reject(err));
  });
}

function remove({ id: noteId }) {
  return new Promise((resolve, reject) => {
    const removeSQL = `
      DELETE FROM ${tableName}
      WHERE id=$1;
    `;

    const query = {
      text: removeSQL,
      values: [noteId],
    }

    db.query(query)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

module.exports = {
  getOne,
  create,
  remove,
}
