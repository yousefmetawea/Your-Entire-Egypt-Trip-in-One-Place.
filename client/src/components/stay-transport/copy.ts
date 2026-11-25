/** Brand copy for the Stay & Transport page (kept local so locale files stay untouched). */
export interface Copy {
  eyebrow: string;
  headA: string;
  headB: string;
  sub: string;
  ctaTransport: string;
  ctaStay: string;
  statStays: string;
  statWays: string;
  statCities: string;
  tabStay: string;
  tabTransport: string;
  waysEyebrow: string;
  waysTitle: string;
  ticker: string[];
  ways: { tag: string; title: string; line: string }[];
  closingTitle: string;
  closingLine: string;
  closingCta: string;
  stayEyebrow: string;
  stayTitle: string;
  moveEyebrow: string;
  moveTitle: string;
  est: string;
  night: string;
}

export const COPY: Record<'en' | 'ar', Copy> = {
  en: {
    eyebrow: 'Sanctuaries & transit',
    headA: 'Stay well.',
    headB: 'Arrive effortlessly.',
    sub: 'Places worth sleeping in and ways of moving that feel like part of the journey, from the airport to the Nile.',
    ctaTransport: 'Explore transport',
    ctaStay: 'Find a stay',
    statStays: 'places to stay',
    statWays: 'ways to move',
    statCities: 'regions connected',
    tabStay: 'Stay',
    tabTransport: 'Transport',
    waysEyebrow: 'Ways to move',
    waysTitle: 'Every mile, considered.',
    ticker: [
      'Airport transfer',
      'Private chauffeur',
      'Heritage coach',
      'Cairo Metro',
      'Door to door',
    ],
    ways: [
      {
        tag: 'Transfer',
        title: 'Land and be met.',
        line: 'A chauffeur, a name board, and the road into Cairo handled for you.',
      },
      {
        tag: 'Private car',
        title: 'Your day, your route.',
        line: 'Stop where the light is good. Stay as long as a place deserves.',
      },
      {
        tag: 'Coach',
        title: 'Together, in comfort.',
        line: 'Long distances made easy, with the story told along the way.',
      },
      {
        tag: 'Metro',
        title: 'Move with the city.',
        line: 'The fastest way across Cairo, at the pace of everyone around you.',
      },
    ],
    closingTitle: 'Your Egypt, door to door.',
    closingLine: 'Pick a stay, add a transfer, and keep the whole trip in one place.',
    closingCta: 'Plan my trip',
    stayEyebrow: 'Where to sleep',
    stayTitle: 'Rooms with a sense of place.',
    moveEyebrow: 'How to arrive',
    moveTitle: 'Choose how you move.',
    est: 'est.',
    night: 'per night',
  },
  ar: {
    eyebrow: 'إقامة وتنقل',
    headA: 'أقم براحة.',
    headB: 'وصّل بسلاسة.',
    sub: 'أماكن تستحق النوم فيها، وطرق تنقل تصير جزءًا من الرحلة نفسها، من المطار إلى النيل.',
    ctaTransport: 'استكشف التنقل',
    ctaStay: 'ابحث عن إقامة',
    statStays: 'مكان للإقامة',
    statWays: 'وسيلة تنقل',
    statCities: 'منطقة متصلة',
    tabStay: 'الإقامة',
    tabTransport: 'التنقل',
    waysEyebrow: 'طرق التنقل',
    waysTitle: 'كل كيلومتر محسوب.',
    ticker: ['استقبال المطار', 'سائق خاص', 'حافلة التراث', 'مترو القاهرة', 'من الباب إلى الباب'],
    ways: [
      {
        tag: 'استقبال',
        title: 'اهبط وسنكون في انتظارك.',
        line: 'سائق ولوحة باسمك، والطريق إلى القاهرة علينا.',
      },
      {
        tag: 'سيارة خاصة',
        title: 'يومك، ومسارك.',
        line: 'قف حيث الضوء جميل، وابقَ بقدر ما يستحق المكان.',
      },
      {
        tag: 'حافلة',
        title: 'معًا، بكل راحة.',
        line: 'مسافات طويلة تصير سهلة، والحكاية تُروى على الطريق.',
      },
      { tag: 'مترو', title: 'تحرّك مع المدينة.', line: 'أسرع طريق عبر القاهرة، بإيقاع من حولك.' },
    ],
    closingTitle: 'مصر كما تحب، من الباب إلى الباب.',
    closingLine: 'اختر إقامتك، أضف رحلة استقبال، واجمع رحلتك كلها في مكان واحد.',
    closingCta: 'خطط لرحلتي',
    stayEyebrow: 'أين تنام',
    stayTitle: 'غرف لها روح المكان.',
    moveEyebrow: 'كيف تصل',
    moveTitle: 'اختر طريقة تنقلك.',
    est: 'تقريبًا',
    night: 'لليلة',
  },
};

export const WAY_IMAGES = [
  '/images/stay/airport.jpg',
  '/images/stay/private-car.jpg',
  '/images/stay/bus.jpg',
  '/images/stay/metro.jpg',
];

export const TYPE_IMAGE: Record<string, string> = {
  transfer: WAY_IMAGES[0],
  'private-car': WAY_IMAGES[1],
  bus: WAY_IMAGES[2],
  metro: WAY_IMAGES[3],
};
