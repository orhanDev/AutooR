require('dotenv').config();
const express = require('express');

// JWT Secret - MUST be set in .env file for production
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not set!');
    console.error('Please create a .env file with JWT_SECRET=your_secret_key');
    process.exit(1);
}

// Database configuration - MUST be set in .env file
if (!process.env.PGUSER || !process.env.PGHOST || !process.env.PGDATABASE || !process.env.PGPASSWORD) {
    console.error('ERROR: Database environment variables are not set!');
    console.error('Please create a .env file with PGUSER, PGHOST, PGDATABASE, PGPASSWORD');
    process.exit(1);
}

process.env.PGPORT = process.env.PGPORT || '5432';
const path = require('path');
const fs = require('fs');
const carsRouter = require('./routes/cars');
const locationsRouter = require('./routes/locations');
const reservationsRouter = require('./routes/reservations');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const adminToolsRouter = require('./routes/admin_tools');
const contactRouter = require('./routes/contact');
const paymentsRouter = require('./routes/payments');
const usersRouter = require('./routes/users');
const googleAuthRouter = require('./routes/google-auth');
const testGoogleAuthRouter = require('./routes/test-google-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware - für Railway/Netlify
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://autoor-demo.netlify.app',
    'https://*.netlify.app',
    'http://localhost:3443',
    'http://localhost:3000',
    'https://localhost:3443'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      return origin && origin.includes(allowed.replace('*.', ''));
    }
    return origin === allowed;
  })) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Security headers (HTTP only; browsers ignore meta X-Frame-Options)
app.use((req, res, next) => {
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // MIME sniffing protection
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Basic Referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  // Reasonable CSP (keeps your current setup but prevents mixed content)
  // Allow Chrome DevTools and localhost connections for development
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const cspPolicy = isDevelopment 
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://localhost:* http://localhost:* ws://localhost:* wss://localhost:* https://*.netlify.app https://cdn.jsdelivr.net chrome-extension:; frame-src 'self'; upgrade-insecure-requests; block-all-mixed-content"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.netlify.app https://cdn.jsdelivr.net; upgrade-insecure-requests; block-all-mixed-content";
  res.setHeader('Content-Security-Policy', cspPolicy);
  next();
});

// Reservation confirmation page (must be before static middleware)
app.get('/reservation-confirmation', (req, res) => {
    console.log('Reservation confirmation route accessed');
    res.sendFile(path.join(__dirname, 'public', 'reservation-confirmation.html'));
});

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve images folder separately
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Favicon-Routen (werden bereits aus public serviert; als Backup belassen)
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
app.use('/api/users', usersRouter);
app.use('/auth', googleAuthRouter);
app.use('/auth', require('./routes/facebook-auth'));
app.use('/auth', require('./routes/apple-auth'));
app.use('/test', testGoogleAuthRouter);

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

// Extras & Versicherung page
app.get('/extras-versicherung', (req, res) => {
    console.log('Extras & Versicherung route accessed');
    res.sendFile(path.join(__dirname, 'public', 'extras-versicherung.html'));
});

app.get('/date-location-selection', (req, res) => {
    console.log('Date & Location Selection route accessed');
    res.sendFile(path.join(__dirname, 'public', 'date-location-selection.html'));
});

app.get('/fahrzeuge2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'fahrzeuge2.html'));
});

// Zahlungsinformationen page
app.get('/zahlungsinformationen', (req, res) => {
    console.log('Zahlungsinformationen route accessed');
    res.sendFile(path.join(__dirname, 'public', 'zahlungsinformationen.html'));
});


