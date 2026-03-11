const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const telemetryRoutes = require('./routes/telemetry');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Behavioral Biometrics API Running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
