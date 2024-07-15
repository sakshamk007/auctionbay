const express = require('express');
const authenticate = require('@middlewares/auth.middleware');
const router = express.Router();

router.get('/', (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'notloggedin'})
})

router.get('/welcome', authenticate, (req,res)=>{
    res.render('web/layouts/landing', {layout: "web/layouts/landing", page: 'loggedin'})
})

module.exports = router;