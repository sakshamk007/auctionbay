const pool = require('@configs/database');

const Bid = {
    browse: async () => {
        const [result] = await pool.execute('SELECT * FROM bids WHERE timer > 0 AND DATE(date) > DATE(NOW()) OR (DATE(date) = DATE(NOW()) AND TIME(time) >= TIME(NOW())) ORDER BY DATE(date) ASC, TIME(time) ASC');
        return result;
    },
    add: async (bid_id, user_id, name, email, title, auction, date, type, contact, description, price, time) => {
        const [result] = await pool.execute('INSERT INTO bids (bid_id, user_id, name, email, title, auction, date, type, contact, description, price, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [bid_id, user_id, name, email, title, auction, date, type, contact, description, price, time]);
        return result;
    },
    exists: async (user_id, auction, title, date, time) => {
        const [rows] = await pool.execute('SELECT * FROM bids WHERE user_id = ? AND auction = ? AND title = ? AND date = ? AND time = ?', [user_id, auction, title, date, time]);
        return rows.length > 0;
    },
    findByUserId: async (userId) => {
        const [rows] = await pool.execute('SELECT * FROM bids WHERE user_id = ? ORDER BY DATE(date) ASC, TIME(time) ASC', [userId]);
        return rows;
    },
    findByBidId: async (Bid_id) => {
        const [rows] = await pool.execute('SELECT * FROM bids WHERE Bid_id = ?', [Bid_id]);
        return rows;
    },
    getTimer: async (bid_id) => {
        let [rows] = await pool.execute('SELECT timer FROM bids WHERE bid_id = ?', [bid_id]);
        return rows;
    },
    updateTimer: async (timer, bid_id) => {
        const [rows] = await pool.execute('UPDATE bids SET timer = ? WHERE bid_id = ?', [timer, bid_id]);
        return rows;
    },
    getUserId: async (userId) => {
        const [rows] = await pool.execute('SELECT user_id FROM bids WHERE bid_id = ?', [userId]);
        return rows[0];
    },
    delete: async (bid_id, user_id) => {
        const [result] = await pool.execute('DELETE FROM bids WHERE bid_id = ? AND user_id = ?', [bid_id, user_id]);
        return result;
    }
};

module.exports = Bid;
