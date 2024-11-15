// const pool = require('@configs/database');
const Session = require('@models/session.model');

const authenticate = async (req, res, next) => {
    const { session_id } = req.cookies;
    if (!session_id) {
        return res.redirect('/auth/signin');
    }
    try {
        // const [rows] = await pool.query('SELECT * FROM sessions WHERE session_id = ? AND expiry > NOW()', [session_id]);
        const rows = await Session.read(session_id);
        if (rows.length === 0) {
            return res.redirect('/auth/signin');
        }
        // await pool.query('UPDATE sessions SET expiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE), last_activity = NOW() WHERE session_id = ?', [session_id]);
        await Session.edit(session_id);
        req.user = { id: rows[0].user_id };
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).render('web/layouts/auth', { page: 'error', status: 500, message: 'Internal Server Error' });
    }
};

const terminateInactiveSessions = async () => {
    try {
        // const [rows] = await pool.query('SELECT session_id FROM sessions WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 MINUTE) AND terminated_at IS NULL');
        const rows = await Session.getSessionId();
        for (const row of rows) {
            // await pool.query('UPDATE sessions SET terminated_at = NOW() WHERE session_id = ?', [row.session_id]);
            await Session.updateTerminatedAt(row.session_id);
        }
    } catch (error) {
        console.error('Error terminating inactive sessions:', error);
    }
};
setInterval(terminateInactiveSessions, 60 * 1000);

module.exports = authenticate;
