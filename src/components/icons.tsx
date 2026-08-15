type IconProps = {
  className?: string;
};

export function CartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 7H7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Cesta de compras no estilo da referência dos cards. */
export function BasketIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 9.5h15l-1.4 8.2a1.8 1.8 0 0 1-1.8 1.5H7.7a1.8 1.8 0 0 1-1.8-1.5L4.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 9.5 10 4.8h4l1.8 4.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13v3.5M12 13v3.5M15 13v3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 18.5 4 21l3-1.2A9 9 0 1 0 5 18.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3 5 6v5c0 4.5 2.9 7.8 7 9 4.1-1.2 7-4.5 7-9V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 12 1.8 1.8L15 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.5 12.5 2.2 2.2L15.5 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M13 2 4 14h7l-1 8 10-12h-7l0-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DiscordIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.27 5.33A16.4 16.4 0 0 0 15.2 4.2a.08.08 0 0 0-.08.04c-.18.32-.38.74-.52 1.07a15.1 15.1 0 0 0-4.2 0A9.6 9.6 0 0 0 9.88 4.24a.08.08 0 0 0-.08-.04 16.35 16.35 0 0 0-4.07 1.13.07.07 0 0 0-.03.03C2.98 9.12 2.22 12.8 2.6 16.43a.09.09 0 0 0 .03.06 16.5 16.5 0 0 0 4.97 2.5.08.08 0 0 0 .09-.03c.38-.52.72-1.07 1.02-1.65a.08.08 0 0 0-.04-.11 10.9 10.9 0 0 1-1.56-.74.08.08 0 0 1-.01-.13c.1-.08.21-.16.31-.24a.08.08 0 0 1 .08-.01c3.28 1.5 6.84 1.5 10.08 0a.08.08 0 0 1 .09.01c.1.08.2.16.31.24a.08.08 0 0 1 0 .13 10.2 10.2 0 0 1-1.56.74.08.08 0 0 0-.04.11c.3.58.64 1.13 1.01 1.65a.08.08 0 0 0 .09.03 16.45 16.45 0 0 0 5-2.5.08.08 0 0 0 .03-.06c.45-4.2-.76-7.85-3.21-11.07a.06.06 0 0 0-.03-.03ZM9.1 14.52c-.99 0-1.8-.9-1.8-2.02s.8-2.02 1.8-2.02 1.81.91 1.8 2.02-.8 2.02-1.8 2.02Zm5.8 0c-.99 0-1.8-.9-1.8-2.02s.8-2.02 1.8-2.02 1.81.91 1.8 2.02-.81 2.02-1.8 2.02Z" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5.5 19.2c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InvoiceIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v14.2l-2.2-1.2-2.3 1.2-2-1.2-2 1.2-2.3-1.2L5.5 19.2V5A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 9h6M9 12.5h6M9 16h3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 8.5h11l-.9 10.2a1.6 1.6 0 0 1-1.6 1.4H9a1.6 1.6 0 0 1-1.6-1.4L6.5 8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5V7a3 3 0 0 1 6 0v1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 8.5 18.5 12 14 15.5M18.5 12H9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m7 10 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8A6.3 6.3 0 1 1 12 5.7c1.8 0 3 .7 3.7 1.4l2.5-2.4A10.1 10.1 0 0 0 12 2a10 10 0 1 0 0 20c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.7H12Z"
      />
      <path
        fill="#34A853"
        d="M3.2 7.4 6.4 9.8A6.3 6.3 0 0 0 12 18c1.6 0 2.9-.5 3.9-1.4l3.1 2.4A10 10 0 0 1 2 12c0-1.6.4-3.1 1.2-4.6Z"
      />
      <path
        fill="#4285F4"
        d="M12 4c1.9 0 3.6.7 4.9 1.9l2.7-2.7A10 10 0 0 0 2 12c0 1.6.4 3.1 1.2 4.6l3.2-2.4A6.3 6.3 0 0 1 12 5.7V4Z"
      />
      <path
        fill="#FBBC05"
        d="M12 22a9.9 9.9 0 0 0 7-2.8l-3.1-2.4A5.9 5.9 0 0 1 12 18a6.3 6.3 0 0 1-5.6-3.6L3.2 16.6A10 10 0 0 0 12 22Z"
      />
    </svg>
  );
}
