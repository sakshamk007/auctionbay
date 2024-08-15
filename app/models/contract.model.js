const pool = require('@configs/database');

const Contract = {
    browseDesc: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM contracts WHERE bid_id = ? ORDER BY value DESC LIMIT 10', [id]);
        return rows;
    },
    browseAsc: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM contracts WHERE bid_id = ? ORDER BY value ASC LIMIT 10', [id]);
        return rows;
    },
    add: async (user_id, bid_id, bidValue, email, auction, username) => {
        const [result] = await pool.execute('INSERT INTO contracts (user_id, bid_id, value, email, auction, username, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [user_id, bid_id, bidValue, email, auction, username]);
        return result;
    },
    getMaxBid: async (id) => {
        const [rows] = await pool.execute('SELECT MAX(value) AS max_value FROM contracts WHERE bid_id = ?', [id]);
        return rows[0];
    },    
    getMinBid: async (id) => {
        const [rows] = await pool.execute('SELECT MIN(value) AS min_value FROM contracts WHERE bid_id = ?', [id]);
        return rows[0];
    },    
    findByUserId: async (userId) => {
        const [rows] = await pool.execute('SELECT * FROM bids WHERE bid_id IN (SELECT bid_id FROM contracts WHERE user_id = ?) ORDER BY DATE(date) ASC, TIME(time) ASC', [userId]);
        return rows;
    },
    getHighestBidder: async (bid_id) => {
        const [rows] = await pool.execute('SELECT * FROM contracts WHERE bid_id = ? ORDER BY value DESC LIMIT 1', [bid_id]);
        return rows[0];
    },
    getLowestBidder: async (bid_id) => {
        const [rows] = await pool.execute('SELECT * FROM contracts WHERE bid_id = ? ORDER BY value ASC LIMIT 1', [bid_id]);
        return rows[0];
    },
    delete: async (bid_id) => {
        const [result] = await pool.execute('DELETE FROM contracts WHERE bid_id = ?', [bid_id]);
        return result;
    }
};

module.exports = Contract;
