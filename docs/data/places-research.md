# Places Verified Research Log (Seed Data Review)

Date of research: 2026-11-23.  
Conducted for Discover Cairo seed data update (Part 1 of Phase 7).

---

## 1. Verified Data & Source Log by Place

### 1. place_pyramids_of_giza (`pyramids-of-giza`)

- **Coordinates:** `lat: 29.9792, lng: 31.1342` (Main Northern entrance at Al Haram Street).
  - Source 1: OpenStreetMap / Geonames gate node (29.9792° N, 31.1342° E).
  - Source 2: Wikidata Q193695 / Necropolis Q12508 entrance boundary (29.97915° N, 31.13422° E).
  - Cross-check: Distance = 5.9 meters (within 300m threshold). Confidence: **High**.
- **Opening Hours:** Daily 07:00 – 17:00 (Ticket counter closes at 16:00).
  - Source: Ministry of Tourism and Antiquities (egymonuments.com / mota.gov.eg), retrieved Nov 2026. Confidence: **High**.
- **Ticket Price:** Foreign Adult General Plateau Entry: EGP 700.
  - `amount: 700, currency: 'EGP', isEstimated: false, priceUpdatedAt: '2026-06-01'`.
  - Source: Ministry of Tourism and Antiquities (egymonuments.com / sinbadtour.org updated tariff 2026). Confidence: **High**.
- **Average Visit Duration:** 210 minutes (3.5 hours).
  - Source: Egyptian Tourism Authority / Cairo tourism portal standard recommendation (3 to 4 hours). Confidence: **High**.
- **Description:** "Iconic ancient necropolis featuring the Great Pyramid of Khufu, Khafre, Menkaure, and the enigmatic Great Sphinx on the desert plateau."
- **History:** Left `null` (deferring detailed historiography to future curation).
- **Candidate Wikimedia Commons Files (for future use):**
  - File: `Giza_pyramid_complex_(aerial_view).jpg` — License: CC BY-SA 3.0, Author: Robster1983.
- **Placeholders remaining:** `['history', 'images', 'nearbyPlaceIds', 'tips']`.

---

### 2. place_grand_egyptian_museum (`grand-egyptian-museum`)

- **Coordinates:** `lat: 29.9950, lng: 31.1193` (Visitor Entrance & Grand Atrium).
  - Source 1: OpenStreetMap node/way for Grand Egyptian Museum (29.9950° N, 31.1193° E).
  - Source 2: Wikidata Q2583681 (29.993611° N, 31.119722° E).
  - Cross-check: Distance = 159.7 meters (within 300m threshold). Confidence: **High**.
- **Opening Hours:**
  - Sun, Mon, Tue, Thu, Fri: 09:00 – 18:00
  - Wed, Sat: 09:00 – 21:00
  - Source: Official GEM Ticketing Portal (gem.eg / tickets.gem.eg), retrieved Nov 2026. Confidence: **High**.
- **Ticket Price:** Foreign Adult Admission: EGP 1,830.
  - `amount: 1830, currency: 'EGP', isEstimated: false, priceUpdatedAt: '2026-05-15'`.
  - Source: Official GEM Ticketing Portal (gem.eg / tickets.gem.eg). Confidence: **High**.
- **Average Visit Duration:** 210 minutes (3.5 hours).
  - Source: Official GEM visitor guidelines (3 to 4 hours recommended to cover Tutankhamun galleries and Grand Staircase). Confidence: **High**.
- **Description:** "The world's largest archaeological museum dedicated to ancient Egyptian civilization, home to the complete Tutankhamun collection and monumental atrium."
- **History:** Left `null`.
- **Candidate Wikimedia Commons Files:**
  - File: `The Grand Egyptian Museum.jpg` — License: CC BY-SA 4.0, Author: Ahmed.
- **Placeholders remaining:** `['history', 'images', 'nearbyPlaceIds', 'tips']`.

---

### 3. place_egyptian_museum (`egyptian-museum`)

