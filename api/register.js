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
    <h2>Booking Confirmed</h2>
    <p>Hi <strong>${reg.name}</strong>, your unique number is <strong>${reg.number}</strong>.</p>
    <p>Scan this QR to view your confirmation page:</p>
    <img src="${qr}" alt="QR Code"/>
    <p><a href="${confirmUrl}">Open Confirmation Page</a></p>
  `);
}

