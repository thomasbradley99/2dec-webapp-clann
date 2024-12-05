const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    console.log('Received Stripe webhook:', req.body);

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Stripe event type:', event.type);

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const teamId = paymentIntent.metadata.teamId;

        try {
            await db.query('UPDATE Teams SET is_premium = true WHERE id = $1', [teamId]);
            console.log(`Team ${teamId} is now premium.`);
        } catch (error) {
            console.error('Error updating team to premium:', error);
        }
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const teamId = session.client_reference_id;

        try {
            await db.query('UPDATE Teams SET is_premium = true WHERE id = $1', [teamId]);
            console.log(`Team ${teamId} is now premium.`);
        } catch (error) {
            console.error('Error updating team to premium:', error);
        }
    }

    res.json({ received: true });
}; 