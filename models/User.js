"use strict";

const db = require('../db');
const bcrypt = require('bcrypt');

const tableName = 'users';

class User {
  static getAll() {
    return new Promise((resolve, reject) => {
      const getAllSQL = `
        SELECT id, username
        FROM users;
      `;

      const query = {
        text: getAllSQL,
      };

      db.query(query)
        .then(res => resolve(res.rows))
        .catch(err => reject(err))
    });
  }

  static get(id) {
    return new Promise((resolve, reject) => {
      const findByIdSQL = `
        SELECT id, username
        FROM users
        WHERE id = $1
        LIMIT 1;
      `;

      const query = {
        text: findByIdSQL,
        values: [id],
      };

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      const findByUsernameSQL = `
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1;
      `;

      const query = {
        text: findByUsernameSQL,
        values: [username],
      }

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  static create(params) {
    const { username, email, password } = params;

    return new Promise((resolve, reject) => {
      User.generateHash(password).then(hash => {
        const createUserSQL = `
          INSERT INTO users(username, email, password)
          VALUES ($1, $2, $3)
          RETURNING id, username;
        `;

        const query = {
          text: createUserSQL,
          values: [username, email, hash],
        };

        db.query(query)
          .then(res => resolve(res.rows[0]))
          .catch(err => reject(err));
        });
    });
  }

  static update(params) {
    const { id, username, email, password } = params;

    return new Promise((resolve, reject) => {
      User.generateHash(password).then(hash => {
        const updateUserSQL = `
          UPDATE users
          SET 
            username = $2,
            email = $3,
            password = $4
          WHERE id = $1
          RETURNING id, username;
        `;

        const query = {
          text: updateUserSQL,
          values: [id, username, email, hash]
        }

        db.query(query)
          .then(res => resolve(res.rows[0]))
          .catch(err => reject(err));
      });
    });
  }

  static generateHash(password) {
    const saltRounds = 10;

    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (!err) {
            resolve(hash);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  static comparePassword(params) {
    const { username, password } = params;

    return new Promise((resolve, reject) => {
      User.findByUsername(username)
        .then(user => {
          bcrypt.compare(password, user.password, (err, res) => {
            if (res == true) {
              resolve(user);
            } else if (res == false) {
              resolve(false);
            } else {
              reject(Error('could not compare passwords'));
            }
          });
        })
        .catch(err => console.log(err));
    });
  }
}

module.exports = User;
