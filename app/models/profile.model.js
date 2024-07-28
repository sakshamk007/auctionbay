const pool = require('@configs/database');

const Profile = {
    browse: async (username, email) => {
        const [rows] = await pool.execute('SELECT * FROM profile WHERE username = ? OR email = ?', [username, email]);
        return rows;
    },
    add: async (user_id, email, contact, username, first, last, experience) => {
        const [result] = await pool.execute('INSERT INTO profile (user_id, email, contact_no, username, first_name, last_name, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?)', [user_id, email, contact, username, first, last, experience]);
        return result;
    },
}

module.exports = Profile;
