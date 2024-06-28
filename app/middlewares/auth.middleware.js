//const jwt = require('jsonwebtoken');
module.exports = function auth(authKeyword, isApi=false) { return function auth(req, res, next){

    const token = req.cookies.session;
    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    const query = 'SELECT * FROM sessions WHERE token = ?';
    db.query(query, [token], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send('Unauthorized');
        }
        req.user_id = results[0].user_id;
        next();
    });

    req.authKeyword = authKeyword;
    

    next();

    // try{
    // const decoded = jwt.verify(token,'jwtPrivateKey');
    // req.user = decoded;
    // next();
    // }
    // catch(ex){
    //     res.status(400).send('Access Denied. Invalid Token');
    // }

    // 7Y7LXGBMTJ6BCD0LTQ7CRN3BECVMHZML

    }
}