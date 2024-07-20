const express = require('express');
const authenticate = require('@middlewares/auth.middleware');
const router = express.Router();
const multer = require('multer');
// const mysql = require('mysql2');
const path = require('path');
const pool = require('@configs/database');
const Bid = require('@models/bid.model');
const Image = require('@models/image.model');
const { v4: uuidv4 } = require('uuid');

// const asyncHandler = fn => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

router.get('/', (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'notloggedin'})
})

router.get('/welcome', authenticate, (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'loggedin'})
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
    const { bid_id, name, type, title, description, auction, price, date, time } = req.body;
    try {
        const imageData = await Image.findByImageId(bid_id);
        const imagePath = imageData.length > 0 ? imageData[0].image_path : null;
        res.render('web/pages/startbid', {layout: "web/pages/startbid", name, type, title, description, auction, price, date, time, imagePath});
    } catch (err) {
        console.error('Error fetching image path:', err);
        res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Error fetching image path' });
    }
});

module.exports = router;