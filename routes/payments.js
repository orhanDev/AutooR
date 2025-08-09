const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// Status endpoint: report if merchant creds are configured
router.get('/klarna/status', (req, res) => {
  const enabled = !!(process.env.KLARNA_USERNAME && process.env.KLARNA_PASSWORD);
  res.json({ enabled });
});

// Create Klarna Hosted Payment Page session and return redirect URL
router.post('/klarna/hpp/session', async (req, res) => {
  try {
    const username = process.env.KLARNA_USERNAME;
    const password = process.env.KLARNA_PASSWORD;
    if (!username || !password) {
      return res.status(400).json({ error: 'Klarna test credentials missing. Set KLARNA_USERNAME and KLARNA_PASSWORD in .env' });
    }

    const { amount_eur, order_description } = req.body || {};
    if (!amount_eur || Number(amount_eur) <= 0) {
      return res.status(400).json({ error: 'amount_eur required' });
    }
    const order_amount = Math.round(Number(amount_eur) * 100); // cents

    const payload = {
      purchase_country: 'DE',
      order_currency: 'EUR',
      order_amount,
      merchant_urls: {
        terms: 'https://example.com/terms',
        checkout: 'http://localhost:3000/views/checkout.html',
        confirmation: 'http://localhost:3000/views/review.html',
        cancel: 'http://localhost:3000/views/checkout.html'
      },
      order_lines: [
        {
          type: 'digital',
          reference: 'car-rental',
          name: order_description || 'Autovermietung',
          quantity: 1,
          unit_price: order_amount,
          total_amount: order_amount
        }
      ]
    };

    const resp = await axios.post('https://api.playground.klarna.com/hpp/v1/sessions', payload, {
      auth: { username, password },
      headers: { 'Content-Type': 'application/json' }
    });

    const data = resp.data || {};
    // HPP returns session_id; redirect URL is based on it
    if (data.session_id) {
      const redirect_url = `https://pay.playground.klarna.com/hpp/v1/sessions/${data.session_id}`;
      return res.json({ redirect_url });
    }
    if (data.redirect_url) {
      return res.json({ redirect_url: data.redirect_url });
    }
    return res.status(502).json({ error: 'Unexpected Klarna response', data });
  } catch (err) {
    const msg = err.response?.data || err.message;
    console.error('Klarna HPP session error:', msg);
    return res.status(500).json({ error: 'Klarna session failed', details: msg });
  }
});

module.exports = router;


