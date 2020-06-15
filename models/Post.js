"use strict";

const db = require('../db');
const tableName = 'posts';

class Post {
  static getAll() {
    return new Promise((resolve, reject) => {
      const getAllSQL = `
        SELECT *
        FROM posts
        ORDER BY id DESC;
      `;

      const query = {
        text: getAllSQL,
      }

      db.query(query)
        .then(res => resolve(res.rows))
        .catch(err => reject(err));
    });
  }

  static get(id) {
    return new Promise((resolve, reject) => {
      const getByIdSQL = `
        SELECT *
        FROM posts
        WHERE id = $1
        LIMIT 1;
      `;

      const query = {
        text: getByIdSQL,
        values: [id],
      }

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  static createForUser(record, userId) {
    return new Promise((resolve, reject) => {
      const createForUserSQL = `
        INSERT INTO posts(user_id, content)
        VALUES ($1, $2)
        RETURNING *;
      `;

      const query = {
        text: createForUserSQL,
        values: [userId, record],
      }

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  static updateForUser(params, userId) {
    const { id, content } = params;
    return new Promise((resolve, reject) => {
      const updateForUserSQL = `
        UPDATE posts
        SET content = $1
        WHERE id = $2
        AND user_id = $3
        RETURNING *;
      `;

      const query = {
        text: updateForUserSQL,
        values: [content, id, userId],
      }

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }
}

module.exports = Post;
