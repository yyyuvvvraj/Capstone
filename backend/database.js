const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'nexus_v2.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Define schemas
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL,
                ip TEXT,
                device_fingerprint TEXT,
                active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS behavioral_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                data TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS threat_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_id INTEGER NOT NULL,
                reason TEXT NOT NULL,
                severity TEXT DEFAULT 'low',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )`);
            
            console.log('Database tables ensured.');

            // Feature 21: Robust Seeding (Independent checks for admin/user)
            const bcrypt = require('bcrypt');
            
            db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
                if (err) console.error('Error checking admin:', err);
                if (!row) {
                    const adminPass = bcrypt.hashSync('admin123', 10);
                    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', adminPass, 'admin'], (err) => {
                        if (err) console.error('Error seeding admin:', err);
                        else console.log('Admin account seeded: admin/admin123');
                    });
                }
            });

            db.get('SELECT id FROM users WHERE username = ?', ['user'], (err, row) => {
                if (err) console.error('Error checking user:', err);
                if (!row) {
                    const userPass = bcrypt.hashSync('user123', 10);
                    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['user', userPass, 'user'], (err) => {
                        if (err) console.error('Error seeding user:', err);
                        else console.log('User account seeded: user/user123');
                    });
                }
            });
        });
    }
});

module.exports = db;
