const pool = require('@configs/database');

const Image = {
    add: async (bid_id, image) => {
        const [result] = await pool.execute('INSERT INTO images (image_id, image_path) VALUES (?, ?)', [bid_id, image]);
        return result;
    },
    findByImageId: async (bid_id) => {
        const [result] = await pool.execute('SELECT image_path FROM images WHERE image_id = ?', [bid_id]);
        return result;
    },
    delete: async (bid_id) => {
        const [result] = await pool.execute('DELETE FROM images WHERE image_id = ?', [bid_id]);
        return result;
    }
    // findByUserId: async (userId) => {
    //     const [rows] = await pool.execute('SELECT * FROM bids WHERE user_id = ?', [userId]);
    //     return rows;
    // },
};

module.exports = Image;
