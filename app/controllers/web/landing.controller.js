const express = require('express');
const authenticate = require('@middlewares/auth.middleware');
const router = express.Router();
const multer = require('multer');
// const mysql = require('mysql2');
const path = require('path');
const pool = require('@configs/database');
const Bid = require('@models/bid.model');
const Image = require('@models/image.model');
const Wishlist = require('@models/wishlist.model');
const Users = require('@models/user.model');
const Contracts = require('@models/contracts.model');
const { v4: uuidv4 } = require('uuid');

// const asyncHandler = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

router.get('/', (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'notloggedin'})
})

router.get('/welcome', authenticate, async (req,res)=>{
    // const [rows] = await pool.query('SELECT * FROM wishlist WHERE user_id = ?', [req.cookies.user_id]);
    const user_id = req.cookies.user_id;
    const rows = await Wishlist.findByUserId(user_id);
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'loggedin', rows: rows})
})

router.get('/postbid', authenticate, (req,res)=>{
    const user_id = req.cookies.user_id;
    res.render('web/pages/postbid', {layout: "web/pages/postbid", user_id: user_id})
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/postbid', authenticate, upload.single('image'), async (req, res) => {
    const { name, user_id, email, title, auction, date, type, contact, description, price, time } = req.body;
    const image = req.file ? req.file.filename : null;
    const bid_id = uuidv4();
    try {
        const bidExists = await Bid.exists(user_id, auction, title, date, time);
        if (bidExists) {
            return res.status(400).render('web/layouts/auth', { page: 'error', status: 400, message: 'A bid with the same details already exists' });
        }
        await Bid.add(bid_id, user_id, name, email, title, auction, date, type, contact, description, price, time);
        if (image) {
            await Image.add(bid_id, image);
            res.status(200).render('web/layouts/auth', { page: 'success', status: 200, message: 'Bid and image uploaded successfully' });
        } else {
            res.status(200).render('web/layouts/auth', { page: 'success', status: 200, message: 'Bid uploaded successfully' });
        }
    } catch (err) {
        console.error('Error inserting bid:', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error inserting bid' });
    }
});

router.get('/checkbid', authenticate, async (req,res)=>{
    const data = await Bid.browse();
    res.render('web/pages/checkbid', {layout: "web/pages/checkbid", rows: data})
})

router.get('/startbid', authenticate, async (req,res)=>{
    res.render('web/pages/startbid', {layout: "web/pages/startbid"})
})

router.post('/startbid', authenticate, async (req, res) => {
    const user_id = req.cookies.user_id;
    const email = await Users.getEmailId(user_id);
    const { bid_id, name, type, title, description, auction, price, date, time } = req.body;
    try {
        const imageData = await Image.findByImageId(bid_id);
        const imagePath = imageData.length > 0 ? imageData[0].image_path : null;
        res.render('web/pages/startbid', {layout: "web/pages/startbid", user_id, bid_id, name, type, title, description, auction, price, date, time, email, imagePath});
    } catch (err) {
        console.error('Error fetching image path:', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error fetching image path' });
    }
});

router.get('/mybid', authenticate, async (req,res)=>{
    const user_id = req.cookies.user_id;
    const rows = await Bid.findByUserId(user_id);
    res.render('web/pages/mybid', {layout: "web/pages/mybid", rows: rows})
})

router.post('/wishlist', authenticate, async (req,res)=>{
    const { bid_id, user_id, title } = req.body;
    try {
        // const [rows] = await pool.query('SELECT * FROM wishlist WHERE wishlist_id = ? AND user_id = ?', [bid_id, user_id]);
        const rows = await Wishlist.read(bid_id, user_id);
        if (rows.length > 0) {
            res.status(400).render('web/layouts/auth', { page: 'error', status: 400, message: 'Bid already exists in your wishlist' });
        } else {
            // await pool.query('INSERT INTO wishlist (wishlist_id, user_id, title) VALUES (?, ?, ?)', [bid_id, user_id, title]);
            await Wishlist.add(bid_id, user_id, title);
            res.redirect('/welcome');
        }
    } catch (err) {
        console.error('Error adding to wishlist', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error adding to wishlist' });
    }
})

router.post('/wishlist-startbid', authenticate, async (req,res)=>{
    const { wishlist_id } = req.body;
    const rows = await Bid.findByBidId(wishlist_id);
    const row = rows[0];
    const { user_id, bid_id, name, type, title, description, auction, price, time } = row;
    let {date} = row;
    date = date.toString().split('00:00:00')[0];
    try {
        const imageData = await Image.findByImageId(wishlist_id);
        const imagePath = imageData.length > 0 ? imageData[0].image_path : null;
        res.render('web/pages/startbid', {layout: "web/pages/startbid", user_id, bid_id, name, type, title, description, auction, price, date, time, imagePath});        
    } catch (err) {
        console.error('Error fetching image path:', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error fetching image path' });
    }   
})

router.post('/bid', authenticate, async (req,res)=>{
    const { auction, bid_id, user_id, price } = req.body;
    if (auction === 'forward'){
        const rows = await Contracts.browseDesc(bid_id);
        const maxBid = await Contracts.getMaxBid(bid_id);
        let currentBid = maxBid.max_value
        if (currentBid === null){
            currentBid = price;
        }
        res.render('web/pages/bid', {layout: "web/pages/bid", auction, bid_id, user_id, rows, currentBid, price})
    }
    else if (auction === 'reverse'){
        const rows = await Contracts.browseAsc(bid_id);
        const minBid = await Contracts.getMinBid(bid_id);
        let currentBid = minBid.min_value
        if (currentBid === null){
            currentBid = price;
        }
        res.render('web/pages/bid', {layout: "web/pages/bid", auction, bid_id, user_id, rows, currentBid, price})
    }
})

router.post('/submit-bid', authenticate, async (req,res)=>{
    const { user_id, bidValue, auction, bid_id, currentBid } = req.body;
    const value = Number(bidValue);
    const email = await Users.getEmailId(user_id);
    if (auction === 'forward'){
        if (value < currentBid || value === currentBid){
            return res.status(400).json({ error: 'Bid Value should be greater than Current Bid' });
        }
        else {
            await Contracts.add(user_id, bid_id, value, email.email, auction);
            return res.status(200).json({ message: 'Bid submitted successfully' });
        }
    }
    else if (auction === 'reverse'){
        if (value > currentBid || value === currentBid){
            return res.status(400).json({ error: 'Bid Value should be less than Current Bid' });
        }
        else if (value < 0 || value === 0){
            return res.status(400).json({ error: 'Bid Value should not be less than or equal to 0' });
        }
        else {
            await Contracts.add(user_id, bid_id, value, email.email, auction);
            return res.status(200).json({ message: 'Bid submitted successfully' });
        }
    }
})

router.get('/bids-and-timer', authenticate, async (req, res) => {
    const { bid_id, auction, price } = req.query;
    let [rows] = await pool.query('SELECT timer FROM bids WHERE bid_id = ?', [bid_id])
    let timer = rows[0].timer
    if (timer > 0) {
        timer--;
        await pool.query('UPDATE bids SET timer = ? WHERE bid_id = ?', [timer, bid_id])
        if (auction === 'forward') {
            const rows = await Contracts.browseDesc(bid_id);
            const maxBid = await Contracts.getMaxBid(bid_id);
            let currentBid = maxBid.max_value
            if (currentBid === null){
                currentBid = price;
            }
            return res.json({ rows, currentBid, timer});
        } else if (auction === 'reverse') {
            const rows = await Contracts.browseAsc(bid_id);
            const minBid = await Contracts.getMinBid(bid_id);
            let currentBid = minBid.min_value
            if (currentBid === null){
                currentBid = price;
            }
            return res.json({ rows, currentBid, timer});
        }
    }
    else {
        return res.status(400).json({ error: 'Bidding ended' });
    }
});

router.get('/deal', authenticate, async (req, res) => {
    res.render('web/pages/deal', {layout: "web/pages/deal"})
})

module.exports = router;