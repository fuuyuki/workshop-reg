import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { number } = req.query;

  const { data, error } = await supabase
    .from('registrations')
    .select('name, number')
    .eq('number', number)
    .single();

  if (error || !data) {
    return res.status(404).send('Registration not found');
  }

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!doctype html>
    <html>
      <head>
        <title>Registration Confirmation</title>
        <style>
          body { font-family: system-ui; max-width: 600px; margin: 2rem auto; text-align: center; }
          h2 { color: #2c3e50; }
        </style>
      </head>
      <body>
        <h2>Hello, ${data.name}</h2>
        <p>You already registered with the number <strong>${data.number}</strong>.</p>
        <p><a href="/">Back to booking form</a></p>
      </body>
    </html>
  `);
}