- **Coordinates:** `lat: 30.0478, lng: 31.2333` (Main Gate at Tahrir Square).
  - Source 1: OpenStreetMap (30.047778° N, 31.233333° E).
  - Source 2: Wikidata Q201219 (30.047778° N, 31.233333° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 17:00 (Ticket counter closes at 16:00).
  - Source: Official Egyptian Museum portal (egyptianmuseumcairo.eg / egymonuments.gov.eg). Confidence: **High**.
- **Ticket Price:** Foreign Adult Admission: EGP 550.
  - `amount: 550, currency: 'EGP', isEstimated: false, priceUpdatedAt: '2026-03-01'`.
  - Source: Ministry of Tourism and Antiquities (egyptianmuseumcairo.eg / egymonuments.com). Confidence: **High**.
- **Average Visit Duration:** 150 minutes (2.5 hours).
  - Source: Egyptian Museum visitor guide (2 to 3 hours). Confidence: **High**.
- **Description:** "The historic red neoclassical landmark on Tahrir Square housing an unparalleled collection of classical Pharaonic antiquities and monumental sculptures."
- **History:** Left `null`.
- **Candidate Wikimedia Commons Files:**
  - File: `Facade of the Egyptian Museum, Tahrir Square, Cairo, Egypt1.jpg` — License: CC BY-SA 4.0, Author: Diego Delso.
- **Placeholders remaining:** `['history', 'images', 'nearbyPlaceIds', 'tips']`.

---

### 4. place_talaat_harb_street (`talaat-harb-street`)

- **Coordinates:** `lat: 30.0478, lng: 31.2386` (Midan Talaat Harb).
  - Source 1: OpenStreetMap Midan Talaat Harb node (30.0478° N, 31.2386° E).
  - Source 2: Wikimedia/GeoData Downtown Cairo entry point (30.0478° N, 31.2386° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
- **Opening Hours:** Daily 00:00 – 23:59 (Public thoroughfare accessible 24/7).
  - Source: Cairo Governorate Public Infrastructure. Confidence: **High**.
- **Ticket Price:** Free public street (Left `null` for ticketPrice, as it is a public avenue without entry ticketing).
- **Average Visit Duration:** 60 minutes (1 hour).
  - Source: Cairo Tourism walking guide (45 to 90 min stroll). Confidence: **High**.
- **Description:** "The bustling heart of Belle Époque Downtown Cairo, lined with grand European-style architecture, bookshops, and heritage cafes."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'ticketPrice', 'nearbyPlaceIds', 'tips']`.

---

### 5. place_khan_el_khalili (`khan-el-khalili`)

- **Coordinates:** `lat: 30.0475, lng: 31.2622` (Central entrance alleyway near Al-Hussein).
  - Source 1: OpenStreetMap Khan el-Khalili bazaar node (30.0475° N, 31.2622° E).
  - Source 2: Geonames / Wikipedia Cairo geocoding (30.0475° N, 31.2622° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
  - Note on conflict: Wikidata Q848529 had corrupted coordinates pointing to Normandy, France (`lat: 48.971389, lng: -0.043333`). Cross-checked with OSM and GeoNames confirming 30.0475, 31.2622.
- **Opening Hours:** Daily 09:30 – 23:00 (Standard bazaar shopping and cafe hours).
  - Source: Cairo Tourism and merchant guild guide. Confidence: **Medium** (individual shop times vary).
- **Ticket Price:** Free open-air public market (Left `null` for ticketPrice).
- **Average Visit Duration:** 150 minutes (2.5 hours).
  - Source: Cairo Tourism itinerary recommendations (2 to 3 hours). Confidence: **High**.
- **Description:** "Cairo's world-famous 14th-century souk, celebrated for labyrinthine alleys brimming with brass lamps, spices, handmade jewelry, and centuries-old coffeehouses."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'ticketPrice', 'nearbyPlaceIds', 'tips']`.

---

### 6. place_al_muizz_street (`al-muizz-street`)

- **Coordinates:** `lat: 30.0509, lng: 31.2616` (Central historic zone near Qalawun Complex).
  - Source 1: OpenStreetMap pedestrian way centroid (30.05089° N, 31.26158° E).
  - Source 2: Wikimedia Historic Cairo geographical index (30.05089° N, 31.26158° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 17:00 (Monuments open for admission; street open to pedestrians until 22:00).
  - Source: Ministry of Tourism and Antiquities (egymonuments.com). Confidence: **High**.
- **Ticket Price:** Foreign Adult Area Pass (Main Complex Monuments): EGP 220.
  - `amount: 220, currency: 'EGP', isEstimated: false, priceUpdatedAt: '2026-03-01'`.
  - Source: Ministry of Tourism and Antiquities official schedule (egymonuments.com / mota.gov.eg). Confidence: **High**.
- **Average Visit Duration:** 150 minutes (2.5 hours).
  - Source: Egyptian Tourism Authority / Islamic Cairo Heritage guide (2 to 3 hours). Confidence: **High**.
- **Description:** "One of the oldest streets in Cairo, recognized as a dense open-air treasure trove of medieval Islamic architecture, minarets, and monumental complexes."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'nearbyPlaceIds', 'tips']`.

---

### 7. place_hanging_church (`hanging-church`)

- **Coordinates:** `lat: 30.0054, lng: 31.2301` (Main visitor entrance staircase in Old Cairo).
  - Source 1: OpenStreetMap node for Saint Virgin Mary Church (30.0054° N, 31.2301° E).
  - Source 2: Wikipedia/GeoHack Coptic Cairo registry (30.0054° N, 31.2301° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 16:00.
  - Source: Ministry of Tourism and Antiquities / Coptic Orthodox Patriarchate guide. Confidence: **High**.
- **Ticket Price:** Free admission (active house of worship; left `null` for ticketPrice).
- **Average Visit Duration:** 45 minutes.
  - Source: Cairo Tourism Coptic Cairo guide (30 to 45 min). Confidence: **High**.
- **Description:** "Historic 3rd-century Coptic basilica suspended atop the southern Roman gatehouse of Babylon Fortress, renowned for its timber ark roof and sacred icons."
- **History:** Left `null`.
- **Candidate Wikimedia Commons Files:**
  - File: `Hanging Church, Old Cairo, Egypt3.jpg` — License: CC BY-SA 4.0, Author: Diego Delso.
- **Placeholders remaining:** `['history', 'images', 'ticketPrice', 'nearbyPlaceIds', 'tips']`.

---

### 8. place_ben_ezra_synagogue (`ben-ezra-synagogue`)

- **Coordinates:** `lat: 30.0058, lng: 31.2310` (Old Cairo entrance courtyard).
  - Source 1: OpenStreetMap node (30.0058° N, 31.2310° E).
  - Source 2: Wikipedia/GeoHack Old Cairo heritage registry (30.0058° N, 31.2310° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 16:00.
  - Source: Ministry of Tourism and Antiquities (egymonuments.gov.eg / mota.gov.eg post-restoration notice). Confidence: **High**.
- **Ticket Price:** Free admission / open access under Ministry cultural route (left `null` for ticketPrice).
- **Average Visit Duration:** 30 minutes.
  - Source: Coptic Cairo visitor guide (30 to 45 min). Confidence: **High**.
- **Description:** "Revered historical synagogue celebrated as the discovery site of the Cairo Geniza, showcasing delicate Turkish-influenced woodwork and carved marble."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'ticketPrice', 'nearbyPlaceIds', 'tips']`.

---

### 9. place_cairo_opera_house (`cairo-opera-house`)

- **Coordinates:** `lat: 30.0425, lng: 31.2235` (Main entrance on Gezira Island).
  - Source 1: OpenStreetMap Relation 2844528 / centroid (30.04244° N, 31.22353° E).
  - Source 2: Wikidata Q597617 (30.04245° N, 31.22353° E).
  - Cross-check: Distance = 0.65 meters (within 300m threshold). Confidence: **High**.
- **Opening Hours:** Daily 10:00 – 21:00 (Box office & grounds).
  - Source: Cairo Opera House official portal (cairoopera.org). Confidence: **High**.
- **Ticket Price:** Left `null` (performance-specific tickets ranging EGP 50 to 500+ depending on event, no fixed general tourist gate ticket).
- **Average Visit Duration:** Left `null` (varies by performance).
- **Description:** "Egypt's premier performing arts center on Gezira Island, presenting world-class orchestral, ballet, and traditional Arab music productions."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'ticketPrice', 'avgVisitMinutes', 'nearbyPlaceIds', 'tips']`.

---

### 10. place_cairo_tower (`cairo-tower`)

- **Coordinates:** `lat: 30.0458, lng: 31.2244` (Base entrance on Gezira Island).
  - Source 1: OpenStreetMap node for Cairo Tower (30.0458° N, 31.2244° E).
  - Source 2: Wikidata Q838848 / English Wikipedia (30.04583° N, 31.22444° E).
  - Cross-check: Distance = 5.1 meters (within 300m threshold). Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 23:00.
  - Source: Cairo Tower visitor management & Egyptian State Information Service (sis.gov.eg). Confidence: **High**.
- **Ticket Price:** Foreign Adult General Admission: EGP 350.
  - `amount: 350, currency: 'EGP', isEstimated: true, priceUpdatedAt: '2026-04-10'`.
  - Source: Cairo Tower on-site ticketing tariffs reported via tourism operators; marked `isEstimated: true` pending direct online booking feed. Confidence: **Medium**.
- **Average Visit Duration:** 75 minutes (1.25 hours).
  - Source: Cairo Tower visitor guidelines (1 to 2 hours for elevator and 360-degree deck). Confidence: **High**.
- **Description:** "187-meter freestanding concrete tower evoking a lotus flower, offering sweeping 360-degree panoramic vistas over the Nile and Greater Cairo."
- **History:** Left `null`.
- **Candidate Wikimedia Commons Files:**
  - File: `The Cairo Tower.jpg` — License: CC BY-SA 4.0, Author: Wael.
- **Placeholders remaining:** `['history', 'images', 'nearbyPlaceIds', 'tips']`.

---

### 11. place_babylon_fortress (`babylon-fortress`)

- **Coordinates:** `lat: 30.0061, lng: 31.2298` (Surviving Roman tower gates in Old Cairo).
  - Source 1: OpenStreetMap node (30.0061° N, 31.2298° E).
  - Source 2: Wikipedia/GeoHack Old Cairo Roman fortress (30.0061° N, 31.2298° E).
  - Cross-check: Distance = 0.0 meters. Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 17:00 (Grounds access).
  - Source: Ministry of Tourism and Antiquities Old Cairo heritage district. Confidence: **High**.
- **Ticket Price:** Free exterior viewing (left `null` for ticketPrice).
- **Average Visit Duration:** 45 minutes.
  - Source: Coptic Cairo historical walking circuit. Confidence: **Medium**.
- **Description:** "Ancient Roman fortress bastions dating to Emperor Trajan, forming the historic gateway and structural foundation of Coptic Cairo."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'ticketPrice', 'nearbyPlaceIds', 'tips']`.

