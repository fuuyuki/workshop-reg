import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('registrations')
    .select('name, number, created_at')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).send('Database error: ' + error.message);

  // Use index from map to generate count column
  const rows = data.map((r, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${r.name}</td>
      <td>${r.number}</td>
      <td>${new Date(r.created_at).toLocaleString()}</td>
    </tr>
  `).join('');

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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
	<script>
	async function exportPDF() {
	  const { jsPDF } = window.jspdf;

	  // Capture the table element
	  const table = document.querySelector("table");

	  // Convert table to canvas
	  const canvas = await html2canvas(table);
	  const imgData = canvas.toDataURL("image/png");

	  // Create PDF
	  const pdf = new jsPDF("p", "mm", "a4");
	  const imgProps = pdf.getImageProperties(imgData);
	  const pdfWidth = pdf.internal.pageSize.getWidth();
	  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

	  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
	  pdf.save("participants.pdf");
	}
	</script>
      </head>
      <body>
        <header><h1>Pendaftaran Acara</h1></header>
        <main>
          <h2>Peserta Terdaftar</h2>
          <table>
            <tr><th>#</th><th>Nama</th><th>Nomor</th><th>Jam Daftar</th></tr>
            ${rows}
          </table>
          <button onclick="exportPDF()">Export to PDF</button>
        </main>
      </body>
    </html>
  `);
}
