import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { googleReviewUrl } from '../../data/footer';

// Dark maroon on white: on brand, and still the strong contrast phone cameras need.
export const QR_COLOURS = { dark: '#3b0d0f', light: '#ffffff' };

/** A QR code (SVG) that opens the shop's Google review page. `url` defaults to the saved link. */
export default function ReviewQR({ url, className = '', label = 'QR code: scan to rate Pradeep Jewellers on Google' }) {
  const target = url ?? googleReviewUrl();
  const [svg, setSvg] = useState('');
  useEffect(() => {
    let alive = true;
    QRCode.toString(target, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: QR_COLOURS })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''));
    return () => {
      alive = false;
    };
  }, [target]);
  // The markup comes from the QR library, never from user input.
  return <span role="img" aria-label={label} className={`block [&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: svg }} />;
}
