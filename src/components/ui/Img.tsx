import { useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

/**
 * Image with a graceful failure state.
 *
 * A template gets re-skinned, and the first thing people do is replace the
 * pictures. If one is missing, renamed, or still being written, this renders a
 * calm gradient tile with the file name instead of the browser's broken-image
 * glyph.
 */
export function Img({ src, alt, className = '', style, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const label = typeof src === 'string' ? src.split('/').pop() : 'image';
    return (
      <span
        className={`grid place-items-center overflow-hidden ${className}`}
        style={{
          ...style,
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--os-accent) 26%, transparent), color-mix(in srgb, #a35bd4 18%, transparent) 60%, transparent)',
          border: '1px dashed var(--os-border-strong)',
          minHeight: 56,
        }}
        role="img"
        aria-label={alt ?? 'Image unavailable'}
      >
        <span className="text-[10.5px] px-2 text-center leading-tight" style={{ color: 'var(--os-text-muted)' }}>
          {label}
          <br />
          add this file to /public/images
        </span>
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
