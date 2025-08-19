require('dotenv').config();
const express = require('express');

// JWT Secret - Use environment variable in production
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';

// Database configuration - Update according to your pgAdmin database
process.env.PGUSER = process.env.PGUSER || 'cinetime';
process.env.PGHOST = process.env.PGHOST || 'localhost';
process.env.PGDATABASE = process.env.PGDATABASE || 'rentacar_db';
process.env.PGPASSWORD = process.env.PGPASSWORD || 'Vekil4023.';
process.env.PGPORT = process.env.PGPORT || '5432';
const path = require('path');
const carsRouter = require('./routes/cars');
const locationsRouter = require('./routes/locations');
const reservationsRouter = require('./routes/reservations');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const adminToolsRouter = require('./routes/admin_tools');
const contactRouter = require('./routes/contact');
const paymentsRouter = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve images folder separately
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Favicon routes (public altından zaten servis ediliyor; yedek olarak bırakıldı)
app.get('/favicon.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Routes
app.use('/api/cars', carsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin-tools', adminToolsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/payments', paymentsRouter);

// Admin Panel HTML page routes
app.get('/views/admin/locations.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'locations.html'));
});

app.get('/views/admin/features.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'features.html'));
});

// Search results page route
app.get('/views/search_results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search_results.html'));
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fahrzeuge page
app.get('/fahrzeuge', (req, res) => {
    console.log('Fahrzeuge route accessed');
    res.sendFile(path.join(__dirname, 'public', 'fahrzeuge.html'));
});

// Über uns page
app.get('/ueber-uns', (req, res) => {
    console.log('Über uns route accessed');
    res.sendFile(path.join(__dirname, 'public', 'ueber-uns.html'));
});

// Kontakt page
app.get('/kontakt', (req, res) => {
    console.log('Kontakt route accessed');
    res.sendFile(path.join(__dirname, 'public', 'kontakt.html'));
});

// Login page (direct route)
app.get('/login', (req, res) => {
    console.log('Login route accessed');
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Vehicle details page
app.get('/vehicle-details/:id', (req, res) => {
    console.log('Vehicle details route accessed:', req.params.id);
    res.sendFile(path.join(__dirname, 'public', 'vehicle-details.html'));
});

// Reservation page
app.get('/reservation', (req, res) => {
    console.log('Reservation route accessed');
    res.sendFile(path.join(__dirname, 'public', 'reservation.html'));
});

// Payment page
app.get('/payment', (req, res) => {
    console.log('Payment route accessed');
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

// Login page
app.get('/views/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Register page
app.get('/views/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Checkout page
app.get('/views/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

// Extras page
app.get('/views/extras.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'extras.html'));
});

// Review & Reservation page
app.get('/views/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'review.html'));
});

// Klarna Demo page
app.get('/views/klarna_demo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'klarna_demo.html'));
});

// Profile page
app.get('/views/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

// Car details page
app.get('/views/car_details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'car_details.html'));
});

// Reservation confirmation page
app.get('/views/reservation_confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reservation_confirmation.html'));
});

// Test navbar page kaldırıldı

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:3000`);
});

// Make keep-alive connections not keep the process alive too long during shutdown
server.keepAliveTimeout = 1000; // 1s
server.headersTimeout = 2000; // 2s

// Windows PowerShell can swallow SIGINT; forward from readline
try {
  if (process.platform === 'win32') {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('SIGINT', () => {
      process.emit('SIGINT');
    });
  }
} catch (_) {}

// Graceful shutdown for Ctrl+C / SIGTERM / SIGBREAK
function shutdown() {
  console.log('\n🛑 Server wird beendet...');
  const forceExitTimer = setTimeout(() => {
    console.warn('⚠️ Erzwinge Beenden (Timeout)');
    process.exit(1);
  }, 5000).unref();
  try {
    // Try to close DB pool if available
    const db = require('./db/database');
    Promise.resolve(db.end?.()).finally(() => {
      server.close(() => {
        console.log('✅ Server erfolgreich beendet.');
        clearTimeout(forceExitTimer);
        process.exit(0);
      });
    });
  } catch (e) {
    server.close(() => {
      console.log('✅ Server erfolgreich beendet.');
      process.exit(0);
    });
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
// On Windows consoles, CTRL+BREAK generates SIGBREAK
process.on('SIGBREAK', shutdown);
