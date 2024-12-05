const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./api/auth');
const sessionsRoutes = require('./api/sessions');
const teamsRoutes = require('./api/teams');
const stripe = require('stripe')('sk_test_51QRdu2HwuGVunWPukJxTlfse0BPC7LsFxYlJiJjoyEgngwaRwn2QdI19kIwif2BBu7RP7IRLZpXCtwxvqJ4z4Zgd00i1CxnrjP');
const successRoute = require('./api/success');

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this line to serve the uploads directory
app.use('/analysis-images', express.static(path.join(__dirname, '../public/analysis-images')));

// Add this line to serve files from storage/analysis-images
app.use('/analysis-images', express.static(path.join(__dirname, '../storage/analysis-images')));

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);        // Add /api prefix
app.use('/api/sessions', sessionsRoutes); // Add /api prefix
app.use('/api/teams', teamsRoutes);      // Already has /api prefix
app.use('/api', successRoute);

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'price_1QReM5HwuGVunWPu2cLxc8i3',
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'http://localhost:3002/success',
            cancel_url: 'http://localhost:3002/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
