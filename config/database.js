const mysql = require('mysql2');

const pool = mysql.createPool(process.env.MYSQL_URL);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Could not connect to database:', err);
        process.exit(1);
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});  

module.exports = pool.promise();