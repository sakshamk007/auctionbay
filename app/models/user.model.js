const pool = require('@configs/database');

const user = {
    read: async (email) => {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows;
    },
    add: async (email, password, id) => {
      const [result] = await pool.execute('INSERT INTO users (email, password, user_id) VALUES (?, ?, ?)', [email, password, id]);
      return result;
    },
    // findByUsername: async (username) => {
    //     const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    //     return rows[0];
    // },
    // update: async (id, username, password, email) => {
    //     const [result] = await pool.execute(
    //     'UPDATE users SET username = ?, password = ?, email = ? WHERE id = ?',
    //     [username, password, email, id]
    //     );
    //     return result;
    // },
    // delete: async (id) => {
    //     const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    //     return result;
    // }
};

module.exports = user;
