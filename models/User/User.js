"use strict";

const db = require('../../db');
const bcrypt = require('bcrypt');

const tableName = 'users';

function getAll() {
  return new Promise((resolve, reject) => {
    const getAllSQL = `
      SELECT id, email
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

function getOne(userId) {
  return new Promise((resolve, reject) => {
    const findByIdSQL = `
      SELECT id, email, gradient_id
      FROM ${tableName}
      WHERE id = $1
      LIMIT 1;
    `;

    const query = {
      text: findByIdSQL,
      values: [userId],
    };

    db.query(query)
      .then(res => resolve(res.rows[0]))
      .catch(err => reject(err));
  });
}

function findByEmail(email) {
  return new Promise((resolve, reject) => {
    const findByEmailSQL = `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1;
    `;

    const query = {
      text: findByEmailSQL,
      values: [email],
    }

    db.query(query)
      .then(res => resolve(res.rows[0]))
      .catch(err => reject(err));
  });
}

function create({ email, password }) {
  return new Promise((resolve, reject) => {
    generateHash(password).then(hash => {
      const createUserSQL = `
        INSERT INTO users(email, password)
        VALUES ($1, $2)
        RETURNING id, email, gradient_id;
      `;

      const query = {
        text: createUserSQL,
        values: [email, hash],
      };

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
      });
  });
}

function generateHash(password) {
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

function update({ id, email, password }) {
    return new Promise((resolve, reject) => {
      generateHash(password).then(hash => {
        const updateUserSQL = `
          UPDATE users
          SET 
            email = $2,
            password = $3
          WHERE id = $1
          RETURNING id, email;
        `;

        const query = {
          text: updateUserSQL,
          values: [id, email, hash]
        }

        db.query(query)
          .then(res => resolve(res.rows[0]))
          .catch(err => reject(err));
      });
    });
}

function comparePassword({ email, password }) {
  return new Promise((resolve, reject) => {
    findByEmail(email)
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

module.exports = {
  getOne,
  findByEmail,
  create,
  generateHash,
  update,
  getAll,
  comparePassword,
};
