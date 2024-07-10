const express = require('express');
const router = express.Router();
const pool = require('@configs/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/signup', (req, res) => {
    res.render('web/signup');
});

router.post('/signup', asyncHandler(async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match.');
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        return res.status(400).send('User already exists.');
    }
    const user_id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password, user_id) VALUES (?, ?, ?)', [email, hashedPassword, user_id]);
    res.send('User registered successfully.');
}));

router.get('/signin', (req, res) => {
    res.render('web/signin');
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user_agent = req.headers['user-agent'];
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).send('User not found');
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).send('Invalid password');
        }
        const session_id = crypto.randomBytes(16).toString('hex');
        const expiry = new Date(Date.now() + 30 * 60 * 1000);

        await pool.query('INSERT INTO sessions (session_id, user_id, user_agent, expiry, last_activity) VALUES (?, ?, ?, ?, NOW())', [session_id, user.user_id, user_agent, expiry]);
        res.cookie('session_id', session_id, { httpOnly: true, maxAge: 30 * 60 * 1000 });
        res.send('Login successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
