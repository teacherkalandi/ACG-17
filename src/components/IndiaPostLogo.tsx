import { useState } from 'react';

interface IndiaPostLogoProps {
  variant: 'header' | 'form';
}

const INDIA_POST_LOGO_URL = 'https://static.cdnlogo.com/logos/i/46/india-post_thumb.png';

export function IndiaPostLogo({ variant }: IndiaPostLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (variant === 'header') {
    if (!imgFailed) {
      return (
        <img
          src={INDIA_POST_LOGO_URL}
          alt="India Post"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      );
    }

    return (
      <svg
        viewBox="0 0 220 175"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="India Post Logo"
      >
        <text x="32" y="28" fontFamily="serif" fontSize="22" fontWeight="bold" fill="#D71920">
          भारतीय डाक
        </text>
        <text x="33" y="45" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#D71920">
          डाक सेवा-जन सेवा
        </text>
        <rect x="32" y="54" width="136" height="74" fill="#D71920" />
        <path
          d="M2 78 Q 48 66, 74 96 T 142 86 Q 178 60, 218 38 Q 176 68, 140 96 T 68 106 Q 42 80, 2 78 Z"
          fill="#FFCC00"
        />
        <path
          d="M24 72 Q 56 66, 78 90 T 142 80 Q 174 56, 204 38 Q 170 64, 138 88 T 72 98 Q 50 76, 24 72 Z"
          fill="#FFCC00"
        />
        <path
          d="M44 68 Q 66 66, 84 85 T 140 74 Q 168 54, 188 40 Q 162 60, 136 80 T 78 90 Q 60 72, 44 68 Z"
          fill="#FFCC00"
        />
        <text
          x="86"
          y="148"
          fontFamily="Times New Roman, serif"
          fontSize="22"
          fontWeight="bold"
          fill="#D71920"
        >
          India Post
        </text>
        <text
          x="86"
          y="164"
          fontFamily="Times New Roman, serif"
          fontSize="12"
          fontWeight="bold"
          fill="#D71920"
        >
          Dak Sewa-Jan Sewa
        </text>
      </svg>
    );
  }

  if (!imgFailed) {
    return (
      <img
        src={INDIA_POST_LOGO_URL}
        alt="India Post"
        referrerPolicy="no-referrer"
        className="india-post-logo-img"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 220 175"
      className="india-post-logo-img"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="India Post Logo"
    >
      <text
        x="32"
        y="28"
        fontFamily="Times New Roman, serif"
        fontSize="21"
        fontWeight="bold"
        fill="#D71920"
      >
        भारतीय डाक
      </text>
      <text
        x="33"
        y="45"
        fontFamily="Times New Roman, serif"
        fontSize="12.5"
        fontWeight="bold"
        fill="#D71920"
      >
        डाक सेवा-जन सेवा
      </text>
      <rect x="32" y="54" width="136" height="74" fill="#D71920" />
      <path
        d="M2 78 Q 48 66, 74 96 T 142 86 Q 178 60, 218 38 Q 176 68, 140 96 T 68 106 Q 42 80, 2 78 Z"
        fill="#FFCC00"
      />
      <path
        d="M24 72 Q 56 66, 78 90 T 142 80 Q 174 56, 204 38 Q 170 64, 138 88 T 72 98 Q 50 76, 24 72 Z"
        fill="#FFCC00"
      />
      <path
        d="M44 68 Q 66 66, 84 85 T 140 74 Q 168 54, 188 40 Q 162 60, 136 80 T 78 90 Q 60 72, 44 68 Z"
        fill="#FFCC00"
      />
      <text
        x="86"
        y="148"
        fontFamily="Times New Roman, serif"
        fontSize="21"
        fontWeight="bold"
        fill="#D71920"
      >
        India Post
      </text>
      <text
        x="86"
        y="164"
        fontFamily="Times New Roman, serif"
        fontSize="11.5"
        fontWeight="bold"
        fill="#D71920"
      >
        Dak Sewa-Jan Sewa
      </text>
    </svg>
  );
}
