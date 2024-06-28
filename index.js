const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const crypto = require('crypto');
const  path = require('path');
const fs = require('fs');
//Init Startup Debuger
const debugStartUp = require('debug')('app:startup');

require('dotenv').config();
//Init Startup Error Logger
require('module-alias/register');//Needed for @ in path
require('@startup/errorLog.start')(process);

//Init Express App
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, './app/views'));


//Init all Databases Here
// async function createDatabase() {
//   const sql = await fs.readFileSync('./app/databases/sessions.sql', 'utf8');
// }

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'auth_db'
});

db.connect(err => {
  if (err) {
      console.error('Could not connect to database:', err);
      process.exit(1);
  } else {
      console.log('Connected to MySQL database');
  }
});



//Simulate an Uncaught Error code
//throw new Error('Thrown Error');

//Simulate an Unhandled Error code
// const p = Promise.reject(new Error('Thrown Rejected Promise Error'));
// p.then(()=> console.log('done'));





//All Routes //./app/routes/
require('@routes/admin.routes')(app);
require('@routes/api.routes')(app);




//Define Important Const / Var / Let
const port = process.env.PORT || 3000;
//App Listen Code
app.listen(port, () => {
  debugStartUp(`Node app Started`);
  console.log(`Node app listening on port http://localhost:${port}`);
})