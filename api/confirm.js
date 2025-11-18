import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { number } = req.query;

  const { data, error } = await supabase
    .from('registrations')
    .select('name, number')
    .eq('number', number)
    .single();

  if (error || !data) return res.status(404).send('Registration not found');

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Konfirmasi Pendaftaran</title>
        <style>
          body { font-family: system-ui; background:#f9f9f9; margin:0; }
          header { background:linear-gradient(135deg,#4a90e2,#357ab8); color:white; padding:1rem; text-align:center; }
          main { max-width:600px; margin:2rem auto; background:white; padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center; }
        </style>
      </head>
      <body>
        <header><h1>Konfirmasi Pendaftaran</h1></header>
        <main>
          <h2>Halo, ${data.name}</h2>
          <p>Kamu terdaftar dengan nomor <strong>${data.number}</strong>.</p>
          <p>Tukarkan QR Code dengan Snack dari Panitia🍟</p>
          <p><a href="/">Kembali ke form pendaftaran</a></p>
        </main>
      </body>
    </html>
  `);
}

