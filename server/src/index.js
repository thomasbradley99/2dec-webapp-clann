const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);        // Handle login/register
app.use('/api/sessions', sessionsRoutes); // Handle game sessions

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`- Auth endpoints: /api/auth/*`);
    console.log(`- Session endpoints: /api/sessions/*`);
});
