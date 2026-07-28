'use client';

// Sibling copy lives at vendor-panel/components/brand/logo.tsx and
// customer-web/components/brand/logo.tsx — keep in sync.

import { useId, useEffect, useState } from 'react';
import styles from './logo.module.css';

type Variant = 'full' | 'wordmark' | 'mark';

interface LogoProps {
  /** full = mark + letters + stars + tagline; wordmark = mark + letters + stars; mark = G icon only */
  variant?: Variant;
  /** Play the staggered reveal animation once per browser session, then show statically. */
  animateOnFirstVisit?: boolean;
  className?: string;
  'aria-label'?: string;
}

export default function Logo({
  variant = 'wordmark',
  animateOnFirstVisit = false,
  className,
  'aria-label': ariaLabel = 'GoViaTrip',
}: LogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/:/g, '');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!animateOnFirstVisit) return;
    if (!sessionStorage.getItem('gvt-logo-revealed')) {
      setAnimated(true);
      sessionStorage.setItem('gvt-logo-revealed', '1');
    }
  }, [animateOnFirstVisit]);

  const g = (n: number) => `${uid}p${n}`;

  const viewBox =
    variant === 'full'     ? '0 0 559 257' :
    variant === 'wordmark' ? '0 0 559 210' :
                             '0 0 100 210';

  return (
    <svg
      className={[animated ? styles.animate : '', className].filter(Boolean).join(' ') || undefined}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Big orange letters — wordmark + full */}
      {variant !== 'mark' && (
        <>
          <path className="anim letter-3" d="M558.46 200.28H520.9L472.61 63.9198L423.61 200.28H386.09L455.25 8.33984H490.48L558.46 200.28Z" fill={`url(#${g(0)})`} />
          <path className="anim letter-2" d="M323.13 8.33984H359.4V200.28H323.13V8.33984Z" fill={`url(#${g(1)})`} />
          <path className="anim letter-1" d="M267 90.0999L261.19 106.21L227.3 200.28H192.06L124.09 8.33984H161.64L209.93 144.7L227.33 96.2698L233.25 79.8098C241.1 76.1198 249 72.3799 256.87 68.6599C260.23 75.7598 263.61 82.9199 267 90.0999Z" fill={`url(#${g(2)})`} />
        </>
      )}

      {/* Bottom tagline — full only */}
      {variant === 'full' && (
        <g className="tagline">
          <path d="M87.09 255.6V236.26H77.05V231.66H102.49V236.26H92.45V255.6H87.09Z" fill={`url(#${g(3)})`} />
          <path d="M145.6 255.6L131.6 246.9V255.6H126.3V231.66H145.04C151.74 231.66 154.48 233.1 154.48 238.85V240.5C154.48 246.04 151.5 247.48 144.97 247.48H140.76L154.8 255.59H145.6V255.6ZM149.14 239.14C149.14 236.58 148.19 236.16 144.68 236.16H131.59V243.46H144.68C148.12 243.46 149.14 243.04 149.14 240.44V239.14Z" fill={`url(#${g(4)})`} />
          <path d="M179.29 255.6V231.66H184.62V255.59H179.29V255.6Z" fill={`url(#${g(5)})`} />
          <path d="M215.23 248.75V255.59H209.9V231.66H229.06C235.9 231.66 238.04 233.73 238.04 239.38V241.45C238.04 247.17 236.04 248.75 229.06 248.75H215.23ZM232.71 239.59C232.71 236.99 231.8 236.26 228.92 236.26H215.23V244.44H228.99C231.8 244.44 232.71 243.77 232.71 241.25V239.59Z" fill={`url(#${g(6)})`} />
          <path d="M261.74 255.6V251.07H279.92C281.82 251.07 282.62 250.65 282.62 249.03V247.73C282.62 246.22 281.81 245.66 279.95 245.66H268.54C263.17 245.66 261.77 243.69 261.77 239.59V238.4C261.77 233.49 263.74 231.66 268.54 231.66H275.98V236.19H269.03C267.42 236.19 266.64 236.68 266.64 238.58V239.35C266.64 240.86 267.27 241.42 268.99 241.42H280.19C285.52 241.42 287.49 243.17 287.49 247.49V249.38C287.49 253.84 285.52 255.59 280.19 255.59H261.74V255.6Z" fill={`url(#${g(7)})`} />
          <path d="M313.33 255.6C312.03 255.6 311.54 255.14 311.54 254.02V251.14C311.54 250.05 312.03 249.56 313.33 249.56H315.05C316.38 249.56 316.87 250.05 316.87 251.14V254.02C316.87 255.14 316.38 255.6 315.05 255.6H313.33Z" fill={`url(#${g(8)})`} />
          <path d="M350.32 255.6C343.27 255.6 341.2 253.42 341.2 247.39V239.88C341.2 233.84 343.27 231.67 350.32 231.67H366.92V236.27H350.57C347.31 236.27 346.5 237.22 346.5 240.17V247.19C346.5 250.17 347.31 251.05 350.61 251.05H366.93V255.61H350.32V255.6Z" fill={`url(#${g(9)})`} />
          <path d="M400.37 255.6C393.32 255.6 391.24 253.42 391.24 247.39V239.88C391.24 233.84 393.31 231.67 400.37 231.67H409.46C416.55 231.67 418.62 233.85 418.62 239.88V247.39C418.62 253.43 416.55 255.6 409.46 255.6H400.37ZM413.28 240.12C413.28 237.14 412.37 236.26 409.24 236.26H400.61C397.24 236.26 396.54 237.14 396.54 240.12V247.17C396.54 250.29 397.24 251.03 400.61 251.03H409.24C412.36 251.03 413.28 250.29 413.28 247.17V240.12Z" fill={`url(#${g(10)})`} />
          <path d="M476.49 255.6V239.84L464.8 255.11C464.24 255.81 463.5 256.13 462.45 256.13C461.4 256.13 460.66 255.81 460.1 255.11L448.45 239.84V255.6H443.61V233.31C443.61 231.8 444.84 231.13 446.49 231.13C447.75 231.13 448.42 231.45 449.02 232.25L462.53 250.18L476.15 232.25C476.75 231.48 477.31 231.13 478.54 231.13C480.15 231.13 481.42 231.8 481.42 233.31V255.6H476.49Z" fill={`url(#${g(11)})`} />
        </g>
      )}

      {/* G mark — always rendered */}
      <path className="anim mark-inner" d="M17.76 116.94L30.27 129.58C21.81 137.58 17.57 146.91 17.57 157.56C17.57 166.85 20.65 174.62 26.8 180.89C32.96 187.16 40.44 190.29 49.25 190.29C58.36 190.29 66.07 187.04 72.4 180.53C78.73 174.02 81.89 166 81.89 156.46C81.89 150.25 80.59 145.02 77.98 140.76C75.37 136.5 71.29 133.07 65.73 130.46V157.78H48.86V110.33L52.84 110.2C61.09 110.2 68.92 112.34 76.31 116.61C83.71 120.89 89.35 126.42 93.24 133.22C97.13 140.02 99.08 147.99 99.08 157.14C99.08 166.93 96.95 175.66 92.7 183.34C88.45 191.01 82.39 197.09 74.52 201.55C66.65 206.02 58.17 208.25 49.06 208.25C36.58 208.25 25.72 204.12 16.48 195.87C5.49 186.08 0 173.34 0 157.65C0 149.44 1.52 141.77 4.55 134.63C7.12 128.61 11.52 122.72 17.76 116.94Z" fill={`url(#${g(12)})`} />
      <path className="anim mark-outer" d="M0 49.1901C0 35.8401 4.82999 24.3701 14.49 14.7601C24.15 5.1601 35.93 0.350098 49.82 0.350098C63.59 0.350098 75.24 5.09009 84.77 14.5601C94.3 24.0401 99.07 35.5301 99.07 49.0501C99.07 63.2101 94.18 74.9701 84.39 84.3401C74.6 93.7101 62.97 98.3901 49.5 98.3901C40.48 98.3901 32.19 96.2101 24.62 91.8401C17.05 87.4801 11.06 81.4801 6.62999 73.8401C2.20999 66.2301 0 58.0101 0 49.1901ZM17.57 49.3801C17.57 58.1101 20.61 65.4501 26.68 71.4001C32.75 77.3501 40.47 80.3201 49.83 80.3201C60.26 80.3201 68.51 76.5801 74.58 69.0901C79.33 63.2701 81.7 56.5901 81.7 49.0601C81.7 40.5401 78.62 33.2901 72.47 27.3001C66.31 21.3101 58.73 18.3101 49.7 18.3101C40.72 18.3101 33.12 21.3301 26.9 27.3601C20.68 33.4001 17.57 40.7401 17.57 49.3801Z" fill={`url(#${g(13)})`} />

      {/* Decorative star bits — wordmark + full */}
      {variant !== 'mark' && (
        <>
          <path className="anim deco-1" d="M279.36 55.7499C279.36 55.7499 279.36 55.7499 279.36 55.7799L273.44 72.2399C270.08 65.0799 266.7 57.8699 263.25 50.5199C255.32 54.2599 247.5 57.9499 239.79 61.5899L245.65 45.2399C253.5 41.5499 261.34 37.8599 269.16 34.1499C272.56 41.3199 275.95 48.5299 279.36 55.7499Z" fill={`url(#${g(14)})`} />
          <path className="anim deco-2" d="M297.94 34.96C294.44 36.61 290.75 38.35 286.96 40.14C286.6 39.34 286.22 38.57 285.86 37.77C282.53 30.61 279.14 23.43 275.78 16.24C267.74 20.04 259.84 23.78 252.05 27.5C251.94 27.56 251.86 27.58 251.75 27.64C249.93 23.7 248.2 20.01 246.55 16.49C250.32 14.7 254.15 12.91 257.95 11.12C259.9 10.18 261.86 9.25 263.81 8.34C269.7 5.56 275.59 2.75 281.46 0C282.75 2.75 284.08 5.53 285.4 8.34C287.49 12.75 289.58 17.18 291.68 21.64C293.76 26.07 295.85 30.53 297.94 34.96Z" fill={`url(#${g(15)})`} />
        </>
      )}

      <defs>
        <linearGradient id={g(0)}  x1="82.298"   y1="-86.9445" x2="603.149" y2="192.885"  gradientUnits="userSpaceOnUse"><stop stopColor="#F47D1F"/><stop offset="1" stopColor="#F93A1D"/></linearGradient>
        <linearGradient id={g(1)}  x1="60.5676"  y1="-46.4977" x2="581.418" y2="233.331"  gradientUnits="userSpaceOnUse"><stop stopColor="#F47D1F"/><stop offset="1" stopColor="#F93A1D"/></linearGradient>
        <linearGradient id={g(2)}  x1="23.74"    y1="22.0494"  x2="544.592" y2="301.879"  gradientUnits="userSpaceOnUse"><stop stopColor="#F47D1F"/><stop offset="1" stopColor="#F93A1D"/></linearGradient>
        <linearGradient id={g(3)}  x1="75.655"   y1="243.629"  x2="514.175" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(4)}  x1="75.6552"  y1="243.629"  x2="514.175" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(5)}  x1="75.6533"  y1="243.629"  x2="514.18"  y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(6)}  x1="75.6554"  y1="243.629"  x2="514.175" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(7)}  x1="75.6548"  y1="243.629"  x2="514.175" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(8)}  x1="75.6562"  y1="252.579"  x2="514.174" y2="252.579"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(9)}  x1="75.6555"  y1="243.629"  x2="514.176" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(10)} x1="75.6545"  y1="243.629"  x2="514.176" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(11)} x1="75.6544"  y1="243.629"  x2="514.173" y2="243.629"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(12)} x1="-49.5137" y1="59.1963"  x2="91.6801"  y2="200.39"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(13)} x1="4.982"    y1="4.7005"   x2="146.176"  y2="145.894" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(14)} x1="212.326"  y1="5.69671"  x2="277.697"  y2="71.0674"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
        <linearGradient id={g(15)} x1="235.404"  y1="-17.3807" x2="300.774"  y2="47.9898"  gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#006DC4"/><stop offset="1" stopColor="#00CFC4"/></linearGradient>
      </defs>
    </svg>
  );
}
