const pool = require('@configs/database');

const Wishlist = {
    read: async (bid_id, user_id) => {
        const [rows] = await pool.execute('SELECT * FROM wishlist WHERE wishlist_id = ? AND user_id = ?', [bid_id, user_id]);
        return rows;
    },
    add: async (bid_id, user_id, title) => {
        const [result] = await pool.execute('INSERT INTO wishlist (wishlist_id, user_id, title) VALUES (?, ?, ?)', [bid_id, user_id, title]);
        return result;
    },
    findByUserId: async (user_id) => {
        const [rows] = await pool.execute('SELECT * FROM wishlist WHERE user_id = ? AND wishlist_id IN (SELECT bid_id FROM bids WHERE timer > 0 AND DATE(date) > DATE(NOW()) OR (DATE(date) = DATE(NOW()) AND TIME(time) >= TIME(NOW())));', [user_id]);
        return rows;
    },
    delete: async (wishlist_id, user_id) => {
        const [result] = await pool.execute('DELETE FROM wishlist WHERE wishlist_id = ? AND user_id = ?', [wishlist_id, user_id]);
        return result;
    },
    deleteForAll: async (wishlist_id) => {
        const [result] = await pool.execute('DELETE FROM wishlist WHERE wishlist_id = ?', [wishlist_id]);
        return result;
    },
};

module.exports = Wishlist;
