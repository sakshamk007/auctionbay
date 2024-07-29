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
    findByEmail: async (email) => {
        const [rows] = await pool.execute('SELECT * FROM profile WHERE email = ?', [email]);
        return rows;
    },
    getUsername: async (user_id) => {
        const [rows] = await pool.execute('SELECT username FROM profile WHERE user_id = ?', [user_id]);
        return rows[0];
    }
}

module.exports = Profile;
