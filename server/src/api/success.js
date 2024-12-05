const express = require('express');
const router = express.Router();

router.get('/success', (req, res) => {
    // Redirect to the client-side success page
    res.redirect('http://localhost:3002/success');
});

module.exports = router; 