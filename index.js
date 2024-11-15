const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const path = require('path');
const debugStartUp = require('debug')('app:startup');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
require('module-alias/register');
require('@startup/errorLog.start')(process);

const app = express();
const port = process.env.PORT;

app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'app', 'views'));
app.use(expressLayouts);
app.set('layout', 'web/layouts/auth', 'web/layouts/landing', 'web/pages/postbid', 'web/pages/checkbid', 'web/pages/startbid', 'web/pages/postedbids', 'web/pages/participatedbids', 'web/pages/bid', 'web/pages/postedstatus', 'web/pages/participatedstatus', 'web/pages/profile');

require('@routes/web.routes')(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  debugStartUp(`Node app Started`);
  console.log(`Node app listening on port ${port}`);
})