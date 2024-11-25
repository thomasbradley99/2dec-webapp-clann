const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');
const teamsRoutes = require('./routes/teams');

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this line to serve the uploads directory
app.use('/analysis-images', express.static(path.join(__dirname, '../public/analysis-images')));

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);        // Add /api prefix
app.use('/api/sessions', sessionsRoutes); // Add /api prefix
app.use('/api/teams', teamsRoutes);      // Already has /api prefix

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`- Auth endpoints: /api/auth/*`);
    console.log(`- Session endpoints: /api/sessions/*`);
    console.log(`- Teams endpoints: /api/teams/*`);
});
