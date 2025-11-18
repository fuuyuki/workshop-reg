export default async function handler(req, res) {
  const { id, name } = req.query;

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
        <h2>Hello, ${name}</h2>
        <p>You already registered with the number <strong>${id}</strong>.</p>
        <p><a href="/">Back to booking form</a></p>
      </body>
    </html>
  `);
}

