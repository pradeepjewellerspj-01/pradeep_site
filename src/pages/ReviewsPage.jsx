import { Link } from 'react-router-dom';
import { ChevronRight, Store } from 'lucide-react';
import { GoogleIcon } from '../components/common/BrandIcons';
import WhatsAppEnquiry from '../components/jewellery/WhatsAppEnquiry';
import ReviewQR from '../components/common/ReviewQR';
import { averageRating, reviews } from '../data/reviews';
import { googleReviewUrl } from '../data/footer';
import { useContentVersion } from '../content/useContentVersion';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const longDate = (iso) => new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/** Five stars, filled up to `value` (fractions fill part of a star). */
function Stars({ value, className = 'size-4' }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${Math.round(value * 10) / 10} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <defs>
              <linearGradient id={`star-${i}-${fill}`}>
                <stop offset={fill} stopColor="var(--color-gold)" />
                <stop offset={fill} stopColor="var(--color-border-strong)" />
              </linearGradient>
            </defs>
            <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9Z" fill={`url(#star-${i}-${fill})`} />
          </svg>
        );
      })}
    </span>
  );
}

function WriteReview({ className = '' }) {
  return (
    <a
      href={googleReviewUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3 font-sans text-[14px] font-medium text-white transition-colors hover:bg-primary-dark ${className}`}
    >
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-white">
        <GoogleIcon className="size-4" />
      </span>
      Write a review on Google
    </a>
  );
}

export default function ReviewsPage() {
  useContentVersion(); // reviews added in the admin panel arrive live
  useDocumentTitle('Customer Reviews');
  const average = averageRating();
  const counts = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: reviews.filter((r) => r.rating === stars).length }));

  return (
    <div className="container-x pb-24 pt-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-sans text-xs text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-ink">Customer Reviews</span>
      </nav>

      <header className="mt-8 grid gap-8 rounded-card bg-cream p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="t-eyebrow text-gold-deep">Since 1981 in Bhilai</p>
          <h1 className="t-section mt-2 text-heading">What our customers say</h1>
          <p className="mt-3 max-w-xl font-sans text-[15px] leading-relaxed text-text">
            Bought from us or visited the showroom? Your review helps other families choose with confidence, and helps us keep getting better.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <WriteReview />
            {/* On a computer, the QR lets visitors review from their phone, where they are signed in to Google. */}
            <div className="hidden items-center gap-3 rounded-card bg-white p-2.5 pr-4 sm:flex">
              <ReviewQR className="size-24" />
              <p className="max-w-[130px] font-sans text-[12.5px] leading-snug text-muted">
                Or scan with your phone camera to rate us on Google
              </p>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="rounded-card bg-white p-6 md:w-[300px]">
            <p className="flex items-baseline gap-2">
              <span className="font-serif text-5xl font-light text-heading">{average.toFixed(1)}</span>
              <span className="font-sans text-sm text-muted">out of 5</span>
            </p>
            <Stars value={average} className="mt-2 size-5" />
            <p className="mt-1 font-sans text-[13px] text-muted">
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
            <ul className="mt-4 space-y-1.5">
              {counts.map(({ stars, count }) => (
                <li key={stars} className="flex items-center gap-2.5 font-sans text-[12px] text-muted">
                  <span className="w-3 tabular-nums">{stars}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                    <span className="block h-full rounded-full bg-gold" style={{ width: `${(count / reviews.length) * 100}%` }} />
                  </span>
                  <span className="w-6 text-right tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {reviews.length > 0 ? (
        <ul className="mt-10 columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map((r, i) => (
            <li key={`${r.name}-${r.date}-${i}`} className="mb-5 break-inside-avoid rounded-card border border-border bg-white p-5">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-blush font-serif text-lg text-primary">
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-sans text-[14px] font-medium text-ink">{r.name}</p>
                  <p className="flex items-center gap-1.5 font-sans text-[12px] text-subtle">
                    {r.source === 'google' ? <GoogleIcon className="size-3.5" /> : <Store className="size-3.5" strokeWidth={1.5} aria-hidden="true" />}
                    {r.source === 'google' ? 'Google review' : 'In the showroom'}
                    {r.date && (
                      <>
                        {' · '}
                        <time dateTime={r.date}>{longDate(r.date)}</time>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <Stars value={r.rating} className="mt-3 size-4" />
              {r.text && <p className="mt-2 whitespace-pre-line font-sans text-[14px] leading-relaxed text-text">{r.text}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center font-sans text-[15px] text-muted">Be the first to share your experience with Pradeep Jewellers.</p>
      )}

      <div className="mt-14 flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
        <p className="font-serif text-xl text-heading">Loved your jewellery?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <WriteReview />
          <WhatsAppEnquiry products={[]} variant="outline" label="Chat with us on WhatsApp" />
        </div>
      </div>
    </div>
  );
}