app.get('/register', (req, res) => {
    console.log('Register route accessed');
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
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

// Datenschutz page
app.get('/datenschutz', (req, res) => {
    console.log('Datenschutz route accessed');
    res.sendFile(path.join(__dirname, 'public', 'datenschutz.html'));
});

// Bedingungen page
app.get('/bedingungen', (req, res) => {
    console.log('Bedingungen route accessed');
    res.sendFile(path.join(__dirname, 'public', 'bedingungen.html'));
});

// Login page (direct route)
app.get('/login', (req, res) => {
    console.log('Login route accessed');
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Forgot password page
app.get('/forgot-password', (req, res) => {
    console.log('Forgot password route accessed');
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// Reset password page
app.get('/reset-password', (req, res) => {
    console.log('Reset password route accessed');
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
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

// Payment success page
app.get('/payment-success', (req, res) => {
    console.log('Payment success route accessed');
    res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

// PayPal success page
app.get('/paypal-success', (req, res) => {
    console.log('PayPal success route accessed');
    res.sendFile(path.join(__dirname, 'public', 'paypal-success.html'));
});

// PayPal cancel page
app.get('/paypal-cancel', (req, res) => {
    console.log('PayPal cancel route accessed');
    res.sendFile(path.join(__dirname, 'public', 'paypal-cancel.html'));
});

app.get('/google-oauth', (req, res) => {
    console.log('Google OAuth route accessed');
    res.sendFile(path.join(__dirname, 'public', 'google-oauth.html'));
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

// Account pages
app.get('/buchungen', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buchungen.html'));
});

app.get('/angebote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'angebote.html'));
});

// Self-Services page
app.get('/self-services', (req, res) => {
    console.log('Self-Services route accessed');
    res.sendFile(path.join(__dirname, 'public', 'self-services.html'));
});

// Geschäftskunden page
app.get('/geschaeftskunden', (req, res) => {
    console.log('Geschäftskunden route accessed');
    res.sendFile(path.join(__dirname, 'public', 'geschaeftskunden.html'));
});

// Standorte page
app.get('/standorte', (req, res) => {
    console.log('Standorte route accessed');
    res.sendFile(path.join(__dirname, 'public', 'standorte.html'));
});

app.get('/abos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'abos.html'));
});

app.get('/persoenliche-daten', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'persoenliche-daten.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/hilfe', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'hilfe.html'));
});

// React Router catch-all removed - using old HTML pages

// Test-Navbar-Seite entfernt

// Prüfen, ob Port verfügbar ist
function isPortAvailable(port) {
  try {
    const { execSync } = require('child_process');
    if (process.platform === 'win32') {
      const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8', stdio: 'pipe' });
      return result.trim().length === 0;
    } else {
      const result = execSync(`lsof -i :${port}`, { encoding: 'utf8', stdio: 'pipe' });
      return result.trim().length === 0;
    }
  } catch (e) {
    // Wenn Befehl fehlgeschlagen ist, ist Port wahrscheinlich frei
    return true;
  }
}

// Verfügbaren Port finden
function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

// Start server (HTTPS if certs available, otherwise HTTP)
let server;
// Railway/Production'da HTTPS kullanma - Railway kendi HTTPS'ini yönetir
const isProduction = process.env.NODE_ENV === 'production';

try {
  const https = require('https');
  const certDir = path.join(__dirname, 'certs');
  const keyPath = process.env.SSL_KEY_PATH || path.join(certDir, 'localhost-key.pem');
  const certPath = process.env.SSL_CERT_PATH || path.join(certDir, 'localhost-cert.pem');

  // Production'da sadece HTTP kullan (Railway HTTPS yönetir)
  if (isProduction) {
    // Railway'de PORT environment variable otomatik set edilir
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`HTTP läuft auf http://0.0.0.0:${PORT}`);
    });
  } else if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    let HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 3443;
    
    // Wenn Port in Verwendung ist, alternativen Port finden
    // HINWEIS: Port sollte sich für Google OAuth nicht ändern, daher zuerst versuchen, Prozess zu beenden
    if (!isPortAvailable(HTTPS_PORT)) {
      console.log(`⚠️ Port ${HTTPS_PORT} ist in Verwendung...`);
      
      // Windows'ta port'u kullanan Node.js process'ini öldürmeyi dene
      if (process.platform === 'win32') {
        try {
          const { execSync } = require('child_process');
          const result = execSync(`netstat -ano | findstr :${HTTPS_PORT} | findstr LISTENING`, { encoding: 'utf8', stdio: 'pipe' });
          const lines = result.trim().split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid) && pid !== '0' && pid !== process.pid.toString()) {
              try {
                const processInfo = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV`, { encoding: 'utf8', stdio: 'pipe' });
                if (processInfo.includes('node.exe')) {
                  console.log(`🔄 Node.js-Prozess (PID: ${pid}), der Port ${HTTPS_PORT} verwendet, wird beendet...`);
                  execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
                  require('child_process').execSync('timeout /t 1 /nobreak >nul 2>&1', { stdio: 'ignore' });
                  console.log(`✅ Port ${HTTPS_PORT} wurde freigegeben`);
                  break;
                }
              } catch (e) {
                // Prozess existiert bereits nicht mehr
              }
            }
          }
        } catch (e) {
          // Port frei oder Fehler
        }
      }
      
      // Wenn immer noch in Verwendung, alternativen Port finden
      if (!isPortAvailable(HTTPS_PORT)) {
        console.log(`⚠️ Port ${HTTPS_PORT} ist immer noch in Verwendung, alternativer Port wird gesucht...`);
        const altPort = findAvailablePort(HTTPS_PORT);
        if (altPort) {
          HTTPS_PORT = altPort;
          console.log(`✅ Port ${HTTPS_PORT} wird verwendet`);
          console.log(`⚠️ ACHTUNG: Fügen Sie folgende Redirect-URI zu Google Cloud Console hinzu:`);
          console.log(`   https://localhost:${HTTPS_PORT}/auth/google/callback`);
        } else {
          console.error(`❌ Port ${HTTPS_PORT} und folgende Ports sind in Verwendung!`);
          process.exit(1);
        }
      }
    }
    
    // Verwendeten Port in Umgebungsvariable speichern (für Google OAuth)
    process.env.ACTUAL_HTTPS_PORT = HTTPS_PORT.toString();
    
    server = https.createServer(httpsOptions, app);
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️ Port ${HTTPS_PORT} ist in Verwendung, alternativer Port wird gesucht...`);
        const altPort = findAvailablePort(HTTPS_PORT);
        if (altPort) {
          HTTPS_PORT = altPort;
          console.log(`✅ Port ${HTTPS_PORT} wird verwendet`);
          server.listen(HTTPS_PORT, () => {
            console.log(`🔒 HTTPS läuft auf https://localhost:${HTTPS_PORT}`);
          });
        } else {
          console.error(`❌ Port ${HTTPS_PORT} und nachfolgende Ports sind belegt!`);
          process.exit(1);
        }
      } else {
        console.error('Server error:', err);
        throw err;
      }
    });
    server.listen(HTTPS_PORT, () => {
      console.log(`🔒 HTTPS läuft auf https://localhost:${HTTPS_PORT}`);
    });
  } else {
    // Portprüfung für HTTP
    let httpPort = PORT;
    if (!isPortAvailable(httpPort)) {
      console.log(`⚠️ Port ${httpPort} ist in Verwendung, alternativer Port wird gesucht...`);
        const altPort = findAvailablePort(httpPort);
        if (altPort) {
          httpPort = altPort;
          console.log(`✅ Port ${httpPort} wird verwendet`);
      }
    }
    server = app.listen(httpPort, () => {
      console.log(`HTTP läuft auf http://localhost:${httpPort}`);
    });
  }
} catch (e) {
  if (e.code === 'EADDRINUSE') {
    let port = parseInt(process.env.HTTPS_PORT) || 3443;
    console.log(`\n⚠️ Port ${port} ist in Verwendung, alternativer Port wird gesucht...`);
        const altPort = findAvailablePort(port);
        if (altPort) {
          port = altPort;
          console.log(`✅ Port ${port} wird verwendet`);
      try {
        const https = require('https');
        const certDir = path.join(__dirname, 'certs');
        const keyPath = process.env.SSL_KEY_PATH || path.join(certDir, 'localhost-key.pem');
        const certPath = process.env.SSL_CERT_PATH || path.join(certDir, 'localhost-cert.pem');
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
          const httpsOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
          };
          server = https.createServer(httpsOptions, app);
          server.listen(port, () => {
            console.log(`🔒 HTTPS läuft auf https://localhost:${port}`);
          });
        }
      } catch (retryErr) {
        console.error(`❌ Port ${port} konnte nicht gestartet werden!`);
        process.exit(1);
      }
    } else {
      console.error(`❌ Port ${port} und nachfolgende Ports sind belegt!`);
      process.exit(1);
    }
  } else {
    console.warn('HTTPS initialisierung fehlgeschlagen, falle auf HTTP zurück:', e.message);
    let httpPort = PORT;
    if (!isPortAvailable(httpPort)) {
      console.log(`⚠️ Port ${httpPort} ist in Verwendung, alternativer Port wird gesucht...`);
        const altPort = findAvailablePort(httpPort);
        if (altPort) {
          httpPort = altPort;
          console.log(`✅ Port ${httpPort} wird verwendet`);
      }
    }
    try {
      server = app.listen(httpPort, () => {
        console.log(`HTTP läuft auf http://localhost:${httpPort}`);
      });
    } catch (httpErr) {
      if (httpErr.code === 'EADDRINUSE') {
        console.log(`\n⚠️ Port ${httpPort} wird verwendet, suche nach alternativem Port...`);
        const altPort = findAvailablePort(httpPort);
        if (altPort) {
          httpPort = altPort;
          console.log(`✅ Port ${httpPort} wird verwendet`);
          server = app.listen(httpPort, () => {
            console.log(`HTTP läuft auf http://localhost:${httpPort}`);
          });
        } else {
          console.error(`❌ Port ${httpPort} und nachfolgende Ports sind belegt!`);
          process.exit(1);
        }
      } else {
        throw httpErr;
      }
    }
  }
}

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
