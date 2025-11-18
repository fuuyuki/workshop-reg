import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const name = (req.body?.name || '').trim();
  if (!name) return res.status(400).send('Name required');

  // Insert into Supabase
  const { data, error } = await supabase
    .from('registrations')
    .insert([{ name }])
    .select();

  if (error) return res.status(500).send('Database error: ' + error.message);

  const reg = data[0];
  const qr = await QRCode.toDataURL(`REG-${reg.id}`);

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <h2>Booking Confirmed</h2>
    <p>Hi <strong>${reg.name}</strong>, you booked number <strong>${reg.id}</strong>.</p>
    <img src="${qr}" alt="QR Code"/>
    <p><a href="/">Book another</a></p>
  `);
}

