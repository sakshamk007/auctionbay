const pool = require('@configs/database');

const session = {
    read: async (id) => {
        const [rows] = await pool.execute('SELECT * FROM sessions WHERE session_id = ? AND expiry > NOW()', [id]);
        return rows;
    },
    edit: async (id) => {
        const [result] = await pool.execute('UPDATE sessions SET expiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE), last_activity = NOW() WHERE session_id = ?', [id]);
        return result;
    },
    add: async (session_id, user_id, user_agent, expiry) => {
      const [result] = await pool.execute('INSERT INTO sessions (session_id, user_id, user_agent, expiry, last_activity) VALUES (?, ?, ?, ?, NOW())', [session_id, user_id, user_agent, expiry]);
      return result;
    },
    // findByUsername: async (username) => {
    //     const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    //     return rows[0];
    // },
    // delete: async (id) => {
    //     const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    //     return result;
    // }
};

module.exports = session;
