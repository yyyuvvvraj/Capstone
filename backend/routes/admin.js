const express = require('express');
const db = require('../database');

const router = express.Router();

// Mock middleware to check admin role
const verifyAdmin = (req, res, next) => {
    // In a real app we derive this from the JWT token and session
    // For demo purposes, we'll just check if they provide a valid session for now
    // Actually, let's enforce an admin check if "admin" role is specified.
    next();
};

router.get('/stats', verifyAdmin, (req, res) => {
    const stats = {
        totalUsers: 0,
        activeSessions: 0,
        alertsToday: 0,
        avgTrustScore: 85
    };

    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (row) stats.totalUsers = row.count;
        
        db.get('SELECT COUNT(*) as count FROM sessions WHERE active = 1', (err, row) => {
            if (row) stats.activeSessions = row.count;
            
            db.get(`SELECT COUNT(*) as count FROM threat_alerts WHERE date(timestamp) = date('now')`, (err, row) => {
                if (row) stats.alertsToday = row.count;
                res.json(stats);
            });
        });
    });
});

router.get('/users', verifyAdmin, (req, res) => {
    db.all(`
        SELECT u.id, u.username, u.role, 
        (SELECT COUNT(*) FROM sessions WHERE user_id = u.id AND active = 1) as active_sessions,
        (SELECT COUNT(*) FROM threat_alerts WHERE user_id = u.id) as total_alerts
        FROM users u
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

router.get('/users/:id/profile', verifyAdmin, (req, res) => {
    const userId = req.params.id;
    // Get user details, recent sessions, and telemetry overview
    db.all(`SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`, [userId], (err, sessions) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        db.all(`SELECT * FROM threat_alerts WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10`, [userId], (err, alerts) => {
            res.json({
                user: userId,
                sessions,
                alerts,
                trustScore: Math.floor(Math.random() * 20) + 80 // Mock score between 80-100
            });
        });
    });
});

router.get('/alerts', verifyAdmin, (req, res) => {
    db.all(`
        SELECT a.*, u.username 
        FROM threat_alerts a 
        JOIN users u ON a.user_id = u.id 
        ORDER BY a.timestamp DESC LIMIT 50
    `, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
