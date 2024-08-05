const pool = require('@configs/database');

const Status = {
    add: async (bid_id, username, name, contact_no, email, years_of_experience, value, response) => {
        const [result] = await pool.execute('INSERT INTO status (bid_id, username, name, contact_no, email, years_of_experience, value, response) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [bid_id, username, name, contact_no, email, years_of_experience, value, response]);
        return result;
    },
    getResponse: async (bid_id) => {
        const [result] = await pool.execute('SELECT response FROM status WHERE bid_id = ?', [bid_id])
        return result[0];
    }
};

module.exports = Status;