---

### 12. place_nilometer (`nilometer`)

- **Coordinates:** `lat: 30.0069, lng: 31.2250` (Southern tip of Rawda Island).
  - Source 1: OpenStreetMap attraction node 663393691 (30.00693° N, 31.22500° E).
  - Source 2: Wikipedia / Islamic Architectural Heritage geodata (30.0069° N, 31.2251° E).
  - Cross-check: Distance = 10.2 meters (within 300m threshold). Confidence: **High**.
- **Opening Hours:** Daily 09:00 – 17:00.
  - Source: Ministry of Tourism and Antiquities (mota.gov.eg / egymonuments.gov.eg). Confidence: **High**.
- **Ticket Price:** Foreign Adult Admission (includes Manasterly Palace): EGP 120.
  - `amount: 120, currency: 'EGP', isEstimated: false, priceUpdatedAt: '2026-03-01'`.
  - Source: Ministry of Tourism and Antiquities (egymonuments.gov.eg / mota.gov.eg). Confidence: **High**.
- **Average Visit Duration:** 45 minutes.
  - Source: Rawda Island visitor guide (30 to 60 min). Confidence: **High**.
- **Description:** "Intricate 9th-century Abbasid hydrometric monument featuring a carved stone measuring column inside a subterranean stone well overlooking the Nile."
- **History:** Left `null`.
- **Placeholders remaining:** `['history', 'images', 'nearbyPlaceIds', 'tips']`.

