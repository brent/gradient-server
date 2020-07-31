"use strict";

require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const Mailer = require('./mail');
const Cron = require('cron').CronJob;

/*
let job = new Cron(
  // mintue, hour, day, month, day of week
  // 0 21 * * * # 9pm
  '0 21 * * *',
  () => {
    Mailer.sendDailyEmail();
  },
  null,
  true,
  'America/New_York',
)
*/

app.disable('x-powered-by');

app.use(morgan('---\n:date[clf]\n:method :url :status :response-time ms - :res[content-length]'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/api/v1', require('./routes'));

app.listen(port, () => {
  console.log(`Listening on localhost:${port}`);
});
