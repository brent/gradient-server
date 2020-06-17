const db = require('../db');
const tableName = 'entries';

const Note = require('./Note');

class Entry {
  static getAllForUser(userId) {
    return new Promise((resolve, reject) => {
      const getAllForUserSQL = `
        SELECT entries.*, notes.content
        FROM entries
        LEFT JOIN notes ON entries.id = notes.entry_id
        WHERE entries.user_id = $1
        ORDER BY entries.created_at DESC;
      `;

      const query = {
        text: getAllForUserSQL,
        values: [userId],
      };

      db.query(query)
        .then(res => resolve(res.rows))
        .catch(err => reject(err));
    });
  }

  static getOne(id) {
    return new Promise((resolve, reject) => {
      const getOneSQL = `
        SELECT *
        FROM entries
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

  static createForUser(userId, params) {
    const { color, sentiment, noteContent } = params;

    const createForUserSQL = `
      INSERT INTO entries (user_id, color, sentiment)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const query = {
      text: createForUserSQL,
      values: [userId, color, sentiment],
    };


    return new Promise((resolve, reject) => {
      if (noteContent === undefined) {
        db.query(query)
          .then(res => resolve(res.rows[0]))
          .catch(err => reject(err));
      } else {
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
      }
    });
  }
}

module.exports = Entry;
