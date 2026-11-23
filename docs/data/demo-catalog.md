# Demo Catalog (Accommodation & Transportation)

> This document registers all fictional demo catalog records created for Phase 8 (Stay & Transport).
> All records listed below are **completely fictional**. They do not represent real companies, hotels, hostels, or fleets.

---

## 1. Fictional Accommodation Catalog

All records have `isDemo: true`. External URLs point to the reserved `https://example.com` domain. Coordinates are plausible demo points within Greater Cairo for map preview demonstration only.

| ID                           | Name                           | Type   | Area            | Price Range (EGP/night) | Amenities                                                    | Incomplete / Missing Fields |
| :--------------------------- | :----------------------------- | :----- | :-------------- | :---------------------- | :----------------------------------------------------------- | :-------------------------- |
| `stay_grand_citadel_retreat` | The Grand Citadel Retreat      | hotel  | `islamic-cairo` | 3,200 – 4,800           | Wi-Fi, Courtyard Garden, Breakfast Included, Rooftop Terrace | None                        |
| `stay_nile_breeze_residency` | Nile Breeze Boutique Residency | hotel  | `zamalek`       | 4,500 – 7,200           | Wi-Fi, Nile View Balcony, Concierge Desk, Breakfast Included | None                        |
| `stay_midan_heritage_house`  | Midan Heritage House           | hotel  | `downtown`      | 2,100 – 3,400           | Wi-Fi, Heritage Library, Air Conditioning                    | None                        |
| `stay_pyramid_horizon_villa` | Pyramid Horizon Villa          | hotel  | `giza`          | 3,800 – 6,000           | Wi-Fi, Pyramids View, Pool, Airport Shuttle Service          | None                        |
| `stay_old_cairo_haven`       | Old Cairo Travelers Haven      | hostel | `old-cairo`     | 650 – 1,100             | Wi-Fi, Shared Kitchen, Luggage Storage, Bicycle Rental       | None                        |
| `stay_lotus_oasis_hostel`    | Lotus Oasis Eco-Hostel         | hostel | `zamalek`       | 800 – 1,400             | Wi-Fi, Garden Cafe, Coworking Space                          | None                        |
| `stay_babylon_courtyard_inn` | Babylon Courtyard Inn          | hotel  | `coptic-cairo`  | `null`                  | Wi-Fi, Historic Courtyard, Quiet Zone                        | `priceRange` is null        |
| `stay_lantern_quarters`      | Al-Muizz Lantern Quarters      | hostel | `islamic-cairo` | 750 – 1,200             | None (`[]`)                                                  | `amenities` is empty        |

---

## 2. Fictional Transport Options

| ID                           | Name                                | Type          | Booking Channel              | Price Quote           | Notes                                                                                               |
| :--------------------------- | :---------------------------------- | :------------ | :--------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------- |
| `transport_airport_transfer` | Cairo Airport Chauffeur Transfer    | `transfer`    | `internal` (Managed Request) | 650 EGP per vehicle   | Private one-way airport transfer between Cairo International Airport and your accommodation.        |
| `transport_private_driver`   | Greater Cairo Private Day Chauffeur | `private-car` | `external` (Demo link)       | 2,200 EGP per day     | Dedicated vehicle and licensed driver for 8 hours within Greater Cairo.                             |
| `transport_cultural_coach`   | Heritage Cultural Coach Service     | `bus`         | `external` (Demo link)       | 350 EGP per passenger | Air-conditioned scheduled shuttle between Downtown, Giza Plateau, and GEM.                          |
| `transport_metro_network`    | Cairo Metro Transit Network         | `metro`       | `external` (Informational)   | `null`                | Informational guide for Cairo Metro Lines 1, 2, and 3. Contactless and token ticketing at stations. |

---

## 3. How to Replace with Real Data Later (Phase 10 or Future Task)

1. **Accommodation**:
   - Replace the static records in `client/src/services/mock/seed/accommodation.ts` with database models / API payloads fetched from verified hotel providers or direct contracts.
   - Replace the `example.com` URLs with verified direct affiliate or booking partner deep links.
   - Verify entrance coordinates and room tier price breakdowns.
2. **Transportation**:
   - For internal transfer requests, integrate a real driver dispatch webhook or operations dashboard instead of the simulated confirmation control.
   - For external transport, integrate actual bus schedules, ticket booking APIs, or official Cairo Metro route maps.
