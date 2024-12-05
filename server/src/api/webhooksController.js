const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../db');

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    console.log('💰 Webhook received:', {
        headers: req.headers['stripe-signature'] ? 'Signature present' : 'No signature',
        body: req.body,
        timestamp: new Date().toISOString()
    });

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Webhook verified, event type:', event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const teamId = session.client_reference_id;

        console.log('💳 Payment successful:', {
            sessionId: session.id,
            teamId: teamId,
            subscriptionId: session.subscription,
            timestamp: new Date().toISOString()
        });

        try {
            // Add logging for the SQL query
            console.log('🔍 Attempting database update for team:', teamId);

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

            console.log('📝 Database update result:', {
                success: result.rowCount > 0,
                updatedTeam: result.rows[0],
                timestamp: new Date().toISOString()
            });

            if (result.rowCount === 0) {
                console.error('❌ No team was updated. Team ID might be invalid:', teamId);
            }

            // Send a success response
            res.json({ success: true });
        } catch (error) {
            console.error('❌ Database update failed:', error);
            res.status(500).json({ error: 'Database update failed' });
        }
    } else {
        // Handle other event types or send a basic success response
        res.json({ received: true });
    }
}; 