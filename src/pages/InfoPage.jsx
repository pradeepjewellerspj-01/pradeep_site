import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { contact } from '../data/footer';
import { legalPages } from '../data/legal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const ACRONYMS = { faqs: 'FAQs' };

const toTitle = (slug) =>
  slug
    .split('-')
    .map((w) => (w === 'and' ? '&' : (ACRONYMS[w] ?? w.charAt(0).toUpperCase() + w.slice(1))))
    .join(' ');

const longDate = (iso) =>
  new Date(`${iso}T12:00:00+05:30`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

function LegalPage({ page }) {
  return (
    <div className="container-x max-w-3xl pb-24 pt-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-sans text-xs text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-ink">{page.title}</span>
      </nav>
      <h1 className="t-section mt-8 text-heading">{page.title}</h1>
      <p className="mt-2 font-sans text-[12px] uppercase tracking-[0.18em] text-subtle">
        Last updated <time dateTime={page.updated}>{longDate(page.updated)}</time>
      </p>
      <p className="mt-6 font-sans text-[15px] leading-relaxed text-text">{page.intro}</p>

      <nav aria-label="On this page" className="mt-8 rounded-card bg-cream p-5">
        <p className="font-sans text-[10.5px] uppercase tracking-[0.2em] text-muted">On this page</p>
        <ol className="mt-3 grid gap-x-6 gap-y-1.5 font-sans text-[13.5px] sm:grid-cols-2">
          {page.sections.map((s, i) => (
            <li key={s.heading}>
              <a href={`#s-${i + 1}`} className="text-text hover:text-primary">
                {i + 1}. {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-9">
        {page.sections.map((s, i) => (
          <section key={s.heading} id={`s-${i + 1}`} aria-labelledby={`s-${i + 1}-h`} className="scroll-mt-28">
            <h2 id={`s-${i + 1}-h`} className="font-serif text-xl font-light text-heading">
              {i + 1}. {s.heading}
            </h2>
            <div className="mt-3 space-y-3 font-sans text-[15px] leading-relaxed text-text">
              {s.p?.map((t) => (
                <p key={t}>{t}</p>
              ))}
              {s.list && (
                <ul className="list-disc space-y-2 pl-5 marker:text-gold-deep">
                  {s.list.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              {s.after?.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function InfoPage() {
  const { slug = '' } = useParams();
  const page = legalPages[slug];
  const title = page?.title ?? toTitle(slug);
  useDocumentTitle(title);
  if (page) return <LegalPage page={page} />;
  // Placeholder for pages whose copy has not been supplied yet.
  return (
    <div className="container-x max-w-3xl pb-24 pt-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 font-sans text-xs text-muted">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-ink">{title}</span>
      </nav>
      <h1 className="t-section mt-8 text-heading">{title}</h1>
      <div className="mt-6 space-y-4 font-sans text-[15px] leading-relaxed text-text">
        <p>This page will hold Pradeep Jewellers’ official {title.toLowerCase()} information. The content is being prepared and will be published here shortly.</p>
        <p>
          In the meantime, our showroom team is happy to help on{' '}
          <a className="text-primary underline" href={`tel:${contact.phoneTel}`}>
            {contact.phone}
          </a>{' '}
          or on{' '}
          <a className="text-primary underline" href={contact.whatsappLink} target="_blank" rel="noopener noreferrer">
            WhatsApp {contact.whatsapp}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
