export const PLACE_ID_TO_SLUG: Record<string, string> = {
  place_pyramids_of_giza: 'pyramids-of-giza',
  place_grand_egyptian_museum: 'grand-egyptian-museum',
  place_egyptian_museum: 'egyptian-museum',
  place_talaat_harb_street: 'talaat-harb-street',
  place_khan_el_khalili: 'khan-el-khalili',
  place_al_muizz_street: 'al-muizz-street',
  place_hanging_church: 'hanging-church',
  place_ben_ezra_synagogue: 'ben-ezra-synagogue',
  place_cairo_opera_house: 'cairo-opera-house',
  place_cairo_tower: 'cairo-tower',
  place_babylon_fortress: 'babylon-fortress',
  place_nilometer: 'nilometer',
  place_karnak_temple: 'karnak-temple',
  place_valley_of_the_kings: 'valley-of-the-kings',
  place_luxor_temple: 'luxor-temple',
  place_philae_temple: 'philae-temple',
  place_abu_simbel: 'abu-simbel',
  place_aswan_felucca_islands: 'nile-felucca-sailing',
  place_citadel_of_qaitbay: 'citadel-of-qaitbay',
  place_bibliotheca_alexandrina: 'bibliotheca-alexandrina',
  place_giftun_island: 'giftun-island',
  place_blue_hole_dahab: 'blue-hole-dahab',
  place_mount_sinai: 'mount-sinai',
  place_white_desert_national_park: 'white-desert-national-park',
  place_siwa_salt_lakes: 'siwa-salt-lakes',
  place_shali_fortress: 'shali-fortress',
  // Hero deck IDs
  'giza-pyramids': 'pyramids-of-giza',
  'luxor-karnak': 'karnak-temple',
  'aswan-philae': 'philae-temple',
  'white-desert': 'white-desert-national-park',
  'siwa-salt-lakes': 'siwa-salt-lakes',
  layer_01_giza: 'pyramids-of-giza',
  layer_02_karnak: 'karnak-temple',
  layer_03_philae: 'philae-temple',
  layer_04_white_desert: 'white-desert-national-park',
  layer_last_siwa: 'siwa-salt-lakes',
};

export const PLACE_LOCAL_IMAGES: Record<string, string> = {
  'pyramids-of-giza': '/images/places/pyramids-of-giza.jpg',
  'grand-egyptian-museum': '/images/places/grand-egyptian-museum.jpg',
  'egyptian-museum': '/images/places/egyptian-museum.jpg',
  'talaat-harb-street': '/images/places/talaat-harb-street.jpg',
  'khan-el-khalili': '/images/places/khan-el-khalili.jpg',
  'al-muizz-street': '/images/places/al-muizz-street.jpg',
  'hanging-church': '/images/places/hanging-church.jpg',
  'ben-ezra-synagogue': '/images/places/ben-ezra-synagogue.jpg',
  'cairo-opera-house': '/images/places/cairo-opera-house.jpg',
  'cairo-tower': '/images/places/cairo-tower.jpg',
  'babylon-fortress': '/images/places/babylon-fortress.jpg',
  'nilometer': '/images/places/nilometer.jpg',
  'karnak-temple': '/images/places/karnak-temple.jpg',
  'valley-of-the-kings': '/images/places/valley-of-the-kings.jpg',
  'luxor-temple': '/images/places/luxor-temple.jpg',
  'philae-temple': '/images/places/philae-temple.jpg',
  'abu-simbel': '/images/places/abu-simbel.jpg',
  'nile-felucca-sailing': '/images/places/nile-felucca-sailing.jpg',
  'citadel-of-qaitbay': '/images/places/citadel-of-qaitbay.jpg',
  'bibliotheca-alexandrina': '/images/places/bibliotheca-alexandrina.jpg',
  'giftun-island': '/images/places/giftun-island.jpg',
  'blue-hole-dahab': '/images/places/blue-hole-dahab.jpg',
  'mount-sinai': '/images/places/mount-sinai.jpg',
  'white-desert-national-park': '/images/places/white-desert-national-park.jpg',
  'siwa-salt-lakes': '/images/places/siwa-salt-lakes.jpg',
  'shali-fortress': '/images/places/shali-fortress.jpg',
};

export interface PlaceImageSourceInput {
  id?: string;
  slug?: string;
}

export interface PlaceImageSources {
  primary: string;
  fallback: string;
}

/**
 * Resolves local and fallback image URLs for a given place.
 * Local bundled images in /images/places/ take precedence to guarantee instant,
 * offline, and unblocked loading across all networks.
 */
export function getPlaceImageSources(
  place?: PlaceImageSourceInput,
  remoteSrc?: string,
): PlaceImageSources {
  let resolvedSlug: string | undefined = place?.slug;

  if (!resolvedSlug && place?.id) {
    resolvedSlug = PLACE_ID_TO_SLUG[place.id];
  } else if (resolvedSlug && PLACE_ID_TO_SLUG[resolvedSlug]) {
    resolvedSlug = PLACE_ID_TO_SLUG[resolvedSlug];
  }

  const local = resolvedSlug ? PLACE_LOCAL_IMAGES[resolvedSlug] : undefined;

  if (local) {
    return {
      primary: local,
      fallback: remoteSrc || '/images/placeholder.svg',
    };
  }

  return {
    primary: remoteSrc || '/images/placeholder.svg',
    fallback: '/images/placeholder.svg',
  };
}
