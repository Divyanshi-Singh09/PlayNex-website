import fs from 'node:fs';

const files = ['playnex-horizontal.png', 'playnex-mark.png', 'playnex-wordmark.png', 'playnex-original-logo.png'];
let html = '<!DOCTYPE html><html><head><title>Logo Check</title></head><body style="background:#f0f4f8; font-family:sans-serif; padding:40px;">';

for (const f of files) {
  const p = 'public/images/' + f;
  if (!fs.existsSync(p)) continue;
  const b64 = fs.readFileSync(p).toString('base64');
  html += `<div style="background:#fff; border-radius:12px; padding:20px; margin-bottom:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    <h3>${f}</h3>
    <div style="display:flex; gap:20px; flex-wrap:wrap;">
      <div style="background:#ffffff; border:1px solid #ccc; padding:15px; border-radius:8px;">
        <p style="margin:0 0 8px; font-size:12px; color:#666;">On White Background (#ffffff):</p>
        <img src="data:image/png;base64,${b64}" style="max-height:80px; width:auto; border:1px dashed #ddd;" />
      </div>
      <div style="background:#071f3f; color:#fff; border:1px solid #333; padding:15px; border-radius:8px;">
        <p style="margin:0 0 8px; font-size:12px; color:#aaa;">On Navy Background (#071f3f):</p>
        <img src="data:image/png;base64,${b64}" style="max-height:80px; width:auto; border:1px dashed #555;" />
      </div>
    </div>
  </div>`;
}

html += '</body></html>';
fs.writeFileSync('public/test-logo.html', html);
console.log('Created public/test-logo.html');

