const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./api/auth');
const sessionsRoutes = require('./api/sessions');
const teamsRoutes = require('./api/teams');
const stripe = require('stripe')('sk_test_51QRdu2HwuGVunWPukJxTlfse0BPC7LsFxYlJiJjoyEgngwaRwn2QdI19kIwif2BBu7RP7IRLZpXCtwxvqJ4z4Zgd00i1CxnrjP');
const successRoute = require('./api/success');
const webhooksController = require('./api/webhooksController');
const teamsController = require('./api/teamsController');

// Create Express server
const app = express();

// Webhook endpoint needs to be BEFORE other middleware
app.post('/webhook',
    express.raw({ type: 'application/json' }),
    webhooksController.handleStripeWebhook
);

// Configure CORS before other middleware
app.use(cors({
    origin: 'http://localhost:3002', // Your React app's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Regular middleware for other routes
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
    const { teamId } = req.body;

    if (!teamId) {
        console.error('❌ No teamId provided in request');
        return res.status(400).json({ error: 'teamId is required' });
    }

    if (!process.env.STRIPE_PRICE_ID) {
        console.error('❌ STRIPE_PRICE_ID not set in environment');
        return res.status(500).json({ error: 'Stripe configuration error' });
    }

    if (!process.env.CLIENT_URL) {
        console.error('❌ CLIENT_URL not set in environment');
        return res.status(500).json({ error: 'Client URL configuration error' });
    }

    console.log('🛍️ Creating checkout session:', {
        teamId: teamId,
        priceId: process.env.STRIPE_PRICE_ID,
        clientUrl: process.env.CLIENT_URL,
        timestamp: new Date().toISOString()
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            client_reference_id: teamId,
            line_items: [{
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        console.log('✅ Checkout session created:', {
            sessionId: session.id,
            teamId: teamId
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('❌ Failed to create checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/teams/:teamId/revert-premium', teamsController.revertPremiumStatus);

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