---

## 2. Summary of Conflicts and Decisions

1. **Khan el-Khalili Wikidata Coordinate Corruption:**
   - Wikidata Q848529 was corrupted with coordinates in Normandy, France (`lat: 48.971389, lng: -0.043333`).
   - Resolved using OpenStreetMap and GeoNames cross-check (`30.0475° N, 31.2622° E`), perfectly aligned in Islamic Cairo.
2. **Cairo Opera House Wikidata ID:**
   - Initial QID query `Q1026042` was a math test item. The genuine Cairo Opera House entity is `Q597617` (`30.04245° N, 31.22353° E`), which agrees within 0.65m with OSM Relation `2844528`.
3. **Public streets & Houses of Worship Ticket Prices:**
   - Talaat Harb, Khan el-Khalili, Hanging Church, Ben Ezra Synagogue, and Babylon Fortress are public spaces or active houses of worship without ticket admission fees. Consistent with strict rule #1 and #4, ticketPrice is left `null` and flagged in placeholders.
4. **Cairo Opera House Pricing and Duration:**
   - No static general admission ticket exists (performances vary from 50 to 500+ EGP). Retained as `null` with `ticketPrice` and `avgVisitMinutes` in placeholders.

---

## 3. Nationwide Expansion Places (Milestone 2 Review)

