import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  // Delete all registrations
  const { error } = await supabase.from('registrations').delete().neq('id', 0);

  if (error) return res.status(500).send('Database error: ' + error.message);

  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <h2>All registrations cleared</h2>
    <p>Next booking will start again from <strong>#1</strong>.</p>
    <p><a href="/">Back to booking form</a></p>
  `);
}

