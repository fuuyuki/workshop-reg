import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { number } = req.query;

  try {
    // Fetch participant data by ID
    const { data: participant, error } = await supabase
      .from('registrations')
      .select('name, number, created_at, attendance_time, checked')
      .eq('id', id)
      .single();

    if (error || !participant) {
      return res.status(404).send('Peserta tidak ditemukan');
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Konfirmasi Kehadiran</title>
          <style>
            body { font-family: system-ui; background:#f9f9f9; margin:0; }
            header { background:linear-gradient(135deg,#4a90e2,#357ab8); color:white; padding:1rem; text-align:center; }
            main { max-width:500px; margin:2rem auto; background:white; padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
            p { margin:0.5rem 0; }
            .status { margin-top:1rem; font-weight:bold; color:${participant.checked ? 'green' : 'red'}; }
          </style>
        </head>
        <body>
          <header><h1>Konfirmasi Kehadiran</h1></header>
          <main>
            <h2>Data Peserta</h2>
            <p><strong>Nama:</strong> ${participant.name}</p>
            <p><strong>Nomor Unik:</strong> ${participant.number}</p>
            <p><strong>Waktu Pendaftaran:</strong> ${new Date(participant.created_at).toLocaleString()}</p>
            <p><strong>Waktu Kehadiran:</strong> ${participant.attendance_time ? new Date(participant.attendance_time).toLocaleString() : '-'}</p>
            <p class="status">Status Kehadiran: ${participant.checked ? 'Sudah Hadir' : 'Belum Hadir'}</p>
          </main>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

