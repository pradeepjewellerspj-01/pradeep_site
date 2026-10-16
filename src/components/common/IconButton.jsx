export default function IconButton({ label, onClick, children, badge, showZero = false, className = '', ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative inline-flex size-9 items-center sm:size-10 justify-center rounded-full text-ink transition-colors duration-300 hover:bg-blush hover:text-primary ${className}`}
      {...rest}
    >
      {children}
      {(badge > 0 || (showZero && badge === 0)) && (
        <span className="absolute right-1 top-1 inline-flex min-w-[15px] items-center justify-center rounded-full bg-primary px-[3px] text-[9px] font-semibold leading-[15px] text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
