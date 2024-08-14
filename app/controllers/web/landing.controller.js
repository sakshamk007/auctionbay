const express = require('express');
const authenticate = require('@middlewares/auth.middleware');
const router = express.Router();
const multer = require('multer');
// const mysql = require('mysql2');
const path = require('path');
// const pool = require('@configs/database');
const Bid = require('@models/bid.model');
const Image = require('@models/image.model');
const Wishlist = require('@models/wishlist.model');
const User = require('@models/user.model');
const Contract = require('@models/contract.model');
const Profile = require('@models/profile.model');
const Status = require('@models/status.model');
const { v4: uuidv4 } = require('uuid');
const { set } = require('lodash');

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
        const bidExists = await Bid.exists(user_id, title, name, description, auction);
        if (bidExists) {
            return res.status(400).render('web/layouts/auth', { page: 'error', status: 400, message: 'An auction with the same details already exists' });
        }
        await Bid.add(bid_id, user_id, name, email, title, auction, date, type, contact, description, price, time);
        if (image) {
            await Image.add(bid_id, image);
            res.status(200).render('web/layouts/auth', { page: 'success', status: 200, message: 'Auction details and image uploaded successfully' });
        } else {
            res.status(200).render('web/layouts/auth', { page: 'success', status: 200, message: 'Auction details uploaded successfully' });
        }
    } catch (err) {
        console.error('Error inserting bid:', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error inserting auction' });
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
    const email = await User.getEmailId(user_id);
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

router.get('/postedbids', authenticate, async (req,res)=>{
    const user_id = req.cookies.user_id;
    const rows = await Bid.findByUserId(user_id);
    res.render('web/pages/postedbids', {layout: "web/pages/postedbids", rows: rows})
})

router.get('/participatedbids', authenticate, async (req,res)=>{
    const user_id = req.cookies.user_id;
    const rows = await Contract.findByUserId(user_id);
    res.render('web/pages/participatedbids', {layout: "web/pages/participatedbids", rows: rows})
})

router.post('/wishlist', authenticate, async (req,res)=>{
    const { bid_id, user_id, title } = req.body;
    try {
        // const [rows] = await pool.query('SELECT * FROM wishlist WHERE wishlist_id = ? AND user_id = ?', [bid_id, user_id]);
        const rows = await Wishlist.read(bid_id, user_id);
        if (rows.length > 0) {
            res.status(400).render('web/layouts/auth', { page: 'error', status: 400, message: 'This auction already exists in your wishlist' });
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
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error adding to wishlist' });
    }   
})

router.post('/delete-wishlist', authenticate, async (req,res)=>{
    const { wishlist_id } = req.body;
    const user_id = req.cookies.user_id;
    await Wishlist.delete(wishlist_id, user_id);
    res.redirect('/welcome');
})

router.post('/bid', authenticate, async (req,res)=>{
    const { auction, bid_id, user_id, price } = req.body;
    // const username = await Profile.getUsername(user_id);
    if (auction === 'forward'){
        const rows = await Contract.browseDesc(bid_id);
        const maxBid = await Contract.getMaxBid(bid_id);
        let currentBid = maxBid.max_value
        if (currentBid === null){
            currentBid = price;
        }
        res.render('web/pages/bid', {layout: "web/pages/bid", auction, bid_id, user_id, rows, currentBid, price})
    }
    else if (auction === 'reverse'){
        const rows = await Contract.browseAsc(bid_id);
        const minBid = await Contract.getMinBid(bid_id);
        let currentBid = minBid.min_value
        if (currentBid === null){
            currentBid = price;
        }
        res.render('web/pages/bid', {layout: "web/pages/bid", auction, bid_id, user_id, rows, currentBid, price, username})
    }
})

router.post('/submit-bid', authenticate, async (req,res)=>{
    const { user_id, bidValue, auction, bid_id } = req.body;
    const value = Number(bidValue);
    const email = await User.getEmailId(user_id);
    const username = await Profile.getUsername(user_id);
    if (auction === 'forward'){
        const maxBid = await Contract.getMaxBid(bid_id);
        let currentBid = maxBid.max_value
        if (value < currentBid || value === currentBid){
            return res.status(400).json({ error: 'Bid Value should be greater than Current Bid' });
        }
        else {
            await Contract.add(user_id, bid_id, value, email.email, auction, username.username);
            return res.status(200).json({ message: 'Bid submitted successfully' });
        }
    }
    else if (auction === 'reverse'){
        const minBid = await Contract.getMinBid(bid_id);
        let currentBid = minBid.min_value
        if (value > currentBid || value === currentBid){
            return res.status(400).json({ error: 'Bid Value should be less than Current Bid' });
        }
        else if (value < 0 || value === 0){
            return res.status(400).json({ error: 'Bid Value should not be less than or equal to 0' });
        }
        else {
            await Contract.add(user_id, bid_id, value, email.email, auction, username.username);
            return res.status(200).json({ message: 'Bid submitted successfully' });
        }
    }
})

const updateTimer = async () => {
    const bids = await Bid.getAll();
    bids.forEach(async (bid) => {
        const bid_id = bid.bid_id;
        let timer = bid.timer;
        const time = bid.time;
        const now = new Date().toLocaleTimeString('en-IN', { hour12: false }).split(' ')[0]
        if (timer > 0 && time <= now){
            timer--; 
            // await pool.query('UPDATE bids SET timer = ? WHERE bid_id = ?', [timer, bid_id])
            await Bid.updateTimer(timer, bid_id)
        }
    });
}
setInterval(updateTimer, 1000);

router.get('/bids-and-timer', authenticate, async (req, res) => {
    const { bid_id, auction, price } = req.query;
    // let [rows] = await pool.query('SELECT timer FROM bids WHERE bid_id = ?', [bid_id])
    let rows = await Bid.getTimer(bid_id)
    let timer = rows[0].timer
    if (timer > 0) {
        if (auction === 'forward') {
            const rows = await Contract.browseDesc(bid_id);
            const maxBid = await Contract.getMaxBid(bid_id);
            let currentBid = maxBid.max_value
            if (currentBid === null){
                currentBid = price;
            }
            return res.json({ rows, currentBid, timer});
        } else if (auction === 'reverse') {
            const rows = await Contract.browseAsc(bid_id);
            const minBid = await Contract.getMinBid(bid_id);
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

router.post('/posted-bids-status', authenticate, async (req, res) => {
    const { bid_id } = req.body
    const bidder = await Contract.getBidder(bid_id);
    if (!bidder) {
        return res.status(400).render('web/layouts/auth', { page: 'error', status: 400, message: 'This auction has not happened yet' });
    }
    const user_id = bidder.user_id;
    const details = await Profile.findByUserId(user_id);
    const value = bidder.value;
    const result = await Status.getResponse(bid_id)
    let status;
    if (result){
        const response = result.response;
        if (response==='yes'){
            status = 'Accepted';
        }
        else if (response==='no'){
            status = 'Rejected';
        }
    }
    else{
        status = ''
    }
    res.render('web/pages/postedstatus', {layout: "web/pages/postedstatus", details, value, bid_id, status})
})

router.post('/participated-bids-status', authenticate, async (req, res) => {
    const { bid_id } = req.body
    const result1 = await Bid.getUserId(bid_id)
    const user_id = result1.user_id
    const details = await Profile.findByUserId(user_id)
    const result2 = await Status.getResponse(bid_id)
    let status;
    if (result2){
        const response = result2.response;
        if (response==='yes'){
            status = 'Accepted';
        }
        else if (response==='no'){
            status = 'Rejected';
        }
    }
    else{
        status = 'Pending'
    }
    res.render('web/pages/participatedstatus', {layout: "web/pages/participatedstatus", bid_id, details, status})
})

router.post('/posted-status', authenticate, async (req, res) => {
    const { bid_id, username, name, contact_no, email, years_of_experience, value } = req.body
    const response = req.body.response;
    await Status.add(bid_id, username, name, contact_no, email, years_of_experience, value, response);
    res.redirect('/welcome');
});

router.post('/participated-status', authenticate, async (req, res) => {
    const { bid_id, username, name, contact_no, email, years_of_experience } = req.body
    const response = req.body.response;
    await Status.add(bid_id, username, name, contact_no, email, years_of_experience, value, response);
    res.redirect('/welcome');
});

router.get('/profile', authenticate, async (req, res) => {
    const user_id = req.cookies.user_id;
    const result = await User.getEmailId(user_id);
    const email = result.email
    const rows = await Profile.findByEmail(email)
    if (rows.length === 0) {
        res.render('web/layouts/auth', { page: 'profile', user_id, email });
    }
    else{
        res.render('web/pages/profile', {layout: "web/pages/profile", rows})
    }
})

router.post('/profile', authenticate, async (req, res) => {
    const {user_id, email, contact, username, first, last, experience} = req.body;
    // const [rows] = await pool.query('SELECT * FROM profile WHERE username = ?', [username]);
    const rows = await Profile.browse(username, email);
    if (rows.length > 0) {
        return res.status(400).render('web/layouts/auth', { page: 'error', status: 400, message: 'Username or Email already exists' });
    }
    else {
        // await pool.query('INSERT INTO profile (user_id, email, contact_no, username, first_name, last_name, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?)', [user_id, email, contact, username, first, last, experience]);
        await Profile.add(user_id, email, contact, username, first, last, experience)
        return res.redirect('/welcome');
    }
})

router.get('/signout', authenticate, (req, res) => {
    res.clearCookie('session_id');
    res.clearCookie('user_id');
    res.redirect('/');
});

router.post('/edit-profile', authenticate, async (req, res) => {
    const {user_id, email, contact, username, first, last, experience} = req.body;
    await Profile.delete(user_id);
    res.render('web/layouts/auth', { page: 'profile', user_id, email, contact, username, first, last, experience});
})

router.post('/edit-posted-bids', authenticate, async (req, res) => {
    const {bid_id, name, email, title, auction, type, contact, description, price} = req.body;
    const user_id = req.cookies.user_id;
    await Wishlist.delete(bid_id, user_id);
    await Bid.delete(bid_id, user_id);
    res.render('web/pages/postbid', {layout: "web/pages/postbid", user_id, name, email, title, auction, type, contact, description, price})
})

router.post('/delete-posted-bids', authenticate, async (req, res) => {
    const {bid_id} = req.body;
    const user_id = req.cookies.user_id;
    await Wishlist.delete(bid_id, user_id);
    await Bid.delete(bid_id, user_id);
    res.redirect('/postedbids');
})

module.exports = router;