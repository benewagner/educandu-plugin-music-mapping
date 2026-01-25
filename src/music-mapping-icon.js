import React from 'react';
import iconNs from '@ant-design/icons';

const Icon = iconNs.default || iconNs;

export function MusicMappingIconComponent() {
  return (
    <svg height="1em" style={{ enableBackground: 'new 0 0 1000 1000' }} width="1em" viewBox="0 0 1000 1000">
      {/* Left card */}
      <rect
        x="40"
        y="80"
        width="340"
        height="400"
        rx="25"
        ry="25"
        style={{
          fill: '#f2f2f2',
          stroke: '#666',
          strokeWidth: '40',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: '10'
        }}
        />
      {/* Musical note on left card */}
      <ellipse
        cx="210"
        cy="350"
        rx="65"
        ry="48"
        style={{ fill: '#666' }}
        transform="rotate(-20, 210, 350)"
        />
      <path
        style={{
          fill: 'none',
          stroke: '#666',
          strokeWidth: '28',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        d="M260 338 L260 185"
        />
      <path
        style={{
          fill: '#666',
          stroke: '#666',
          strokeWidth: '10',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        d="M260 185 Q305 198 320 250 Q300 222 260 215 Z"
        />
      {/* Right card */}
      <rect
        x="620"
        y="520"
        width="340"
        height="400"
        rx="25"
        ry="25"
        style={{
          fill: '#f2f2f2',
          stroke: '#666',
          strokeWidth: '40',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: '10'
        }}
        />
      {/* Musical note on right card */}
      <ellipse
        cx="790"
        cy="790"
        rx="65"
        ry="48"
        style={{ fill: '#666' }}
        transform="rotate(-20, 790, 790)"
        />
      <path
        style={{
          fill: 'none',
          stroke: '#666',
          strokeWidth: '28',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        d="M840 778 L840 625"
        />
      <path
        style={{
          fill: '#666',
          stroke: '#666',
          strokeWidth: '10',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        d="M840 625 Q885 638 900 690 Q880 662 840 655 Z"
        />
      {/* Connection arrow */}
      <path
        style={{
          fill: 'none',
          stroke: '#666',
          strokeWidth: '35',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeMiterlimit: '10'
        }}
        d="M380 320 Q500 320 500 500 Q500 680 620 680"
        />
      {/* Arrow head */}
      <path
        style={{
          fill: '#666',
          stroke: '#666',
          strokeWidth: '20',
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }}
        d="M580 640 L620 680 L580 720"
        />
    </svg>
  );
}

function MusicMappingIcon() {
  return (
    <Icon component={MusicMappingIconComponent} />
  );
}

export default MusicMappingIcon;
