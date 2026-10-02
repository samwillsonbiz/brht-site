export type ManualChatGPTTrend = {
  title: string;
  description: string;
  query: string;
  attention: number;
  sourceUrls: string[];
};

export const manualChatGPTSeed = {
  generatedAt: "2026-10-02T11:28:00.000Z",
  note: "Manual ChatGPT discovery seed refreshed from a live public-web sweep on 2 Oct 2026. This is one weighted discovery signal, not a claim that these are objectively the ten most important things on the internet.",
  topics: [
    {
      title: "Taylor Swift — Patient Zero",
      description: "Taylor Swift's new 'Patient Zero' music video is drawing heavy attention after its VMA premiere and wider YouTube release, with fans dissecting the video's story and performances.",
      query: "Taylor Swift Patient Zero music video",
      attention: 94,
      sourceUrls: [
        "https://people.com/taylor-swift-patient-zero-music-video-dakota-johnson-colin-farrell-12138556",
        "https://www.cosmopolitan.com/entertainment/celebs/a73974667/taylor-swift-patient-zero-argument-lip-reading/"
      ]
    },
    {
      title: "Cornell fraternity sexual-assault investigation",
      description: "New York appointed a special prosecutor as authorities revisit allegations that a former Cornell student was sexually assaulted by fraternity members; the allegations remain contested and the investigation is ongoing.",
      query: "Cornell fraternity sexual assault investigation",
      attention: 92,
      sourceUrls: [
        "https://apnews.com/article/7203e55c76f7be14ab929764c90b60b1",
        "https://people.com/cornell-accuser-hid-under-covers-more-frat-members-entered-room-12151331"
      ]
    },
    {
      title: "Gypsy-Rose Blanchard and Ken Urker",
      description: "Gypsy-Rose Blanchard is receiving renewed attention after the sudden death of her former fiancé and the father of her child, Ken Urker; the official cause of death has not been established publicly.",
      query: "Gypsy Rose Blanchard Ken Urker death",
      attention: 89,
      sourceUrls: [
        "https://www.perthnow.com.au/entertainment/forever-soulmate-gypsy-rose-blanchard-pays-tribute-to-ex-fianc-ken-urker-following-his-sudden-death-c-22958827",
        "https://www.tmz.com/"
      ]
    },
    {
      title: "Browns beat Steelers in Thursday-night thriller",
      description: "Cleveland beat Pittsburgh 27-24 on a late 56-yard field goal after a dramatic fourth quarter, while Aaron Rodgers' sideline frustration and two interceptions fueled online discussion.",
      query: "Browns Steelers Aaron Rodgers October 2 2026",
      attention: 87,
      sourceUrls: [
        "https://www.reuters.com/sports/nfl/browns-blow-11-point-lead-rally-past-steelers--flm-2026-10-02/",
        "https://www.nbcsports.com/nfl/profootballtalk/rumor-mill/pittsburgh-steelers"
      ]
    },
    {
      title: "Gandhi Jayanti",
      description: "Mahatma Gandhi's birth anniversary and the International Day of Non-Violence are driving large global social-media trends and commemorations, especially across India and its diaspora.",
      query: "Gandhi Jayanti Mahatma Gandhi October 2 2026",
      attention: 85,
      sourceUrls: [
        "https://trends24.in/",
        "https://news.webindia123.com/news/articles/world/20261002/4506186.html"
      ]
    },
    {
      title: "Fortnitemares 2026",
      description: "Fortnite's Halloween event is rolling out new locations, weapons, modes and crossovers including Five Nights at Freddy's, Freddy Krueger and other horror franchises.",
      query: "Fortnitemares 2026",
      attention: 82,
      sourceUrls: [
        "https://www.fortnite.com/news/the-corruption-spreads-in-fortnitemares-2026"
      ]
    },
    {
      title: "Formula 1 returns to Sepang",
      description: "Formula 1 is back at Malaysia's Sepang circuit for the first time since 2017, with Verstappen quickest in opening practice and Leclerc leading the second session amid heavy tyre degradation.",
      query: "Formula 1 Sepang October 2 2026 Verstappen Leclerc",
      attention: 80,
      sourceUrls: [
        "https://www.reuters.com/sports/formula1/verstappen-sets-pace-opening-practice-sepang-2026-10-02/",
        "https://www.formula1.com/en/latest/article/what-was-happening-in-the-world-the-last-time-f1-raced-in-malaysia.6FhCdurEMcfv9tQrcB37d3"
      ]
    },
    {
      title: "Global bond rout and U.S. jobs report",
      description: "Markets are focused on a sharp global bond sell-off, historically high U.S. Treasury yields and September payroll data that could influence the Federal Reserve's next move.",
      query: "global bond rout US jobs report October 2 2026",
      attention: 78,
      sourceUrls: [
        "https://www.reuters.com/world/china/global-markets-wrapup-1-2026-10-02/",
        "https://www.reuters.com/commentary/reuters-open-interest/global-markets-view-usa-2026-10-02/"
      ]
    },
    {
      title: "Anthropic IPO and AI-risk disclosures",
      description: "Anthropic's planned IPO is drawing attention after reports on its rapid growth, huge spending ambitions and unusually explicit warnings about catastrophic risks from advanced AI.",
      query: "Anthropic IPO prospectus AI risk October 2026",
      attention: 75,
      sourceUrls: [
        "https://www.reuters.com/commentary/reuters-open-interest/weekend-reads-anthropic-exclusive-geopolitical-credit-responsible-mining-2026-10-02/",
        "https://www.reuters.com/commentary/reuters-open-interest/global-markets-view-usa-2026-10-02/"
      ]
    },
    {
      title: "Avengers: Doomsday",
      description: "Marvel's 'Avengers: Doomsday' remains a major entertainment conversation as its trailer and promotional cycle continue generating millions of views and fan speculation ahead of release.",
      query: "Avengers Doomsday trailer 2026",
      attention: 72,
      sourceUrls: [
        "https://www.youtube.com/watch?v=iFl4YeX6jmc"
      ]
    }
  ] satisfies ManualChatGPTTrend[]
};
