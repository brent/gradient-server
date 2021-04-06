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
      const getOneEntry = async (entryId) => {
        const getOneSQL = `
          SELECT *
          FROM entries
          WHERE id = $1
          LIMIT 1;
        `;

        const getOneQuery = {
          text: getOneSQL,
          values: [entryId],
        };

        try {
          const entryResult = await db.query(getOneQuery);
          const entry = entryResult.rows[0];
          return entry;
        } catch (err) {
          throw err;
        }
      };

      const getMonthAvgSentimentForEntry = async ({ entry, insights = {} }) => {
        const monthAvgSentimentSQL = `
          SELECT AVG(sentiment)::numeric(10,0)
          FROM entries
          WHERE user_id = $1
          AND EXTRACT(MONTH FROM date) = $2;
        `;

        const date = new Date(entry.date);
        const month = date.getMonth() + 1;

        const monthAvgSentimentQuery = {
          text: monthAvgSentimentSQL,
          values: [entry.user_id, month],
        }

        try {
          const monthAvgSentimentResult = await db.query(monthAvgSentimentQuery);
          const monthAvgSentiment = monthAvgSentimentResult.rows[0]['avg'];
          let res = {
            entry: entry,
            insights: {
              monthAvgSentiment: monthAvgSentiment,
            },
          };

          if (Object.keys(insights).length !== 0) {
            res = {
              ...res,
              insights: {
                ...res.insights,
                ...insights,
              }
            }
          }

          return res;
        } catch (err) {
          throw err;
        }
      };

      const getSimilarDaysThisMonthForEntry = async ({ entry, insights = {}, range = 3 }) => {
        const similarDaysThisMonthSQL = `
          SELECT *
          FROM entries
          WHERE sentiment BETWEEN $3 AND $4
          AND user_id = $1
          AND EXTRACT(MONTH FROM date) = $2;
        `;

        const date = new Date(entry.date);
        const month = date.getMonth() + 1;
        const sentimentRange = [
          entry.sentiment - range,
          entry.sentiment + range,
        ];

        const similarDaysThisMonthQuery = {
          text: similarDaysThisMonthSQL,
          values: [
            entry.user_id,
            month,
            sentimentRange[0],
            sentimentRange[1]],
        }
        
        try {
          const similarDaysThisMonthResult = await db.query(similarDaysThisMonthQuery);
          const similarEntriesThisMonth = similarDaysThisMonthResult.rows;
          let res = {
            entry: entry,
            insights: {
              similarEntriesThisMonth: similarEntriesThisMonth,
            },
          };

          if (Object.keys(insights).length !== 0) {
            res = {
              ...res,
              insights: {
                ...res.insights,
                ...insights,
              }
            }
          }

          return res;
        } catch (err) {
          throw err;
        }
      };

      const getAllSentimentForUser = async (userId) => {
        const sentimentAllTimeSQL = `
          SELECT sentiment, date
          FROM entries
          WHERE user_id = $1
          ORDER BY date DESC;
        `;

        const getAllSentimentQuery = {
          text: sentimentAllTimeSQL,
          values: [userId],
        };

        try {
          const allSentimentResults = await db.query(getAllSentimentQuery);
          const allSentiment = allSentimentResults.rows;
          return allSentiment;
        } catch (err) {
          throw err;
        }
      };

      getOneEntry(entryId)
        .then(entry => getMonthAvgSentimentForEntry({ entry }))
        .then(({ entry, insights }) => getSimilarDaysThisMonthForEntry({ entry, insights }))
        .then(res => {
          return getAllSentimentForUser(res.entry.user_id)
            .then(allSentiment => ({
              ...res,
              insights: {
                ...res.insights,
                allSentiment: allSentiment,
              },
            }));
        })
        .then(res => resolve(res))
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
