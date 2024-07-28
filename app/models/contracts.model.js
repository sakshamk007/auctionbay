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
    add: async (user_id, bid_id, bidValue, email, auction) => {
        const [result] = await pool.execute('INSERT INTO contracts (user_id, bid_id, value, email, auction, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [user_id, bid_id, bidValue, email, auction]);
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
};

module.exports = Contract;
