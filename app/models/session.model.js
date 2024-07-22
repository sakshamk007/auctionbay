const pool = require('@configs/database');

const Session = {
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
    getSessionId: async () => {
        const [rows] = await pool.execute('SELECT session_id FROM sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 MINUTE) AND terminated_at IS NULL');
        return rows;
    },
    updateTerminatedAt: async (id) => {
        const [result] = await pool.execute('UPDATE sessions SET terminated_at = NOW() WHERE session_id = ?', [id]);
        return result;
    },
    // delete: async (id) => {
    //     const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    //     return result;
    // }
};

module.exports = Session;
