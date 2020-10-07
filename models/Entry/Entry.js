const db = require('../../db');
const tableName = 'entries';

const Note = require('../Note');

function getAll(userId = null) {
  return new Promise((resolve, reject) => {
    let querySQL;
    let query;

    if (userId) {
      querySQL = `
        SELECT entries.*, notes.id note_id, notes.content note_content
        FROM entries
        LEFT JOIN notes ON entries.id = notes.entry_id
        WHERE entries.user_id = $1
        ORDER BY entries.created_at DESC;
      `;

      query = {
        text: querySQL,
        values: [userId],
      };
    } else {
      querySQL = `
        SELECT entries.*, notes.id note_id, notes.content note_content
        FROM entries
        LEFT JOIN notes ON entries.id = notes.entry_id
        ORDER BY entries.created_at DESC
        RETURNING *;
      `;

      query = {
        text: querySQL,
      };
    }

    db.query(query)
      .then(res => resolve(res.rows))
      .catch(err => reject(err));
  });
}

function getOne(entryId) {
    return new Promise((resolve, reject) => {
      const getOneSQL = `
        SELECT *
        FROM entries
        WHERE id = $1
        LIMIT 1;
      `;

      const query = {
        text: getOneSQL,
        values: [entryId],
      };

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
}

function create({ userId, color, sentiment, date, noteContent = null }) {
  return new Promise((resolve, reject) => {
    const createForUserSQL = `
      INSERT INTO entries (user_id, color, sentiment, date)
      VALUES ($1, $2, $3, TO_TIMESTAMP($4, 'YYYY-MM-DD HH24:MI:SS'))
      RETURNING *;
    `;

    const query = {
      text: createForUserSQL,
      values: [userId, color, sentiment, date],
    };

    if (noteContent) {
      db.query(query)
        .then(res => res.rows[0])
        .then(entry => {
          Note.create({
            entryId: entry.id,
            content: noteContent,
          })
            .then(res => {
              entry['note'] = res;
              resolve(entry);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    } else {
      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    }
  });
}

function remove({ id: entryId }) {
  return new Promise((resolve, reject) => {
    const removeSQL = `
      DELETE FROM ${tableName}
      WHERE id = $1;
    `;

    const query = {
      text: removeSQL,
      values: [entryId],
    };

    db.query(query)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

module.exports = {
  getAll,
  getOne,
  create,
  remove,
}
