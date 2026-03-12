const express = require('express');
const db = require('../database');
const lstmModel = require('../lstmModel');

const router = express.Router();

// Middleware to verify if a valid session exists for the request
const verifySession = (req, res, next) => {
    // We expect the frontend to send a custom header or query param with the sessionId
    // Alternatively, it can be extracted from the JWT token
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
        return res.status(401).json({ error: 'Session ID missing' });
    }
    
    db.get('SELECT * FROM sessions WHERE id = ? AND active = 1', [sessionId], (err, row) => {
        if (err || !row) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }
        req.session = row;
        next();
    });
};

router.post('/capture', verifySession, (req, res) => {
    // Events is an array of objects
    // Example: [{ type: 'mousemove', data: { speed: 1.5, ... } }, { type: 'keydown', data: { key: 'a', flightTime: 120 } }]
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Invalid telemetry data format' });
    }
    
    const sessionId = req.session.id;

    // Insert batched events into DB
    const stmt = db.prepare('INSERT INTO behavioral_logs (session_id, type, data) VALUES (?, ?, ?)');
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        events.forEach(event => {
            stmt.run(sessionId, event.type, JSON.stringify(event.data));
            
            // Simple Anomaly Detection Logic (Feature 14)
            if (event.type === 'mouse_move' && event.data.speed > 5) { // Arbitrary high speed
                db.run('INSERT INTO threat_alerts (user_id, session_id, reason, severity) VALUES (?, ?, ?, ?)', 
                    [req.session.user_id, sessionId, 'Erratic mouse movement detected', 'medium']);
            }
            if (event.type === 'clipboard' && event.data.action === 'paste') {
                db.run('INSERT INTO threat_alerts (user_id, session_id, reason, severity) VALUES (?, ?, ?, ?)', 
                    [req.session.user_id, sessionId, 'Sensitive data clipboard usage', 'low']);
            }
        });
        db.run("COMMIT", async (err) => {
            if (err) {
                console.error('Failed to commit telemetry batch', err);
                // Even if some batch failed, we just respond OK to not block the frontend
                return res.json({ success: false, error: 'Database transaction failed' });
            }
            
            // --- LSTM Anomaly Inference ---
            // After successful commit, fetch the latest 20 events to evaluate the sequence.
            db.all('SELECT * FROM behavioral_logs WHERE session_id = ? ORDER BY timestamp DESC LIMIT 20', [sessionId], async (err, rows) => {
                if (!err && rows && rows.length >= 5) { // Evaluate if we have at least 5 events
                    // Reverse to chronological order
                    const sequence = rows.reverse().map(r => ({
                        type: r.type,
                        data: JSON.parse(r.data),
                        timestamp: new Date(r.timestamp).getTime()
                    }));
                    
                    try {
                        const score = await lstmModel.predictSequence(sequence);
                        console.log(`LSTM Anomaly Score: ${score}`);
                        // If score is above threshold, log it as an anomaly
                        if (score > 0.4) {
                            db.run('INSERT INTO threat_alerts (user_id, session_id, reason, severity) VALUES (?, ?, ?, ?)', 
                                [req.session.user_id, sessionId, `LSTM model detected anomalous behavior (score: ${score.toFixed(2)})`, 'high']);
                        }
                    } catch (e) {
                        console.error('Failed to run LSTM prediction', e);
                    }
                }
            });

            res.json({ success: true, count: events.length });
        });
    });
    stmt.finalize();
});

module.exports = router;
