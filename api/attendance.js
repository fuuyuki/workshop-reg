import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Render the attendance form
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!doctype html>
      <html>
        <head>
          <title>Absensi Peserta</title>
          <style>
            body { font-family: system-ui; background:#f9f9f9; margin:0; }
            header { background:linear-gradient(135deg,#4a90e2,#357ab8); color:white; padding:1rem; text-align:center; }
            main { max-width:400px; margin:2rem auto; background:white; padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
            input, button { width:100%; padding:0.5rem; margin-top:1rem; }
            button { background:#4a90e2; color:white; border:none; border-radius:4px; cursor:pointer; }
            button:hover { background:#357ab8; }
          </style>
        </head>
        <body>
          <header><h1>Absensi Peserta</h1></header>
          <main>
            <form method="POST">
              <label>Masukkan Nomor Unik Peserta:</label>
              <input type="text" name="number" required />
              <button type="submit">Submit</button>
            </form>
          </main>
        </body>
      </html>
    `);
  }

  if (req.method === 'POST') {
    const { number } = req.body;

    try {
      // 1. Check if participant exists
      const { data: participant, error } = await supabase
        .from('registrations')
        .select('id, number, checked')
        .eq('number', number)
        .single();

      if (error || !participant) {
        // Number not found → show popup
        return res.send(`
          <script>
            alert("Nomor tidak ditemukan!");
            window.history.back();
          </script>
        `);
      }

      // 2. Update attendance: set checked = true, record time
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ 
          checked: true, 
          attendance_time: new Date().toISOString() 
        })
        .eq('id', participant.id);

      if (updateError) {
        console.error(updateError);
        return res.status(500).send("Database error");
      }

      // 3. Redirect to confirm page with participant ID
      return res.redirect(`/api/confirm?number=${participant.number}`);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
  }
}

