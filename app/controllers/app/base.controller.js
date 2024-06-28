const express = require('express');
const router = express.Router();

//Declaration
const config = require('config');
const { error } = require('winston');
const authMiddleware = require('../../middlewares/auth.middleware');
  //config.has('db_mysql.name') // Return true/false
  //config.get('db_mysql.name') //Returns value

router.get('/', authMiddleware('app:get'), (req, res) =>{

    res.send('Hello /' +  config.get('db_mysql.name')+' '+ JSON.stringify(req.user)+' '+ req.authKeyword  );
})

router.post('/register', authMiddleware('app:get'), (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, password], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send('User already exists');
            }
            return res.status(500).send('Error registering user');
        }
        res.status(201).send('User registered successfully');
    });
});

router.post('/login', authMiddleware('app:get'), (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [username, password], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }

        const token = crypto.randomBytes(16).toString('hex');
        const userId = results[0].id;
        const insertSessionQuery = 'INSERT INTO sessions (token, user_id) VALUES (?, ?)';
        db.query(insertSessionQuery, [token, userId], (err) => {
            if (err) {
                return res.status(500).send('Could not create session');
            }
            res.cookie('session', token, { httpOnly: true }).send('Login successful');
        });
    });
});

router.get('/protected', authMiddleware('app:get'), (req, res) => {
    res.send('Protected content');
});

router.post('/logout', authMiddleware('app:get'), (req, res) => {
    const token = req.cookies.session;

    const query = 'DELETE FROM sessions WHERE token = ?';
    db.query(query, [token], (err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.clearCookie('session').send('Logged out');
    });
});




module.exports = router;