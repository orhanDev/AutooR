require('dotenv').config();
const express = require('express');

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is not set!');
    console.error('Please create a .env file with JWT_SECRET=your_secret_key');
    process.exit(1);
}

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

app.use((req, res, next) => {
  const allowedOrigins = [
    'https:
    'https:
    'http:
    'http:
    'https:
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

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use((req, res, next) => {
  
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const cspPolicy = isDevelopment 
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:
    : "default-src 'self'; script-src 'self' 'unsafe-inline' https:
  res.setHeader('Content-Security-Policy', cspPolicy);
  next();
});

app.get('/reservation-confirmation', (req, res) => {
    console.log('Reservation confirmation route accessed');
    res.sendFile(path.join(__dirname, 'public', 'reservation-confirmation.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

app.get('/favicon.svg', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

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

app.get('/views/admin/locations.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'locations.html'));
});

app.get('/views/admin/features.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'features.html'));
});

app.get('/views/search_results.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search_results.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/fahrzeuge', (req, res) => {
    console.log('Fahrzeuge route accessed');
    res.sendFile(path.join(__dirname, 'public', 'fahrzeuge.html'));
});

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

app.get('/zahlungsinformationen', (req, res) => {
    console.log('Zahlungsinformationen route accessed');
    res.sendFile(path.join(__dirname, 'public', 'zahlungsinformationen.html'));
});

app.get('/register', (req, res) => {
    console.log('Register route accessed');
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/ueber-uns', (req, res) => {
    console.log('Über uns route accessed');
    res.sendFile(path.join(__dirname, 'public', 'ueber-uns.html'));
});

app.get('/kontakt', (req, res) => {
    console.log('Kontakt route accessed');
    res.sendFile(path.join(__dirname, 'public', 'kontakt.html'));
});

app.get('/datenschutz', (req, res) => {
    console.log('Datenschutz route accessed');
    res.sendFile(path.join(__dirname, 'public', 'datenschutz.html'));
});

app.get('/bedingungen', (req, res) => {
    console.log('Bedingungen route accessed');
    res.sendFile(path.join(__dirname, 'public', 'bedingungen.html'));
});

app.get('/login', (req, res) => {
    console.log('Login route accessed');
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/forgot-password', (req, res) => {
    console.log('Forgot password route accessed');
    res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
    console.log('Reset password route accessed');
    res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/vehicle-details/:id', (req, res) => {
    console.log('Vehicle details route accessed:', req.params.id);
    res.sendFile(path.join(__dirname, 'public', 'vehicle-details.html'));
});

app.get('/reservation', (req, res) => {
    console.log('Reservation route accessed');
    res.sendFile(path.join(__dirname, 'public', 'reservation.html'));
});

app.get('/payment', (req, res) => {
    console.log('Payment route accessed');
    res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

app.get('/payment-success', (req, res) => {
    console.log('Payment success route accessed');
    res.sendFile(path.join(__dirname, 'public', 'payment-success.html'));
});

app.get('/paypal-success', (req, res) => {
    console.log('PayPal success route accessed');
    res.sendFile(path.join(__dirname, 'public', 'paypal-success.html'));
});

app.get('/paypal-cancel', (req, res) => {
    console.log('PayPal cancel route accessed');
    res.sendFile(path.join(__dirname, 'public', 'paypal-cancel.html'));
});

app.get('/google-oauth', (req, res) => {
    console.log('Google OAuth route accessed');
    res.sendFile(path.join(__dirname, 'public', 'google-oauth.html'));
});

app.get('/views/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/views/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/views/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/views/extras.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'extras.html'));
});

app.get('/views/review.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'review.html'));
});

app.get('/views/klarna_demo.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'klarna_demo.html'));
});

app.get('/views/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});

app.get('/views/car_details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'car_details.html'));
});

app.get('/views/reservation_confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'reservation_confirmation.html'));
});

app.get('/buchungen', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buchungen.html'));
});

app.get('/angebote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'angebote.html'));
});

app.get('/self-services', (req, res) => {
    console.log('Self-Services route accessed');
    res.sendFile(path.join(__dirname, 'public', 'self-services.html'));
});

app.get('/geschaeftskunden', (req, res) => {
    console.log('Geschäftskunden route accessed');
    res.sendFile(path.join(__dirname, 'public', 'geschaeftskunden.html'));
});

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
    
    return true;
  }
}

function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

let server;

const isProduction = process.env.NODE_ENV === 'production';

try {
  const https = require('https');
  const certDir = path.join(__dirname, 'certs');
  const keyPath = process.env.SSL_KEY_PATH || path.join(certDir, 'localhost-key.pem');
  const certPath = process.env.SSL_CERT_PATH || path.join(certDir, 'localhost-cert.pem');

  if (isProduction) {
    
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`HTTP läuft auf http:
    });
  } else if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    let HTTPS_PORT = parseInt(process.env.HTTPS_PORT) || 3443;

    if (!isPortAvailable(HTTPS_PORT)) {
      console.log(`⚠️ Port ${HTTPS_PORT} ist in Verwendung...`);

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
                
              }
            }
          }
        } catch (e) {
          
        }
      }

      if (!isPortAvailable(HTTPS_PORT)) {
        console.log(`⚠️ Port ${HTTPS_PORT} ist immer noch in Verwendung, alternativer Port wird gesucht...`);
        const altPort = findAvailablePort(HTTPS_PORT);
        if (altPort) {
          HTTPS_PORT = altPort;
          console.log(`✅ Port ${HTTPS_PORT} wird verwendet`);
          console.log(`⚠️ ACHTUNG: Fügen Sie folgende Redirect-URI zu Google Cloud Console hinzu:`);
          console.log(`   https:
        } else {
          console.error(`❌ Port ${HTTPS_PORT} und folgende Ports sind in Verwendung!`);
          process.exit(1);
        }
      }
    }

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
            console.log(`🔒 HTTPS läuft auf https:
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
      console.log(`🔒 HTTPS läuft auf https:
    });
  } else {
    
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
      console.log(`HTTP läuft auf http:
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
            console.log(`🔒 HTTPS läuft auf https:
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
        console.log(`HTTP läuft auf http:
      });
    } catch (httpErr) {
      if (httpErr.code === 'EADDRINUSE') {
        console.log(`\n⚠️ Port ${httpPort} wird verwendet, suche nach alternativem Port...`);
        const altPort = findAvailablePort(httpPort);
        if (altPort) {
          httpPort = altPort;
          console.log(`✅ Port ${httpPort} wird verwendet`);
          server = app.listen(httpPort, () => {
            console.log(`HTTP läuft auf http:
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

server.keepAliveTimeout = 1000; 
server.headersTimeout = 2000; 

try {
  if (process.platform === 'win32') {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('SIGINT', () => {
      process.emit('SIGINT');
    });
  }
} catch (_) {}

function shutdown() {
  console.log('\n🛑 Server wird beendet...');
  const forceExitTimer = setTimeout(() => {
    console.warn('⚠️ Erzwinge Beenden (Timeout)');
    process.exit(1);
  }, 5000).unref();
  try {
    
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

process.on('SIGBREAK', shutdown);