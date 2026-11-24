import { useState } from 'react';
import { cn } from '../../lib/cn';

const imageMapping: Record<string, string> = {
  place_pyramids_of_giza: 'pyramids-of-giza.jpg',
  place_grand_egyptian_museum: 'grand-egyptian-museum.jpg',
  place_egyptian_museum: 'egyptian-museum.jpg',
  place_talaat_harb_street: 'talaat-harb-street.jpg',
  place_khan_el_khalili: 'khan-el-khalili.jpg',
};

export interface ResponsiveImageProps {
  /** Identifier matching the key in imageMapping */
  placeId?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Additional Tailwind or CSS classes */
  className?: string;
  /** Optional explicit src override (e.g., external URL) */
  srcOverride?: string;
}

/**
 * Reusable image component that attempts to load a local image based on the
 * mapping file. If the file does not exist or the load fails, it falls back to a
 * provided external URL (srcOverride) and finally to a neutral placeholder.
 */
export default function ResponsiveImage({
  placeId,
  alt,
  className,
  srcOverride,
}: ResponsiveImageProps) {
  const [hasError, setHasError] = useState(false);

  const localFileName = placeId ? imageMapping[placeId] : undefined;
  const localPath = localFileName ? `/images/${localFileName}` : null;

  // Choose source: try srcOverride first, then local, then placeholder
  const src = srcOverride ? (hasError ? '/images/placeholder.svg' : srcOverride) : (localPath && !hasError ? localPath : '/images/placeholder.svg');


  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      if (import.meta.env.DEV && placeId) {
        console.warn(`[ResponsiveImage] Failed to load image for "${placeId}". Falling back to ${srcOverride ? 'external URL' : 'placeholder'}.'`);
      }
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-cover w-full h-full', className)}
      onError={handleError}
    />
  );
}
