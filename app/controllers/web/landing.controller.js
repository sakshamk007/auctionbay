const express = require('express');
const authenticate = require('@middlewares/auth.middleware');
const router = express.Router();
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const pool = require('@configs/database');
const { v4: uuidv4 } = require('uuid');

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'notloggedin'})
})

router.get('/welcome', authenticate, (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'loggedin'})
})

router.get('/postbid', authenticate, (req,res)=>{
    res.render('web/pages/postbid', {layout: "web/pages/postbid"})
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/postbid', authenticate, upload.single('image'), async (req, res) => {
    const { name, email, title, auction, date, type, contact, description, price, time } = req.body;
    const image = req.file ? req.file.filename : null;
    const bidQuery = `INSERT INTO bids (name, email, title, auction, date, type, contact, description, price, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        const [result] = await pool.query(bidQuery, [name, email, title, auction, date, type, contact, description, price, time]);
        if (image) {
            const imageQuery = `INSERT INTO images (bid_id, image_path) VALUES (?, ?)`;
            await pool.query(imageQuery, [result.insertId, image]);
            res.status(200).render('web/layouts/auth', { page: 'success', status: 200, message: 'Bid and image uploaded successfully' });
        } else {
            res.status(200).render('web/layouts/auth', { page: 'success', status: 200, message: 'Bid uploaded successfully' });
        }
    } catch (err) {
        console.error('Error inserting bid:', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error inserting bid' });
    }
});

module.exports = router;