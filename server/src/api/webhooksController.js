const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    console.log('💰 Webhook received:', {
        headers: req.headers,
        signaturePresent: !!sig,
        bodyType: typeof req.body,
        bodyLength: req.body.length,
        timestamp: new Date().toISOString()
    });

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ Event constructed successfully:', event.type);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Session data:', session);

            const teamId = session.client_reference_id;

            try {
                const result = await db.query(`
                    UPDATE Teams 
                    SET is_premium = true,
                        subscription_status = 'PREMIUM',
                        subscription_id = $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    RETURNING *`,
                    [session.subscription, teamId]
                );

                // Send immediate response after database update
                return res.status(200).json({ received: true });

            } catch (error) {
                console.error('Database error:', error);
                return res.status(500).json({ error: 'Database update failed' });
            }
        }

        // Always respond to unhandled event types
        return res.status(200).json({ received: true });

    } catch (err) {
        console.error('❌ Webhook Error:', {
            message: err.message,
            stack: err.stack,
            signature: sig ? 'Present' : 'Missing',
            secret: process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'Missing'
        });
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
}; 