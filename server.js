// server.js
const express = require('express');
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('db.sqlite');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Registration endpoint
app.post('/register', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).send('Name is required');

  db.run(`INSERT INTO registrations (name) VALUES (?)`, [name], function (err) {
    if (err) return res.status(500).send('Database error');
    const regNumber = this.lastID;

    // QR payload can be just the reg number or JSON
    const payload = JSON.stringify({ n: regNumber, name });

    QRCode.toDataURL(payload, { errorCorrectionLevel: 'M' }, (qErr, url) => {
      if (qErr) return res.status(500).send('QR error');
      res.send(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <title>Booking Confirmed</title>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 2rem auto; }
              img { width: 240px; height: 240px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <h2>Booking Confirmed</h2>
            <p>Hi <strong>${name}</strong>, you already booked for number <strong>${regNumber}</strong>.</p>
            <img src="${url}" alt="QR Code"/>
            <p style="margin-top:1rem;"><a href="/">Book another</a></p>
          </body>
        </html>
      `);
    });
  });
});

// Admin-only list with frontend table
app.get('/list', (req, res) => {
  db.all(`SELECT id, name, created_at FROM registrations ORDER BY id`, [], (err, rows) => {
    if (err) return res.status(500).send('Database error');

    // Build HTML table
    let tableRows = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.created_at}</td>
      </tr>
    `).join('');

    res.send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <title>Registration List</title>
          <style>
            body { font-family: system-ui; max-width: 800px; margin: 2rem auto; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
            tr:nth-child(even) { background: #fafafa; }
          </style>
        </head>
        <body>
          <h2>Registration List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <p style="margin-top:1rem;"><a href="/">Back to booking form</a></p>
        </body>
      </html>
    `);
  });
});

// Admin-only reset route
app.get('/reset', (req, res) => {
  db.serialize(() => {
    // Delete all rows
    db.run(`DELETE FROM registrations`);

    // Reset auto-increment counter
    db.run(`DELETE FROM sqlite_sequence WHERE name='registrations'`);

    res.send(`
      <!doctype html>
      <html>
        <head><meta charset="utf-8"/><title>Reset Done</title></head>
        <body style="font-family: system-ui; max-width: 600px; margin: 2rem auto;">
          <h2>All registrations cleared</h2>
          <p>Next booking will start again from <strong>#1</strong>.</p>
          <p><a href="/">Back to booking form</a></p>
        </body>
      </html>
    `);
  });
});


// Serve the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

