/**
 * Display photos for stays, keyed by accommodation id.
 * These only replace the picture shown on the card. Catalog data is untouched.
 * Sources and licences: public/images/stay/hotels/CREDITS.md
 */
export const STAY_IMAGES: Record<string, { src: string; pos?: string }> = {
  stay_grand_citadel_retreat: { src: '/images/stay/hotels/grand-citadel.jpg', pos: '50% 60%' },
  stay_nile_breeze_residency: { src: '/images/stay/hotels/nile-breeze.jpg', pos: '50% 55%' },
  stay_midan_heritage_house: { src: '/images/stay/hotels/midan-heritage.jpg', pos: '50% 40%' },
  stay_pyramid_horizon_villa: { src: '/images/stay/hotels/pyramid-horizon.jpg', pos: '50% 45%' },
  stay_old_cairo_haven: { src: '/images/stay/hotels/old-cairo.jpg', pos: '50% 50%' },
  stay_lotus_oasis_hostel: { src: '/images/stay/hotels/lotus-oasis.jpg', pos: '50% 55%' },
  stay_babylon_courtyard_inn: { src: '/images/stay/hotels/babylon.jpg', pos: '50% 45%' },
  stay_lantern_quarters: { src: '/images/stay/hotels/lantern.jpg', pos: '50% 60%' },
  stay_luxor_palace_heritage: { src: '/images/stay/hotels/luxor.jpg', pos: '50% 50%' },
  stay_nubian_lotus_ecolodge: { src: '/images/stay/hotels/nubian.jpg', pos: '50% 45%' },
  stay_red_sea_coral_sanctuary: { src: '/images/stay/hotels/red-sea.jpg', pos: '50% 55%' },
  stay_siwa_salt_oasis_lodge: { src: '/images/stay/hotels/siwa.jpg', pos: '50% 55%' },
};
