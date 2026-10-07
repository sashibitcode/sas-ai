/**
 * File & PDF Export Utilities for SAS AI Library
 */

/**
 * Trigger download of any text or code file (e.g. .py, .ts, .json, .html, .csv)
 */
export function downloadTextFile(fileName: string, content: string, mimeType = 'text/plain') {
  if (typeof window === 'undefined') return;
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download file:', err);
  }
}

/**
 * Format markdown to clean HTML for PDF rendering
 */
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headings
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight: 600; margin-top: 1.2rem; margin-bottom: 0.4rem; color: #1e293b;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.35rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3rem;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.6rem; font-weight: 800; margin-top: 1.8rem; margin-bottom: 0.6rem; color: #0f172a;">$1</h1>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre style="background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; border: 1px solid #cbd5e1; overflow-x: auto; margin: 12px 0;"><code>$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #0284c7;">$1</code>')
    // Lists
    .replace(/^\s*\-\s+(.*$)/gim, '<li style="margin-bottom: 4px; margin-left: 20px;">$1</li>')
    .replace(/^\s*\*\s+(.*$)/gim, '<li style="margin-bottom: 4px; margin-left: 20px;">$1</li>')
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<li style="margin-bottom: 4px; margin-left: 20px; list-style-type: decimal;">$1</li>')
    // Line breaks & paragraphs
    .replace(/\n\n+/gim, '</p><p style="margin-bottom: 10px; line-height: 1.65; color: #334155;">')
    .replace(/\n/gim, '<br />');

  return `<p style="margin-bottom: 10px; line-height: 1.65; color: #334155;">${html}</p>`;
}

/**
 * Print & Export clean PDF Document with high-fidelity formatting
 */
export function exportDocumentAsPdf(title: string, rawContent: string) {
  if (typeof window === 'undefined') return;

  const formattedHtml = markdownToHtml(rawContent);
  const dateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    // If popup blocked, fallback to downloading .md / .txt
    downloadTextFile(`${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`, rawContent, 'text/markdown');
    return;
  }

  const documentMarkup = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title} - SAS AI Export</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          @page {
            size: A4;
            margin: 20mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            background: #ffffff;
            padding: 30px;
            font-size: 13.5px;
            line-height: 1.65;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .brand {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .badge {
            font-size: 10px;
            padding: 2px 8px;
            background: #e0f2fe;
            color: #0284c7;
            border-radius: 999px;
            font-weight: 600;
          }
          .date {
            font-size: 11px;
            color: #64748b;
          }
          .doc-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 16px;
            line-height: 1.25;
            letter-spacing: -0.5px;
          }
          .content {
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <span>SAS AI</span>
            <span class="badge">AI Generated Document</span>
          </div>
          <div class="date">${dateStr}</div>
        </div>

        <h1 class="doc-title">${title}</h1>

        <div class="content">
          ${formattedHtml}
        </div>

        <div class="footer">
          <span>Generated by SAS AI — Creator: SHASHIKANT RAJ (sashibitcode)</span>
          <span>Confidential & Private</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(documentMarkup);
  printWindow.document.close();
}
