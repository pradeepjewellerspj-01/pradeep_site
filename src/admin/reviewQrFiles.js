import QRCode from 'qrcode';
import monogram from '../assets/brand/pj-monogram.png';
import { QR_COLOURS } from '../components/common/ReviewQR';

// The letterhead font for प्रदीप, when it is bundled (see components/common/BrandNameHi.jsx).
const [kruti] = Object.values(import.meta.glob('../assets/fonts/KrutiDev680.{woff2,woff,ttf,otf}', { eager: true, query: '?url', import: 'default' }));

/** Saves the review QR code as a large PNG, for WhatsApp status, bills or a print shop. */
export async function downloadReviewQr(url) {
  const dataUrl = await QRCode.toDataURL(url, { width: 1200, margin: 2, errorCorrectionLevel: 'M', color: QR_COLOURS });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'pradeep-jewellers-google-review-qr.png';
  a.click();
}

/** Opens a counter card (A5-sized) with the QR code, ready to print. */
export async function printReviewCard(url) {
  const svg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: QR_COLOURS });
  const win = window.open('', '_blank');
  if (!win) throw new Error('Allow pop-ups for this site to print the card');
  win.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Rate us on Google | Pradeep Jewellers</title>
<style>
  @page { size: A5; margin: 0; }${kruti ? `\n  @font-face { font-family: Kruti; src: url(${new URL(kruti, window.location.origin).href}); }` : ''}
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #3b0d0f; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .card { width: 148mm; height: 210mm; margin: 0 auto; padding: 14mm 12mm; display: flex; flex-direction: column; align-items: center; text-align: center; border: 2mm solid #d1943a; }
  .mark { height: 26mm; }
  .hi { margin-top: 4mm; font-size: 30pt; font-weight: 700; color: #8c1a21; line-height: 1; }
  .en { margin-top: 1mm; font-size: 14pt; font-weight: 700; letter-spacing: .06em; color: #3d5a2a; }
  .tag { margin-top: 1mm; font-size: 11pt; font-style: italic; color: #d1943a; }
  h1 { margin: 9mm 0 0; font-size: 22pt; font-weight: 400; }
  .stars { margin-top: 2mm; font-size: 20pt; letter-spacing: .15em; color: #d1943a; }
  .qr { margin-top: 6mm; width: 78mm; height: 78mm; }
  .qr svg { width: 100%; height: 100%; }
  .how { margin-top: 5mm; font: 11pt/1.4 Arial, sans-serif; color: #6f6763; }
  .how b { color: #3b0d0f; }
</style></head><body><div class="card">
  <img class="mark" src="${new URL(monogram, window.location.origin).href}" alt="">
  ${kruti ? '<div class="hi" style="font-family: Kruti; font-weight: normal; font-size: 42pt" aria-label="प्रदीप">iznhi</div>' : '<div class="hi" lang="hi">प्रदीप</div>'}
  <div class="en">JEWELLERS</div>
  <div class="tag" lang="hi">आज से, सदा के लिए</div>
  <h1>Loved your jewellery?</h1>
  <div class="stars">★★★★★</div>
  <div class="qr">${svg}</div>
  <p class="how"><b>Scan with your phone camera</b><br>and rate us on Google<br><span lang="hi">स्कैन करें और Google पर रिव्यू दें</span></p>
</div>
<script>window.onload = () => document.fonts.ready.then(() => setTimeout(() => window.print(), 300));</script>
</body></html>`);
  win.document.close();
}
