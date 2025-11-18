import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('registrations')
    .select('name, number')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).send('Database error: ' + error.message);

  const rows = data.map(r => `<tr><td>${r.name}</td><td>${r.number}</td></tr>`).join('');

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Data Peserta Terdaftar</title>
        <style>
          body { font-family: system-ui; background:#f9f9f9; margin:0; }
          header { background:linear-gradient(135deg,#4a90e2,#357ab8); color:white; padding:1rem; text-align:center; }
          main { max-width:600px; margin:2rem auto; background:white; padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
          table { width:100%; border-collapse:collapse; margin-top:1rem; }
          th, td { border:1px solid #ccc; padding:0.5rem; text-align:left; }
          th { background:#eee; }
        </style>
      </head>
      <body>
        <header><h1>Pendaftaran Acara</h1></header>
        <main>
          <h2>Peserta Terdaftar</h2>
          <table>
            <tr><th>Nama</th><th>Nomor</th></tr>
            ${rows}
          </table>
        </main>
      </body>
    </html>
  `);
}
