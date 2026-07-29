'use client';

import { MapPin } from 'lucide-react';

// Decorative, non-interactive travel-themed animated backdrop for the auth screen.
// A slow crossfading slideshow of real travel photos (with a subtle Ken Burns zoom)
// sits under a brand-tinted scrim, with an animated flight route + plane + pins on
// top. Styles live in globals.css under the `tab-` prefix; the scrim/route/pins are
// built on the brand CSS-var tokens so white-label overrides retint them. Honors
// prefers-reduced-motion. aria-hidden — it carries no information.
const STARS = [
  { x: '12%', y: '18%', d: '0s' },   { x: '22%', y: '32%', d: '1.4s' },
  { x: '34%', y: '12%', d: '2.1s' }, { x: '46%', y: '24%', d: '0.7s' },
  { x: '58%', y: '14%', d: '1.9s' }, { x: '69%', y: '28%', d: '2.6s' },
  { x: '78%', y: '16%', d: '0.4s' }, { x: '88%', y: '30%', d: '1.1s' },
  { x: '16%', y: '46%', d: '2.3s' }, { x: '83%', y: '46%', d: '3.0s' },
  { x: '7%',  y: '62%', d: '1.6s' }, { x: '92%', y: '60%', d: '0.9s' },
];

// Scenic travel photos (known-good Unsplash IDs, also used in the app's seed data).
// Swap freely. SLIDE = how long each photo is shown before it crossfades to the next
// (raise it for a slower, minutes-long rotation).
const PHOTOS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&auto=format&fit=crop', // turquoise beach
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&q=80&auto=format&fit=crop', // misty mountains
  'https://images.unsplash.com/photo-1530866926933-f46ba6f8e1bb?w=1920&q=80&auto=format&fit=crop', // jungle river
  'https://images.unsplash.com/photo-1451337516015-6b6bb9d83a26?w=1920&q=80&auto=format&fit=crop', // desert dunes
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80&auto=format&fit=crop',    // historic city
];
const SLIDE = 20; // seconds per photo (keep in sync with the 20% window in @keyframes tab-ken)

export default function TravelAuthBackground() {
  const cycle = SLIDE * PHOTOS.length;
  return (
    <div aria-hidden="true" className="tab-root">
      <div className="tab-photos">
        {PHOTOS.map((url, i) => (
          <div
            key={i}
            className="tab-photo"
            style={{
              backgroundImage: `url(${url})`,
              animationDuration: `${cycle}s`,
              animationDelay: `${-i * SLIDE}s`,
            }}
          />
        ))}
      </div>
      <div className="tab-scrim" />

      <div className="tab-stars">
        {STARS.map((s, i) => (
          <span key={i} className="tab-star" style={{ left: s.x, top: s.y, animationDelay: s.d }} />
        ))}
      </div>

      <svg className="tab-scene" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
        {/* the flight route draws itself, then a plane follows the same curve (see globals.css) */}
        <path className="tab-route" d="M110 560 Q 600 90 1090 430" />
        <g className="tab-endpoint tab-endpoint--a" transform="translate(110 560)">
          <circle r="9" /><circle className="tab-ping" r="9" />
        </g>
        <g className="tab-endpoint tab-endpoint--b" transform="translate(1090 430)">
          <circle r="9" /><circle className="tab-ping" r="9" />
        </g>
        <g className="tab-plane">
          <g transform="scale(1.7) translate(-12 -12)">
            {/* paper-plane silhouette pointing along the path */}
            <path d="M2 3 L23 12 L2 21 L7 12 Z" />
          </g>
        </g>
      </svg>

      {/* floating destination pins */}
      <div className="tab-pin tab-pin--1"><MapPin strokeWidth={2.2} /></div>
      <div className="tab-pin tab-pin--2"><MapPin strokeWidth={2.2} /></div>
    </div>
  );
}
