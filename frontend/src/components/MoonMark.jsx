export default function MoonMark({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M20 4.5C13.5 6 9 11.6 9 18c0 6.4 4.7 11.7 10.8 12.4-1.3.4-2.6.6-4 .6C7.7 31 2 25.3 2 18.2S7.7 5.4 15.8 5.4c1.4 0 2.8.2 4.2.6z"
        fill="currentColor"
      />
      <circle cx="24" cy="9" r="1.4" fill="currentColor" opacity="0.7" />
      <circle cx="27" cy="14" r="0.9" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="14.5" r="0.6" fill="currentColor" opacity="0.4" />
    </svg>
  )
}
