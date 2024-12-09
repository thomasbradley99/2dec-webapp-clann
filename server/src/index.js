require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./api/auth');
const sessionsRoutes = require('./api/sessions');
const teamsRoutes = require('./api/teams');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const successRoute = require('./api/success');
const webhooksController = require('./api/webhooksController');
const teamsController = require('./api/teamsController');

// Create Express server
const app = express();

// Debug log for environment variables
console.log('Environment Check:', {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Present' : 'Missing',
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID ? 'Present' : 'Missing',
    CLIENT_URL: process.env.CLIENT_URL,
    NODE_ENV: process.env.NODE_ENV
});

// Add this debug log at the start of your file
console.log('Stripe Configuration:', {
    secretKeyExists: !!process.env.STRIPE_SECRET_KEY,
    secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
    priceIdExists: !!process.env.STRIPE_PRICE_ID,
    webhookSecretExists: !!process.env.STRIPE_WEBHOOK_SECRET
});

// Webhook endpoint needs raw body - MUST BE FIRST
app.post('/api/webhook',
    express.raw({ type: 'application/json' }),
    webhooksController.handleStripeWebhook
);

// THEN other middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());

// Register the checkout endpoint
app.post('/api/create-checkout-session', async (req, res) => {
    const { teamId } = req.body;

    try {
        console.log('Creating checkout session:', {
            teamId,
            priceId: process.env.STRIPE_PRICE_ID,
            hasStripeKey: !!process.env.STRIPE_SECRET_KEY
        });

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

        console.log('Checkout session created:', {
            sessionId: session.id,
            teamId: teamId
        });

        res.json({
            id: session.id,
            publicKey: process.env.STRIPE_PUBLIC_KEY // Add this for debugging
        });
    } catch (error) {
        console.error('Failed to create checkout session:', error);
        res.status(500).json({
            error: error.message,
            type: error.type
        });
    }
});

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

app.post('/teams/:teamId/revert-premium', teamsController.revertPremiumStatus);

// Add a test endpoint
app.post('/api/webhook-test', express.raw({ type: 'application/json' }), (req, res) => {
    console.log('Webhook test received:', {
        headers: req.headers,
        body: req.body.toString(),
        timestamp: new Date().toISOString()
    });
    res.json({ received: true });
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
