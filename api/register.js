import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function generateUniqueNumber() {
  let unique = false;
  let number;

  while (!unique) {
    number = Math.floor(100 + Math.random() * 900); // 3-digit random
    const { data, error } = await supabase
      .from('registrations')
      .select('number')
      .eq('number', number);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      unique = true;
    }
  }

  return number;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const name = (req.body?.name || '').trim();
  if (!name) return res.status(400).send('Name required');

  // Generate unique 3-digit number
  const number = await generateUniqueNumber();

  // Insert into Supabase
  const { data, error } = await supabase
    .from('registrations')
    .insert([{ name, number }])
    .select();

  if (error) return res.status(500).send('Database error: ' + error.message);

  const reg = data[0];

  // Generate QR code pointing to /api/confirm
  const confirmUrl = `${req.headers.origin}/api/confirm?number=${reg.number}`;
  const qr = await QRCode.toDataURL(confirmUrl);

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Pendaftaran Terkonfirmasi</title>
        <style>
          body { font-family: system-ui; background:#f9f9f9; margin:0; }
          header { background:linear-gradient(135deg,#4a90e2,#357ab8); color:white; padding:1rem; text-align:center; }
          main { max-width:600px; margin:2rem auto; background:white; padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center; }
          img { margin-top:1rem; }
        </style>
      </head>
      <body>
        <header><h1>Registrasi Acara</h1></header>
        <main>
          <h2>Pendaftaran Terkonfirmasi</h2>
          <p>Halo <strong>${reg.name}</strong>, nomor unikmu <strong>${reg.number}</strong>.</p>
          <p>Scan QR ini untuk bukti pendaftaran:</p>
          <img src="${qr}" alt="QR Code"/>
          <p><a href="${confirmUrl}">Buka Halaman Konfirmasi</a></p>
        </main>
      </body>
    </html>
  `);
}

