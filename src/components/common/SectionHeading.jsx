// Centered serif title + light serif subtitle, the heading pattern used by
// every section in the reference.
export default function SectionHeading({ title, subtitle, tone = 'heading', as: Tag = 'h2', className = '', id }) {
  const color = tone === 'ink' ? 'text-ink' : 'text-heading';
  return (
    <div className={`text-center ${className}`} data-reveal>
      <Tag id={id} className={`t-section ${color}`}>
        {title}
      </Tag>
      {subtitle && <p className="t-subtitle mt-1">{subtitle}</p>}
    </div>
  );
}
