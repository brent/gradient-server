"use strict";

const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const TABLE_NAME = 'tokens';

class Token {
  static saveTokenForUser(userId) {
    const token = Token.generateRefreshToken();

    return new Promise((resolve, reject) => {
      const saveTokenForUserSQL = `
        INSERT INTO tokens(user_id, token)
        VALUES ($1, $2)
        RETURNING token;
      `;

      const query = {
        text: saveTokenForUserSQL,
        values:[userId, token],
      };

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  static findTokenForUser(userId) {
    return new Promise((resolve, reject) => {
      const findTokenForUserSQL = `
        SELECT token
        FROM tokens
        WHERE user_id = $1
        LIMIT 1;
      `;

      const query = {
        text: findTokenForUserSQL,
        values: [userId],
      };

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  // TODO: Refactor
  // a token should be generateable with just
  // a user id as well
  static generateAccessToken(user) {
    const params = {
      userId: user.id,
      username: user.username,
    };

    const token = jwt.sign(params, JWT_SECRET, { expiresIn: 300 });

    return token;
  }

  static decode(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          reject(err);
        }
        resolve(decoded);
      });
    });
  }

  static updateRefreshToken(userId, refreshToken) {
    return new Promise((resolve, reject) => {
      const newToken = Token.generateRefreshToken();

      const updateRefreshTokenSQL = `
        UPDATE tokens
        SET token = $1
        WHERE user_id = $2 
        AND token = $3
        RETURNING token;
      `;

      const query = {
        text: updateRefreshTokenSQL,
        values: [newToken, userId, refreshToken],
      };

      db.query(query)
        .then(res => resolve(res.rows[0]))
        .catch(err => reject(err));
    });
  }

  static generateRefreshToken() {
    return uuidv4();
  }
}

module.exports = Token;