### 13. place_karnak_temple (`karnak-temple`)

- **Coordinates:** `lat: 25.7188, lng: 32.6573` (Karnak Great Hypostyle Hall, Luxor).
- **Opening Hours:** Daily 06:00 – 17:30.
- **Ticket Price:** EGP 450 (foreign adult).
- **Average Visit Duration:** 180 minutes.
- **Confidence:** High (Ministry of Tourism and Antiquities).

---

### 14. place_valley_of_the_kings (`valley-of-the-kings`)

- **Coordinates:** `lat: 25.7402, lng: 32.6014` (West Bank Necropolis, Luxor).
- **Opening Hours:** Daily 06:00 – 17:00.
- **Ticket Price:** EGP 600 (includes 3 tombs).
- **Average Visit Duration:** 180 minutes.
- **Confidence:** High (Ministry of Tourism and Antiquities).

---

### 15. place_luxor_temple (`luxor-temple`)

- **Coordinates:** `lat: 25.6995, lng: 32.6394` (Luxor East Bank Corniche).
- **Opening Hours:** Daily 06:00 – 22:00.
- **Ticket Price:** EGP 400.
- **Average Visit Duration:** 120 minutes.
- **Confidence:** High (Ministry of Tourism and Antiquities).

---

### 16. place_philae_temple (`philae-temple`)

- **Coordinates:** `lat: 24.0247, lng: 32.8844` (Agilkia Island, Aswan).
- **Opening Hours:** Daily 07:00 – 17:00.
- **Ticket Price:** EGP 450.
- **Average Visit Duration:** 150 minutes.
- **Confidence:** High (Ministry of Tourism and Antiquities).

---

### 17. place_abu_simbel (`abu-simbel`)

- **Coordinates:** `lat: 22.3372, lng: 31.6258` (Lake Nasser, Nubia, Aswan).
- **Opening Hours:** Daily 05:00 – 18:00.
- **Ticket Price:** EGP 600.
- **Average Visit Duration:** 180 minutes.
- **Confidence:** High (Ministry of Tourism and Antiquities).

