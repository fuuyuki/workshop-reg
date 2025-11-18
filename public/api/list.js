import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id, name, created_at')
    .order('id');

  if (error) return res.status(500).send('Database error: ' + error.message);

  const rows = data.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.created_at}</td>
    </tr>
  `).join('');

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Registration List</title>
        <style>
          body { font-family: system-ui; max-width: 800px; margin: 2rem auto; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background: #f4f4f4; }
          tr:nth-child(even) { background: #fafafa; }
        </style>
      </head>
      <body>
        <h2>Registration List</h2>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Registered At</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><a href="/">Back to booking form</a></p>
      </body>
    </html>
  `);
}

