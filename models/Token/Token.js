const db = require('../../db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const TABLE_NAME = 'tokens';

function save(userId) {
  const token = generateRefreshToken();

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

function generateRefreshToken() {
  return uuidv4();
}

function generateAccessToken(tokenData) {
  const params = { ...tokenData };
  const token = jwt.sign(params, JWT_SECRET, { expiresIn: 300 });
  return token;
}

function decode(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded);
    });
  });
}

/*
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

  static updateRefreshToken(accessToken, refreshToken) {
    const { userId } = jwt.decode(accessToken);

    return new Promise((resolve, reject) => {
      const newToken = Token.generateRefreshToken();

      const updateRefreshTokenSQL = `
        UPDATE tokens
        SET token = $1
        WHERE token = $2
        AND user_id = $3
        RETURNING token, user_id;
      `;

      const query = {
        text: updateRefreshTokenSQL,
        values: [newToken, refreshToken, userId],
      };

      db.query(query)
        .then(res => {
          if (res.rows.length === 0) {
            reject(new Error('Refresh token not found'));
          }
          resolve(res.rows[0])
        })
        .catch(err => reject(err));
    });
  }

  static generateRefreshToken() {
    return uuidv4();
  }
}

module.exports = Token;
*/

module.exports = {
  save,
  generateRefreshToken,
  generateAccessToken,
  decode,
}