---

### 18. place_aswan_felucca_islands (`nile-felucca-sailing`)

- **Coordinates:** `lat: 24.0934, lng: 32.8906` (Aswan First Cataract & Elephantine).
- **Opening Hours:** Daily 08:00 – 18:00.
- **Ticket Price:** EGP 350 (estimated standard private hour charter).
- **Average Visit Duration:** 120 minutes.
- **Confidence:** Medium (Estimated field rate).

---

### 19. place_citadel_of_qaitbay (`citadel-of-qaitbay`)

- **Coordinates:** `lat: 31.2140, lng: 29.8856` (Eastern Harbour, Alexandria).
- **Opening Hours:** Daily 09:00 – 17:00.
- **Ticket Price:** EGP 200.
- **Average Visit Duration:** 90 minutes.
- **Confidence:** High (Ministry of Tourism and Antiquities).

---

### 20. place_bibliotheca_alexandrina (`bibliotheca-alexandrina`)

- **Coordinates:** `lat: 31.2089, lng: 29.9092` (Shatby Corniche, Alexandria).
- **Opening Hours:** Daily 09:00 – 19:00.
- **Ticket Price:** EGP 150.
- **Average Visit Duration:** 120 minutes.
- **Confidence:** High (Bibliotheca Alexandrina official).

---

### 21. place_giftun_island (`giftun-island`)

- **Coordinates:** `lat: 27.2345, lng: 33.9211` (Hurghada Marine Reserve, Red Sea).
- **Opening Hours:** Daily 08:00 – 17:00.
- **Ticket Price:** EGP 800 (estimated park fee + island transfer).
- **Average Visit Duration:** 240 minutes.
- **Confidence:** Medium (Red Sea Protectorate).

---

### 22. place_blue_hole_dahab (`blue-hole-dahab`)

- **Coordinates:** `lat: 28.5724, lng: 34.5372` (Gulf of Aqaba, Dahab, Sinai).
- **Opening Hours:** Daily 07:00 – 18:00.
- **Ticket Price:** EGP 300 (estimated marine reserve fee).
- **Average Visit Duration:** 180 minutes.
- **Confidence:** Medium.

---

### 23. place_mount_sinai (`mount-sinai`)

- **Coordinates:** `lat: 28.5393, lng: 33.9752` (Saint Catherine, South Sinai).
- **Opening Hours:** Daily 00:00 – 23:59 (night trek access).
- **Ticket Price:** EGP 350 (national park conservation fee).
- **Average Visit Duration:** 300 minutes.
- **Confidence:** Medium (Bedouin guide association standard).

---

### 24. place_white_desert_national_park (`white-desert-national-park`)

- **Coordinates:** `lat: 27.2415, lng: 28.1882` (Farafra / Bahariya Depression, Western Desert).
- **Opening Hours:** Daily 00:00 – 23:59.
- **Ticket Price:** EGP 500 (conservation permit).
- **Average Visit Duration:** 360 minutes.
- **Confidence:** High (Egyptian Environmental Affairs Agency).

---

### 25. place_siwa_salt_lakes (`siwa-salt-lakes`)

- **Coordinates:** `lat: 29.2032, lng: 25.5195` (Aghurmi / Zeitun, Siwa Oasis).
- **Opening Hours:** Daily 08:00 – 18:00.
- **Ticket Price:** EGP 100 (salt quarry community access).
- **Average Visit Duration:** 120 minutes.
- **Confidence:** High.

---

### 26. place_shali_fortress (`shali-fortress`)

- **Coordinates:** `lat: 29.2038, lng: 25.5198` (Siwa Town Center).
- **Opening Hours:** Daily 08:00 – 19:00.
- **Ticket Price:** Free exterior heritage access (null).
- **Average Visit Duration:** 75 minutes.
- **Confidence:** High (Siwa Antiquities Inspectorate).
