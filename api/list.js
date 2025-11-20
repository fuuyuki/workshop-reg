import { createClient } from '@supabase/supabase-js';
import { SpeedInsights } from "@vercel/speed-insights/next"
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('registrations')
    .select('name, number, created_at')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).send('Database error: ' + error.message);

  const rows = data.map((r, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${r.name}</td>
      <td>${r.number}</td>
      <td>${new Date(r.created_at).toLocaleString()}</td>
      <td></td> <!-- blank for signature -->
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
          main { max-width:800px; margin:2rem auto; background:white; padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); }
          table { width:100%; border-collapse:collapse; margin-top:1rem; }
          th, td { border:1px solid #ccc; padding:0.5rem; text-align:left; }
          th { background:#eee; }
          td:last-child { height:2rem; } /* space for signature */
          button { margin-top:1rem; padding:0.5rem 1rem; background:#4a90e2; color:white; border:none; border-radius:4px; cursor:pointer; }
          button:hover { background:#357ab8; }
        </style>
      </head>
      <body>
        <header><h1>Pendaftaran Acara</h1></header>
        <main>
          <h2>Peserta Terdaftar</h2>
          <table id="participants-table">
            <tr>
              <th>#</th>
              <th>Nama</th>
              <th>Nomor</th>
              <th>Jam Daftar</th>
              <th>Tanda Tangan</th>
            </tr>
            ${rows}
          </table>
          <button onclick="exportPDFFromData()">Export to PDF</button>
        </main>

        <!-- jsPDF + AutoTable -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
        <script>
          function exportPDFFromData() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Table headers
            const headers = [["#", "Nama", "Nomor", "Jam Daftar", "Tanda Tangan"]];

            // Extract data from HTML table into rows
            const table = document.getElementById("participants-table");
            const rows = Array.from(table.querySelectorAll("tr"))
              .slice(1) // skip header row
              .map((tr, i) => {
                const cells = tr.querySelectorAll("td");
                return [
                  i + 1,
                  cells[1].innerText,
                  cells[2].innerText,
                  cells[3].innerText,
                  "" // blank signature column
                ];
              });

            // Title
            doc.setFontSize(14);
            doc.text("Daftar Kehadiran Peserta", 14, 15);

            // Generate table
            doc.autoTable({
              head: headers,
              body: rows,
              startY: 20,
              styles: { halign: "left", valign: "middle" },
              columnStyles: { 4: { cellWidth: 40 } } // wider signature column
            });

            // Footer with total participants
            doc.setFontSize(10);
            doc.text("Total Peserta: " + rows.length, 14, doc.lastAutoTable.finalY + 10);

            // Save PDF
            doc.save("presence-sheet.pdf");
          }
        </script>
      </body>
    </html>
  `);
}
