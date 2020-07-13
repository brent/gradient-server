const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
});

const createTriggerFunctionQuery = `
  CREATE FUNCTION trigger_update_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`;

const setUsersTriggerFunctionQuery = `
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_update_timestamp();
`;

const setTokensTriggerFunctionQuery = `
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_update_timestamp();
`;

const setEntriesTriggerFunctionQuery = `
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_update_timestamp();
`;

const setNotesTriggerFunctionQuery = `
  CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_update_timestamp();
`;

const createUsersTableQuery = `
  CREATE TABLE users (
    id INT GENERATED BY DEFAULT AS IDENTITY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gradient_id INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
  );
`;

const createTokensTableQuery = `
  CREATE TABLE tokens (
    id INT GENERATED BY DEFAULT AS IDENTITY,
    user_id INT UNIQUE NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`;

const createEntriesTableQuery = `
  CREATE TABLE entries (
    id INT GENERATED BY DEFAULT AS IDENTITY,
    user_id INT NOT NULL,
    color TEXT NOT NULL,
    sentiment INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`;

const createNotesTableQuery = `
  CREATE TABLE notes (
    id INT GENERATED BY DEFAULT AS IDENTITY,
    entry_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (entry_id) REFERENCES entries (id)
  );
`;

const createGradientsTableQuery = `
  CREATE TABLE gradients (
    id INT GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    start_color TEXT NOT NULL,
    end_color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
  );
`;

const handleError = (err) => {
  switch (err.code) {
    case '42723':
      console.log('trigger_update_timestamp() already exists');
      break;
    case '42710':
      console.log('update trigger already set');
      break;
    case '42P07':
      // table exists
      console.log(err.message);
      break;
    default:
      console.log(err);
  }
}

const createTriggerFunction = () => {
  return new Promise((resolve, reject) => {
    pool.query(createTriggerFunctionQuery)
      .then(res => resolve('trigger_update_timestamp() created'))
      .catch(err => reject(err));
  });
}

const createUsersTable = () => {
  return new Promise((resolve, reject) => {
    pool.query(createUsersTableQuery)
      .then(res => resolve('users table created'))
      .catch(err => reject(err));
  });
}

const createTokensTable = () => {
  return new Promise((resolve, reject) => {
    pool.query(createTokensTableQuery)
      .then(res => resolve('tokens table created'))
      .catch(err => reject(err));
  });
}

const createEntriesTable = () => {
  return new Promise((resolve, reject) => {
    pool.query(createEntriesTableQuery)
      .then(res => resolve('entries table created'))
      .catch(err => reject(err));
  });
}

const createNotesTable = () => {
  return new Promise((resolve, reject) => {
    pool.query(createNotesTableQuery)
      .then((res) => resolve('notes table created'))
      .catch((err) => reject(err));
  });
}

const createGradientsTable = () => {
  return new Promise((resolve, reject) => {
    pool.query(createGradientsTableQuery)
      .then((res) => resolve('gradients table created'))
      .catch((err) => reject(err));
  });
}

const usersTrigger = () => {
  return new Promise((resolve, reject) => {
    pool.query(setUsersTriggerFunctionQuery)
      .then(res => resolve('users update trigger set'))
      .catch(err => reject(err));
  });
}

const tokensTrigger = () => {
  return new Promise((resolve, reject) => {
    pool.query(setTokensTriggerFunctionQuery)
      .then(res => resolve('tokens update trigger set'))
      .catch(err => reject(err));
  });
}

const entriesTrigger = () => {
  return new Promise((resolve, reject) => {
    pool.query(setEntriesTriggerFunctionQuery)
      .then(res => resolve('entries update trigger set'))
      .catch(err => reject(err));
  });
}

const notesTrigger = () => {
  return new Promise((resolve, reject) => {
    pool.query(setNotesTriggerFunctionQuery)
      .then(res => resolve('notes update trigger set'))
      .catch(err => reject(err));
  });
}

// THIS MOSTLY WORKS
// returns annoying objects when there are dupes
createTriggerFunction()
  .catch(err => handleError(err))
  .then(createUsersTable)
  .then(res => console.log(res))
  .catch(err => handleError(err))
  .then(() => {
    return Promise.allSettled([createTokensTable(), createEntriesTable(), createGradientsTable()])
      .then(res => res.forEach(r => console.log(r)))
  })
  .then(() => createNotesTable())
  .catch(err => handleError(err))
  .then(() => {
    return Promise.allSettled([usersTrigger(), tokensTrigger(), entriesTrigger(), notesTrigger()])
      .then(res => res.forEach(r => console.log(r)))
  })
  .catch(err => handleError(err));

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};
