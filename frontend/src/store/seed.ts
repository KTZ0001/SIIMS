import { buildEvaluation } from './scoring';
import type {
  Activity,
  AppState,
  Application,
  ApplicationForm,
  DemoIdentity,
  Evaluation,
  FeedbackNote,
  FundingRequest,
  Mentor,
  MentorSession,
  Milestone,
  Notification,
  Program,
  ResourceRequest,
  Startup,
  StatusEvent,
  User,
} from './types';

// Bumped to 3 when the INVESTOR role was added: a persisted v2 blob has no
// investor identity, so it must be re-seeded rather than loaded.
export const STATE_VERSION = 3;

/* ------------------------------------------------------------ date helpers */

const DAY = 86_400_000;

function makeClock() {
  const now = Date.now();
  return {
    ago: (days: number) => new Date(now - days * DAY).toISOString(),
    ahead: (days: number) => new Date(now + days * DAY).toISOString(),
  };
}

type Clock = ReturnType<typeof makeClock>;

/* ------------------------------------------------------------------ people */

function buildUsers(t: Clock): User[] {
  return [
    {
      id: 'usr-kavita',
      firstName: 'Kavita',
      lastName: 'Menon',
      email: 'admin@siims.demo',
      role: 'ADMIN',
      title: 'Head of Incubation',
      avatarSeed: 'KM',
      joinedAt: t.ago(720),
    },
    {
      id: 'usr-rohan',
      firstName: 'Rohan',
      lastName: 'Malhotra',
      email: 'investor@siims.demo',
      role: 'INVESTOR',
      title: 'Partner, Calibre Early Fund',
      avatarSeed: 'RM',
      joinedAt: t.ago(410),
    },
    {
      id: 'usr-priya',
      firstName: 'Priya',
      lastName: 'Raghunathan',
      email: 'founder@siims.demo',
      role: 'FOUNDER',
      title: 'Founder & CEO, ShopThread',
      avatarSeed: 'PR',
      joinedAt: t.ago(24),
    },
    {
      id: 'usr-arun',
      firstName: 'Arun',
      lastName: 'Vasudevan',
      email: 'arun@nexusai.in',
      role: 'FOUNDER',
      title: 'Co-founder & CEO, Nexus AI',
      avatarSeed: 'AV',
      joinedAt: t.ago(310),
    },
    {
      id: 'usr-sneha',
      firstName: 'Sneha',
      lastName: 'Bhatt',
      email: 'sneha@mediqueue.health',
      role: 'FOUNDER',
      title: 'Founder, MediQueue',
      avatarSeed: 'SB',
      joinedAt: t.ago(268),
    },
    {
      id: 'usr-karthik',
      firstName: 'Karthik',
      lastName: 'Reddy',
      email: 'karthik@agrisense.co',
      role: 'FOUNDER',
      title: 'Co-founder & CTO, AgriSense',
      avatarSeed: 'KR',
      joinedAt: t.ago(240),
    },
    {
      id: 'usr-nandini',
      firstName: 'Nandini',
      lastName: 'Rao',
      email: 'nandini@aquapure.in',
      role: 'FOUNDER',
      title: 'Founder, AquaPure',
      avatarSeed: 'NR',
      joinedAt: t.ago(190),
    },
    {
      id: 'usr-imran',
      firstName: 'Imran',
      lastName: 'Qureshi',
      email: 'imran@finledger.io',
      role: 'FOUNDER',
      title: 'Founder & CEO, FinLedger',
      avatarSeed: 'IQ',
      joinedAt: t.ago(96),
    },
    {
      id: 'usr-tara',
      firstName: 'Tara',
      lastName: 'Sundaram',
      email: 'tara@eduspark.app',
      role: 'FOUNDER',
      title: 'Founder, EduSpark',
      avatarSeed: 'TS',
      joinedAt: t.ago(74),
    },
    {
      id: 'usr-devansh',
      firstName: 'Devansh',
      lastName: 'Kapoor',
      email: 'devansh@carbontrace.earth',
      role: 'FOUNDER',
      title: 'Co-founder, CarbonTrace',
      avatarSeed: 'DK',
      joinedAt: t.ago(41),
    },
    {
      id: 'usr-fiona',
      firstName: 'Fiona',
      lastName: "D'Souza",
      email: 'fiona@routegrid.in',
      role: 'FOUNDER',
      title: 'Founder, RouteGrid',
      avatarSeed: 'FD',
      joinedAt: t.ago(18),
    },
    {
      id: 'usr-manish',
      firstName: 'Manish',
      lastName: 'Thakur',
      email: 'manish@skillbridge.work',
      role: 'FOUNDER',
      title: 'Founder, SkillBridge',
      avatarSeed: 'MT',
      joinedAt: t.ago(120),
    },
  ];
}

/**
 * Ananya carries the `mentor@siims.demo` identity because she is the mentor the
 * drivable demo path assigns ShopThread to — commerce unit economics is her
 * area, and she has spare capacity. She already mentors MediQueue so her
 * dashboard is populated before the assignment happens.
 */
function buildMentors(t: Clock): Mentor[] {
  return [
    {
      id: 'mnt-ananya',
      firstName: 'Ananya',
      lastName: 'Iyer',
      email: 'mentor@siims.demo',
      organization: 'Meridian Capital',
      title: 'Principal, Growth',
      expertise: ['Go-to-Market', 'Unit Economics', 'FinTech', 'Commerce'],
      bio: 'Spent six years underwriting lending businesses before moving to venture. Works with founders on pricing, CAC payback and the first revenue hires.',
      yearsExperience: 11,
      maxStartups: 4,
      status: 'ACTIVE',
      avatarSeed: 'AI',
      createdAt: t.ago(365),
    },
    {
      id: 'mnt-rahul',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.sharma@siims.demo',
      organization: 'Praxis Health Ventures',
      title: 'Clinical AI Advisor',
      expertise: ['Artificial Intelligence', 'Healthcare', 'Regulatory'],
      bio: 'Former head of data science at a hospital network. Took two diagnostic products through CDSCO clearance and now advises early clinical-AI teams on validation study design.',
      yearsExperience: 14,
      maxStartups: 4,
      status: 'ACTIVE',
      avatarSeed: 'RS',
      createdAt: t.ago(400),
    },
    {
      id: 'mnt-vikram',
      firstName: 'Vikram',
      lastName: 'Desai',
      email: 'vikram.desai@siims.demo',
      organization: 'Desai Operations Consulting',
      title: 'Supply Chain Practitioner',
      expertise: ['Supply Chain', 'Operations', 'Rural Distribution'],
      bio: 'Built last-mile networks across three states for an agri-input distributor. Focuses on the gap between a working pilot and a repeatable field operation.',
      yearsExperience: 18,
      maxStartups: 3,
      status: 'ACTIVE',
      avatarSeed: 'VD',
      createdAt: t.ago(330),
    },
    {
      id: 'mnt-meera',
      firstName: 'Meera',
      lastName: 'Krishnan',
      email: 'meera.krishnan@siims.demo',
      organization: 'Foldpaper Studio',
      title: 'Product & Design Partner',
      expertise: ['Product Management', 'EdTech', 'User Research'],
      bio: 'Product lead turned consultant. Runs discovery sprints with founders who have engineering strength but no clear picture of who they are building for.',
      yearsExperience: 9,
      maxStartups: 4,
      status: 'ACTIVE',
      avatarSeed: 'MK',
      createdAt: t.ago(280),
    },
    {
      id: 'mnt-arjun',
      firstName: 'Arjun',
      lastName: 'Bose',
      email: 'arjun.bose@siims.demo',
      organization: 'Terra Labs',
      title: 'Hardware & Climate Advisor',
      expertise: ['ClimateTech', 'Hardware', 'Manufacturing'],
      bio: 'Mechanical engineer who has shipped three water-treatment products from prototype to contract manufacture. Strong on BOM cost and vendor qualification.',
      yearsExperience: 16,
      maxStartups: 3,
      status: 'ACTIVE',
      avatarSeed: 'AB',
      createdAt: t.ago(250),
    },
  ];
}

/* ---------------------------------------------------------------- startups */

function buildStartups(t: Clock): Startup[] {
  return [
    {
      id: 'stp-shopthread',
      founderId: 'usr-priya',
      name: 'ShopThread',
      tagline: 'Resale infrastructure for independent clothing labels.',
      domain: 'Retail Technology',
      sector: 'Commerce',
      stage: 'Prototype',
      description:
        'ShopThread gives small clothing labels a branded resale channel. Customers send back items they no longer wear, ShopThread handles authentication and cleaning through partner facilities, and the label resells them under its own storefront while keeping the customer relationship.',
      website: 'https://shopthread.in',
      city: 'Bengaluru',
      foundedYear: 2026,
      logoSeed: 'ST',
      teamMembers: [
        { name: 'Priya Raghunathan', role: 'Founder & CEO' },
        { name: 'Nikhil Menon', role: 'Engineering Lead' },
      ],
      mentorId: null,
      programId: null,
      fundingGoal: 4_000_000,
      fundingRaised: 0,
      createdAt: t.ago(24),
    },
    {
      id: 'stp-nexus',
      founderId: 'usr-arun',
      name: 'Nexus AI',
      tagline: 'Early disease detection from routine medical imaging.',
      domain: 'Artificial Intelligence & Healthcare',
      sector: 'HealthTech',
      stage: 'Early Revenue',
      description:
        'Nexus AI reads chest X-rays and retinal scans at the point of capture and flags findings that warrant a specialist review. It is designed for district hospitals and standalone diagnostic centres where a radiologist may only visit twice a week.',
      website: 'https://nexusai.in',
      city: 'Chennai',
      foundedYear: 2024,
      logoSeed: 'NX',
      teamMembers: [
        { name: 'Arun Vasudevan', role: 'Co-founder & CEO' },
        { name: 'Dr. Leela Nair', role: 'Chief Medical Officer' },
        { name: 'Sameer Joshi', role: 'Head of ML' },
      ],
      mentorId: 'mnt-rahul',
      programId: 'prg-ignite',
      fundingGoal: 25_000_000,
      fundingRaised: 12_500_000,
      createdAt: t.ago(310),
    },
    {
      id: 'stp-mediqueue',
      founderId: 'usr-sneha',
      name: 'MediQueue',
      tagline: 'Outpatient scheduling that survives contact with reality.',
      domain: 'Health Systems',
      sector: 'HealthTech',
      stage: 'MVP',
      description:
        'MediQueue replaces the paper token system in outpatient departments with SMS-based slotting that re-sequences automatically when a consultant runs late. Patients get a realistic time to arrive instead of a number and a four-hour wait.',
      website: 'https://mediqueue.health',
      city: 'Pune',
      foundedYear: 2025,
      logoSeed: 'MQ',
      teamMembers: [
        { name: 'Sneha Bhatt', role: 'Founder' },
        { name: 'Rohan Gupta', role: 'Backend Engineer' },
      ],
      mentorId: 'mnt-ananya',
      programId: 'prg-ignite',
      fundingGoal: 8_000_000,
      fundingRaised: 3_000_000,
      createdAt: t.ago(268),
    },
    {
      id: 'stp-agrisense',
      founderId: 'usr-karthik',
      name: 'AgriSense',
      tagline: 'Soil moisture sensing priced for a five-acre farm.',
      domain: 'Agriculture Technology',
      sector: 'AgriTech',
      stage: 'Early Revenue',
      description:
        'AgriSense builds a ₹2,400 soil probe that reports moisture and temperature over a low-power mesh, plus an irrigation advisory delivered as a voice call in the local language. Sold through existing agri-input dealers rather than direct to farmers.',
      website: 'https://agrisense.co',
      city: 'Hyderabad',
      foundedYear: 2024,
      logoSeed: 'AS',
      teamMembers: [
        { name: 'Karthik Reddy', role: 'Co-founder & CTO' },
        { name: 'Lakshmi Prasad', role: 'Co-founder & Field Operations' },
        { name: 'Vinod Kumar', role: 'Hardware Engineer' },
      ],
      mentorId: 'mnt-vikram',
      programId: 'prg-ignite',
      fundingGoal: 15_000_000,
      fundingRaised: 6_200_000,
      createdAt: t.ago(240),
    },
    {
      id: 'stp-aquapure',
      founderId: 'usr-nandini',
      name: 'AquaPure',
      tagline: 'Community water treatment without a service contract.',
      domain: 'Water & Sanitation',
      sector: 'CleanTech',
      stage: 'MVP',
      description:
        'AquaPure makes a 500-litre-per-hour treatment unit for village water points that runs on solar and uses replaceable cartridges a local operator can swap without a technician visit. Revenue comes from cartridge sales, not the hardware.',
      website: 'https://aquapure.in',
      city: 'Ahmedabad',
      foundedYear: 2025,
      logoSeed: 'AP',
      teamMembers: [
        { name: 'Nandini Rao', role: 'Founder' },
        { name: 'Jitesh Patel', role: 'Mechanical Lead' },
      ],
      mentorId: 'mnt-arjun',
      programId: 'prg-sustain',
      fundingGoal: 12_000_000,
      fundingRaised: 4_500_000,
      createdAt: t.ago(190),
    },
    {
      id: 'stp-finledger',
      founderId: 'usr-imran',
      name: 'FinLedger',
      tagline: 'Books that close themselves for small manufacturers.',
      domain: 'Financial Technology',
      sector: 'FinTech',
      stage: 'MVP',
      description:
        'FinLedger connects to the bank feeds and GST filings of small manufacturing units and produces a month-end close without a bookkeeper re-keying vouchers. Targeted at units doing ₹2–20 crore in annual turnover.',
      website: 'https://finledger.io',
      city: 'Surat',
      foundedYear: 2026,
      logoSeed: 'FL',
      teamMembers: [
        { name: 'Imran Qureshi', role: 'Founder & CEO' },
        { name: 'Ritika Shah', role: 'Product' },
      ],
      mentorId: null,
      programId: null,
      fundingGoal: 10_000_000,
      fundingRaised: 0,
      createdAt: t.ago(96),
    },
    {
      id: 'stp-eduspark',
      founderId: 'usr-tara',
      name: 'EduSpark',
      tagline: 'Lab experiments for schools that have no lab.',
      domain: 'Education Technology',
      sector: 'EdTech',
      stage: 'Prototype',
      description:
        'EduSpark ships a physics and chemistry kit paired with a tablet app that walks a class of forty through experiments in groups. Built for government schools where the practical syllabus is taught entirely from the blackboard.',
      website: 'https://eduspark.app',
      city: 'Jaipur',
      foundedYear: 2026,
      logoSeed: 'ES',
      teamMembers: [
        { name: 'Tara Sundaram', role: 'Founder' },
        { name: 'Aditya Bansal', role: 'Curriculum Design' },
      ],
      mentorId: null,
      programId: null,
      fundingGoal: 6_000_000,
      fundingRaised: 0,
      createdAt: t.ago(74),
    },
    {
      id: 'stp-carbontrace',
      founderId: 'usr-devansh',
      name: 'CarbonTrace',
      tagline: 'Scope 3 emissions data pulled from purchase orders.',
      domain: 'Climate Technology',
      sector: 'ClimateTech',
      stage: 'Prototype',
      description:
        'CarbonTrace estimates supply-chain emissions for mid-sized exporters by parsing their purchase orders and shipping documents, so a compliance report can be produced without surveying every supplier by email.',
      website: 'https://carbontrace.earth',
      city: 'Gurugram',
      foundedYear: 2026,
      logoSeed: 'CT',
      teamMembers: [
        { name: 'Devansh Kapoor', role: 'Co-founder' },
        { name: 'Shruti Iyengar', role: 'Co-founder & Data' },
      ],
      mentorId: null,
      programId: null,
      fundingGoal: 9_000_000,
      fundingRaised: 0,
      createdAt: t.ago(41),
    },
    {
      id: 'stp-routegrid',
      founderId: 'usr-fiona',
      name: 'RouteGrid',
      tagline: 'Shared middle-mile trucking for regional brands.',
      domain: 'Logistics',
      sector: 'Supply Chain',
      stage: 'Ideation',
      description:
        'RouteGrid pools partial truckloads from several regional consumer brands moving on the same corridor, so each pays for the space they use instead of booking a full vehicle at low utilisation.',
      website: 'https://routegrid.in',
      city: 'Nagpur',
      foundedYear: 2026,
      logoSeed: 'RG',
      teamMembers: [{ name: "Fiona D'Souza", role: 'Founder' }],
      mentorId: null,
      programId: null,
      fundingGoal: 5_000_000,
      fundingRaised: 0,
      createdAt: t.ago(18),
    },
    {
      id: 'stp-skillbridge',
      founderId: 'usr-manish',
      name: 'SkillBridge',
      tagline: 'A job board for blue-collar hiring.',
      domain: 'Human Resources',
      sector: 'HR Tech',
      stage: 'Ideation',
      description:
        'SkillBridge lists blue-collar vacancies and lets workers apply by missed call. The team has a working listing page and has been collecting vacancies manually from three industrial estates.',
      website: 'https://skillbridge.work',
      city: 'Ludhiana',
      foundedYear: 2025,
      logoSeed: 'SK',
      teamMembers: [{ name: 'Manish Thakur', role: 'Founder' }],
      mentorId: null,
      programId: null,
      fundingGoal: 3_000_000,
      fundingRaised: 0,
      createdAt: t.ago(120),
    },
  ];
}

/* ------------------------------------------------------------ applications */

const FORMS: Record<string, ApplicationForm> = {
  // Draft — the founder has completed steps 1–3 and stopped.
  'stp-shopthread': {
    companyName: 'ShopThread',
    domain: 'Retail Technology',
    sector: 'Commerce',
    stage: 'Prototype',
    city: 'Bengaluru',
    website: 'https://shopthread.in',
    foundedYear: 2026,
    problemStatement:
      'Independent clothing labels lose the customer the moment a garment is resold. Resale happens on general marketplaces where the label has no visibility, earns nothing, and cannot tell a returning customer from a new one.',
    targetCustomer:
      'Direct-to-consumer clothing labels doing ₹2–15 crore a year, typically 8–40 people, who already run their own online storefront and care about brand control.',
    solution:
      'A branded resale storefront the label embeds in its own site. We handle intake logistics, authentication and cleaning through partner facilities; the label sets pricing and keeps the customer data.',
    uniqueValue:
      'Existing resale platforms compete with the brand. We are white-label infrastructure that runs underneath the brand, so the label captures the second sale instead of losing it.',
    targetMarket: '',
    marketSize: '',
    competitors: '',
    businessModel: '',
    revenueStreams: '',
    pricingNotes: '',
    tractionSummary: '',
    keyMetrics: '',
    teamSummary: '',
    teamSize: 2,
    hiringPlan: '',
    fundingRequested: 0,
    fundingUse: '',
    incubationGoals: '',
  },
  'stp-nexus': {
    companyName: 'Nexus AI',
    domain: 'Artificial Intelligence & Healthcare',
    sector: 'HealthTech',
    stage: 'Early Revenue',
    city: 'Chennai',
    website: 'https://nexusai.in',
    foundedYear: 2024,
    problemStatement:
      'District hospitals capture imaging on site but a radiologist reads it days later, if at all. Treatable findings are caught late purely because of reporting latency.',
    targetCustomer:
      'District hospital administrators and owners of standalone diagnostic centres who capture 40–300 studies a day but have no resident radiologist.',
    solution:
      'An on-premise inference box that reads chest X-rays and retinal scans as they are captured and flags studies needing a specialist within the hour, with a confidence band and the regions that drove the flag.',
    uniqueValue:
      'Trained and validated on imaging from Indian district facilities rather than Western datasets, and runs without a reliable internet link.',
    targetMarket:
      'District hospitals and standalone diagnostic centres in tier-2 and tier-3 cities. 41 sites contracted, 380 in the near-term pipeline.',
    marketSize:
      'Roughly 9,000 addressable diagnostic centres nationally; at our current per-site pricing this is a ₹640 crore annual opportunity.',
    competitors:
      'Two well-funded international vendors price at roughly four times our licence and require continuous connectivity. Domestic competitors are largely teleradiology services rather than software.',
    businessModel:
      'Per-site annual licence including the inference appliance, with a usage component above a monthly study threshold.',
    revenueStreams:
      'Annual site licence (₹1.8 lakh), per-study overage above 2,000 studies a month, and a one-time integration fee for sites with an existing PACS.',
    pricingNotes:
      'Priced deliberately below the point where a site would need board approval. Overage is capped so a busy month cannot produce a shock invoice.',
    tractionSummary:
      '41 live sites, 214,000 studies read in the last twelve months, ₹1.24 crore recognised revenue, 94% renewal on the first cohort.',
    keyMetrics:
      'ARR ₹1.24 crore · 41 sites · 94% logo retention · ₹3.02 lakh average revenue per site · 11-day median deployment time.',
    teamSummary:
      'Arun Vasudevan (CEO) previously led engineering at a hospital information systems vendor. Dr. Leela Nair is a practising radiologist and serves as CMO. Sameer Joshi leads ML and has published on domain shift in medical imaging.',
    teamSize: 14,
    hiringPlan:
      'Two field engineers and a regulatory affairs manager in the next six months.',
    fundingRequested: 12_500_000,
    fundingUse:
      'Regulatory submission for two additional indications, field engineering headcount, and working capital for appliance inventory.',
    incubationGoals:
      'Structured support on the CDSCO pathway for our next two indications, and introductions to hospital networks for a multi-site validation study.',
  },
  'stp-mediqueue': {
    companyName: 'MediQueue',
    domain: 'Health Systems',
    sector: 'HealthTech',
    stage: 'MVP',
    city: 'Pune',
    website: 'https://mediqueue.health',
    foundedYear: 2025,
    problemStatement:
      'Outpatient departments issue paper tokens at 8am and patients wait all day. When a consultant is delayed, nothing re-sequences and the queue simply stalls.',
    targetCustomer:
      'Medical superintendents at mid-sized private and trust hospitals running 200–800 outpatient visits a day — the person who absorbs the complaints about waiting.',
    solution:
      'SMS-based slotting that assigns realistic arrival windows and re-sends updated times automatically when the schedule slips, driven by the consultant marking each consultation complete on a tablet.',
    uniqueValue:
      'Works over plain SMS with no patient app, and integrates with the hospital information systems already deployed rather than replacing them.',
    targetMarket:
      'Mid-sized private hospitals and trust hospitals across Maharashtra initially. Nine sites live.',
    marketSize:
      'About 21,000 hospitals in this band nationally; at our pricing the reachable segment is worth around ₹380 crore a year.',
    competitors:
      'Hospital information system vendors bundle a scheduling module, but none re-sequence dynamically. The practical competitor is the existing paper process.',
    businessModel:
      'Per-bed monthly subscription with SMS costs passed through at cost.',
    revenueStreams:
      'Monthly subscription from ₹18,000 for a 100-bed facility, plus a one-time setup and training fee.',
    pricingNotes:
      'Per-bed pricing was chosen because hospital budgets are already organised that way; per-patient pricing made procurement stall.',
    tractionSummary:
      'Nine hospitals live, average recorded wait down from 3h 10m to 1h 05m, 62,000 patients slotted last quarter, ₹30 lakh raised from an angel round.',
    keyMetrics:
      '9 sites · 62,000 patients slotted last quarter · wait time down 66% · 0 paid annual contracts to date (all sites on free pilots).',
    teamSummary:
      'Sneha Bhatt spent five years as an operations manager at a 400-bed hospital before founding MediQueue. Rohan Gupta leads backend engineering.',
    teamSize: 6,
    hiringPlan: 'Two implementation engineers to reduce deployment time.',
    fundingRequested: 5_000_000,
    fundingUse:
      'Two implementation engineers, integration work for the two dominant HIS vendors, and eighteen months of runway.',
    incubationGoals:
      'Help converting pilot sites into paid annual contracts, and access to the hospital administrator network for warm introductions.',
  },
  'stp-agrisense': {
    companyName: 'AgriSense',
    domain: 'Agriculture Technology',
    sector: 'AgriTech',
    stage: 'Early Revenue',
    city: 'Hyderabad',
    website: 'https://agrisense.co',
    foundedYear: 2024,
    problemStatement:
      'Smallholders irrigate on a fixed schedule because they have no way to know soil moisture. This wastes water and depresses yield, and existing sensors cost more than a season of income.',
    targetCustomer:
      'Farmers working two to fifteen acres of cotton, chilli or groundnut, reached through the agri-input dealer they already buy seed and fertiliser from.',
    solution:
      'A ₹2,400 soil probe reporting moisture and temperature over a low-power mesh to a village gateway, with irrigation advice delivered as a voice call in Telugu or Marathi.',
    uniqueValue:
      'An order of magnitude cheaper than imported probes, sold through dealers farmers already trust, and delivered by voice rather than an app.',
    targetMarket:
      'Telangana and Maharashtra to begin with. 1,860 probes deployed through 34 dealers.',
    marketSize:
      'About 14 million farms in the target size band across our two focus states; the near-term dealer-reachable segment is roughly ₹900 crore.',
    competitors:
      'Imported probes at ₹18,000 and up sold to corporate farms, and free government advisory SMS which is generic rather than field-specific.',
    businessModel:
      'Hardware sold at a thin margin through dealers, with a recurring seasonal advisory subscription carrying the margin.',
    revenueStreams:
      'Probe hardware at ₹2,400 (dealer keeps 20%), and a ₹600 per season advisory subscription per farm.',
    pricingNotes:
      'The probe is deliberately near cost. The business only works if season-two renewal holds above 65%.',
    tractionSummary:
      '1,860 probes deployed, ₹62 lakh cumulative revenue, 71% of first-season subscribers renewed, measured water saving of 22% in a third-party study.',
    keyMetrics:
      '1,860 probes · 34 dealers · ₹62 lakh cumulative revenue · 71% season-two renewal · 22% measured water saving.',
    teamSummary:
      'Karthik Reddy (CTO) built embedded systems at a metering company. Lakshmi Prasad runs field operations and previously managed a dealer network of 200 outlets. Vinod Kumar leads hardware.',
    teamSize: 11,
    hiringPlan: 'A production engineer and two district field officers.',
    fundingRequested: 8_000_000,
    fundingUse:
      'Tooling for injection-moulded enclosures, dealer onboarding in two new districts, and inventory finance.',
    incubationGoals:
      'Manufacturing and vendor qualification support as we move from hand-assembled units to contract manufacture at 10,000-unit scale.',
  },
  'stp-aquapure': {
    companyName: 'AquaPure',
    domain: 'Water & Sanitation',
    sector: 'CleanTech',
    stage: 'MVP',
    city: 'Ahmedabad',
    website: 'https://aquapure.in',
    foundedYear: 2025,
    problemStatement:
      'Village water treatment units are installed by projects and then fail within a year because servicing depends on a technician who never comes back.',
    targetCustomer:
      'Gram panchayat water committees, and the CSR programme managers who fund the installation and are measured on whether it still works a year later.',
    solution:
      'A 500 litre-per-hour solar treatment unit built around a replaceable cartridge that a trained local operator swaps in ten minutes without tools or a service call.',
    uniqueValue:
      'The maintenance model is the product. We sell cartridges on a recurring basis, so our revenue depends on units staying alive rather than on installation counts.',
    targetMarket:
      'Gujarat and Rajasthan initially. 23 units installed across 19 villages.',
    marketSize:
      'Approximately 190,000 village water points in our two focus states currently without treatment; the cartridge annuity alone is worth around ₹450 crore a year at full penetration.',
    competitors:
      'Community RO plants requiring a full-time operator and grid power, and imported UV systems with no local cartridge supply chain.',
    businessModel:
      'Hardware sold once, typically CSR-funded, with an annual cartridge supply contract carrying the recurring revenue.',
    revenueStreams:
      'Treatment unit at ₹1.4 lakh, and a ₹3,200 cartridge replaced roughly every two months under an annual supply contract.',
    pricingNotes:
      'Cartridge price is set so a panchayat can fund it from existing water tariff collection without a new budget line.',
    tractionSummary:
      '23 units installed, 21 still operating after twelve months, ₹18 lakh in cartridge revenue, two CSR partners contracted for the next 40 units.',
    keyMetrics:
      '23 units installed · 91% still operating at 12 months · ₹18 lakh cartridge revenue · 2 CSR partners contracted for 40 more units.',
    teamSummary:
      'Nandini Rao is a water engineer who spent seven years with a rural sanitation NGO. Jitesh Patel leads mechanical design and previously worked in pump manufacturing.',
    teamSize: 7,
    hiringPlan: 'A second mechanical engineer and a field training coordinator.',
    fundingRequested: 7_000_000,
    fundingUse:
      'Cartridge production line, certification testing, and field technician training for two new districts.',
    incubationGoals:
      'Support on contract manufacturing and BOM cost reduction, plus introductions to CSR programmes with water mandates.',
  },
  'stp-finledger': {
    companyName: 'FinLedger',
    domain: 'Financial Technology',
    sector: 'FinTech',
    stage: 'MVP',
    city: 'Surat',
    website: 'https://finledger.io',
    foundedYear: 2026,
    problemStatement:
      'Small manufacturing units close their books six to ten weeks late because a part-time bookkeeper re-keys bank statements and vouchers by hand. Owners run the business on a bank balance rather than a P&L.',
    targetCustomer:
      'Owner-operators of manufacturing units doing ₹2–20 crore turnover, and the chartered accountants who serve twenty or thirty of them.',
    solution:
      'FinLedger ingests bank feeds and GST filings directly, matches them against purchase and sales registers, and produces a month-end close with only exceptions surfaced for human review.',
    uniqueValue:
      'Built around the GST return as the source of truth rather than as an afterthought, which removes most of the reconciliation work competitors leave to the user.',
    targetMarket:
      'Starting with the textile cluster in Surat. 34 units on a paid pilot.',
    marketSize:
      'Roughly 640,000 units nationally in this turnover band; the segment is worth about ₹1,900 crore annually at our pricing.',
    competitors:
      'Incumbent accounting packages that are essentially data-entry tools, and cloud bookkeeping services that are people-heavy and priced accordingly.',
    businessModel:
      'Flat monthly subscription per legal entity, sold direct and through chartered accountants as a reseller channel.',
    revenueStreams:
      '₹4,500 per month per entity direct, with a 30% discount for CA firms managing five or more clients.',
    pricingNotes:
      'Flat rather than transaction-based pricing, because owners reject anything that scales with their turnover.',
    tractionSummary:
      '34 paying pilots at ₹4,500 a month, average close time reduced from 47 days to 9, two CA firms reselling to their client base.',
    keyMetrics:
      '34 paying entities · ₹1.53 lakh MRR · close time down from 47 to 9 days · 2 CA firms reselling · 0 churn in 6 months.',
    teamSummary:
      'Imran Qureshi qualified as a chartered accountant and spent four years auditing textile units before founding FinLedger. Ritika Shah leads product and was previously a product manager at a payments company.',
    teamSize: 5,
    hiringPlan:
      'Two backend engineers and a channel sales lead for the CA network.',
    fundingRequested: 6_000_000,
    fundingUse:
      'Two backend engineers, security audit and SOC 2 readiness, and sales headcount for the CA reseller channel.',
    incubationGoals:
      'Guidance on pricing and CAC payback for the reseller channel, and help structuring the compliance posture banks will ask for.',
  },
  'stp-eduspark': {
    companyName: 'EduSpark',
    domain: 'Education Technology',
    sector: 'EdTech',
    stage: 'Prototype',
    city: 'Jaipur',
    website: 'https://eduspark.app',
    foundedYear: 2026,
    problemStatement:
      'Government schools teach the practical physics and chemistry syllabus from the blackboard because there is no lab, no consumables budget and often no trained lab assistant.',
    targetCustomer:
      'State education departments and district education officers who procure on behalf of schools. The teacher is the user but never the buyer.',
    solution:
      'A reusable kit covering 24 syllabus experiments plus a tablet app that sequences a class of forty through them in groups of five, with the teacher facilitating rather than demonstrating.',
    uniqueValue:
      'Designed for one kit per classroom rather than one per student, which is the only price point at which a state education budget can adopt it.',
    targetMarket:
      'State-board secondary schools in Rajasthan and Madhya Pradesh. Piloted in 6 schools with 340 students.',
    marketSize:
      'About 120,000 government secondary schools nationally, though procurement is state-gated and slow.',
    competitors:
      'Established lab equipment suppliers who sell to private schools at higher price points, and video content platforms that do not address the practical syllabus.',
    businessModel:
      'Kit sold once per classroom with an annual consumables and content subscription, sold through state procurement and CSR.',
    revenueStreams:
      'Classroom kit at ₹35,000, and a ₹6,000 annual consumables and content subscription.',
    pricingNotes:
      'We have not yet tested whether a district will pay these prices; all six pilots were donated.',
    tractionSummary:
      'Six pilot schools, 340 students, measured improvement on practical assessments in a small sample. No revenue yet; pilots were donated.',
    keyMetrics:
      '6 schools · 340 students · 0 paid orders · ₹0 revenue · practical assessment scores up 14 points in a 340-student sample.',
    teamSummary:
      'Tara Sundaram taught secondary physics for six years before founding EduSpark. Aditya Bansal designs curriculum and previously worked at a textbook publisher.',
    teamSize: 4,
    hiringPlan:
      'A pilot manager to run state conversations. No technical hire planned yet.',
    fundingRequested: 4_000_000,
    fundingUse:
      'Tooling for the kit enclosure, content build-out to the full syllabus, and a pilot manager to run state conversations.',
    incubationGoals:
      'Help navigating state education procurement, and product guidance on narrowing scope to something a single state can actually buy.',
  },
  'stp-carbontrace': {
    companyName: 'CarbonTrace',
    domain: 'Climate Technology',
    sector: 'ClimateTech',
    stage: 'Prototype',
    city: 'Gurugram',
    website: 'https://carbontrace.earth',
    foundedYear: 2026,
    problemStatement:
      'Mid-sized exporters are being asked by European buyers for supply-chain emissions data. They currently produce it by emailing spreadsheets to suppliers, which takes a quarter and yields unusable numbers.',
    targetCustomer:
      'Compliance and export managers at Indian exporters with significant European revenue, who have a buyer deadline and no in-house sustainability team.',
    solution:
      'CarbonTrace parses purchase orders, invoices and shipping documents the exporter already has, maps line items to emission factors, and produces a defensible Scope 3 estimate with a stated confidence range.',
    uniqueValue:
      'Starts from documents the company already holds rather than from a supplier survey, so a first report takes days instead of months.',
    targetMarket:
      'Indian exporters in textiles, auto components and chemicals with €40m+ of European revenue. 11 companies in a paid discovery engagement.',
    marketSize:
      'Roughly 4,000 Indian exporters will fall under CBAM or CSRD reporting obligations by 2028.',
    competitors:
      'Global carbon accounting platforms priced for large enterprises, and consultancies delivering the same work as a bespoke project.',
    businessModel:
      'Annual platform subscription plus a per-report fee for submissions that require assurance.',
    revenueStreams:
      'Platform fee of ₹9 lakh a year, and ₹1.5 lakh per assured report.',
    pricingNotes:
      'Anchored below the cost of the consultancy engagement it replaces, which is typically ₹25–40 lakh.',
    tractionSummary:
      '11 paid discovery engagements at ₹75,000 each, working parser for three document types, no production deployment yet.',
    keyMetrics:
      '11 paid discovery engagements · ₹8.25 lakh collected · 3 document types parsed · 0 production deployments.',
    teamSummary:
      'Devansh Kapoor spent five years in trade compliance at a logistics company. Shruti Iyengar leads data and previously built document extraction systems at a fintech.',
    teamSize: 5,
    hiringPlan: 'Two backend engineers and a part-time compliance advisor.',
    fundingRequested: 7_500_000,
    fundingUse:
      'Engineering to move from prototype parsers to a production pipeline, emission factor licensing, and a compliance advisor.',
    incubationGoals:
      'Regulatory clarity on what European buyers will actually accept as assured data, and introductions to export promotion councils.',
  },
  'stp-routegrid': {
    companyName: 'RouteGrid',
    domain: 'Logistics',
    sector: 'Supply Chain',
    stage: 'Ideation',
    city: 'Nagpur',
    website: 'https://routegrid.in',
    foundedYear: 2026,
    problemStatement:
      'Regional consumer brands book full trucks at 55–65% utilisation because there is no practical way to share a vehicle with another shipper moving on the same corridor on the same day.',
    targetCustomer:
      'Dispatch managers at regional food and personal care brands moving 2–10 tonnes a day, who currently book through a commission agent.',
    solution:
      'A booking layer that pools partial loads from several brands onto one vehicle per corridor per day, with each shipper billed for the space and weight they actually use.',
    uniqueValue:
      'Corridor-first rather than marketplace-first: we commit to a fixed daily departure on a small number of routes so shippers can plan around it.',
    targetMarket:
      'The Nagpur–Pune and Nagpur–Raipur corridors to begin with.',
    marketSize:
      'Two initial corridors represent roughly ₹200 crore of annual freight spend; the model extends to about 40 comparable corridors.',
    competitors:
      'Full-truckload marketplaces that match shippers to vehicles but do not pool, and traditional transport commission agents.',
    businessModel:
      'Take rate on freight value, with a minimum charge per booking to make small loads viable.',
    revenueStreams: 'A 12% take rate on freight value, minimum ₹1,800 per booking.',
    pricingNotes:
      'The take rate is assumed, not tested. It has to clear the cost of guaranteeing the vehicle, which is the part we are least sure of.',
    tractionSummary:
      'Pre-launch. Letters of intent from four brands covering an estimated 14 tonnes a day. No vehicle has moved yet.',
    keyMetrics:
      '4 letters of intent · ~14 tonnes/day committed on paper · 0 shipments moved · ₹0 revenue.',
    teamSummary:
      "Fiona D'Souza worked in regional distribution for a packaged foods company for eight years. Currently the sole founder; actively recruiting an operations co-founder.",
    teamSize: 1,
    hiringPlan:
      'An operations co-founder is the first and most urgent hire; the model does not run without one.',
    fundingRequested: 3_500_000,
    fundingUse:
      'Working capital to guarantee vehicle bookings for the first two corridors, and an operations hire.',
    incubationGoals:
      'Help finding an operations co-founder, and structured guidance on the working capital model before we commit to vehicle guarantees.',
  },
  'stp-skillbridge': {
    companyName: 'SkillBridge',
    domain: 'Human Resources',
    sector: 'HR Tech',
    stage: 'Ideation',
    city: 'Ludhiana',
    website: 'https://skillbridge.work',
    foundedYear: 2025,
    problemStatement:
      'Blue-collar hiring in industrial estates happens through word of mouth and gate notices. Workers travel between factories looking for openings.',
    targetCustomer: 'Factory HR staff and job-seeking workers in industrial estates.',
    solution:
      'A listings page where factories post vacancies and workers register interest by giving a missed call, after which a call centre agent connects them.',
    uniqueValue:
      'Missed-call entry means no smartphone or literacy requirement.',
    targetMarket: 'Industrial estates around Ludhiana.',
    marketSize: 'Large, but we have not sized it in a defensible way yet.',
    competitors:
      'Several well-funded national platforms already operate a near-identical missed-call model with large call centre operations.',
    businessModel:
      'Intended to charge employers per successful placement. Not yet tested; no employer has paid.',
    revenueStreams: 'Placement fee, amount not yet set.',
    pricingNotes: 'Not determined.',
    tractionSummary:
      'A working listings page, roughly 90 vacancies collected manually by visiting three industrial estates, 140 worker registrations, no placements and no revenue.',
    keyMetrics:
      '90 vacancies listed · 140 worker registrations · 0 placements · ₹0 revenue.',
    teamSummary:
      'Manish Thakur has a background in recruitment agency work. Sole founder with no technical co-founder; the listings page was built by a freelancer.',
    teamSize: 1,
    hiringPlan: 'Call centre staff once funded.',
    fundingRequested: 2_500_000,
    fundingUse: 'Call centre staff and marketing.',
    incubationGoals: 'Funding and introductions to employers.',
  },
};

interface HistoryPlan {
  status: Application['status'];
  daysAgo: number;
  byName: string;
  byRole: Application['history'][number]['byRole'];
  note: string | null;
}

interface AppPlan {
  startupId: string;
  founderId: string;
  status: Application['status'];
  completedSteps: number;
  createdDaysAgo: number;
  submittedDaysAgo: number | null;
  programId: string | null;
  decisionNote: string | null;
  history: HistoryPlan[];
}

const APP_PLANS: AppPlan[] = [
  {
    startupId: 'stp-shopthread',
    founderId: 'usr-priya',
    status: 'DRAFT',
    completedSteps: 3,
    createdDaysAgo: 3,
    submittedDaysAgo: null,
    programId: null,
    decisionNote: null,
    history: [
      { status: 'DRAFT', daysAgo: 3, byName: 'Priya Raghunathan', byRole: 'FOUNDER', note: 'Started application.' },
    ],
  },
  {
    startupId: 'stp-nexus',
    founderId: 'usr-arun',
    status: 'ACCEPTED',
    completedSteps: 8,
    createdDaysAgo: 300,
    submittedDaysAgo: 296,
    programId: 'prg-ignite',
    decisionNote:
      'Accepted into Ignite Cohort 2026. Strongest application in the cycle; assigned to Rahul Sharma for regulatory guidance.',
    history: [
      { status: 'DRAFT', daysAgo: 300, byName: 'Arun Vasudevan', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 296, byName: 'Arun Vasudevan', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 292, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Assigned for evaluation.' },
      { status: 'EVALUATED', daysAgo: 288, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 87.5% — High Potential.' },
      { status: 'SHORTLISTED', daysAgo: 286, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'ACCEPTED', daysAgo: 282, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Offer accepted by founder.' },
    ],
  },
  {
    startupId: 'stp-mediqueue',
    founderId: 'usr-sneha',
    status: 'ACCEPTED',
    completedSteps: 8,
    createdDaysAgo: 262,
    submittedDaysAgo: 258,
    programId: 'prg-ignite',
    decisionNote: 'Accepted into Ignite Cohort 2026.',
    history: [
      { status: 'DRAFT', daysAgo: 262, byName: 'Sneha Bhatt', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 258, byName: 'Sneha Bhatt', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 254, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'EVALUATED', daysAgo: 250, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 71.3% — Promising.' },
      { status: 'SHORTLISTED', daysAgo: 248, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'ACCEPTED', daysAgo: 244, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
    ],
  },
  {
    startupId: 'stp-agrisense',
    founderId: 'usr-karthik',
    status: 'ACCEPTED',
    completedSteps: 8,
    createdDaysAgo: 234,
    submittedDaysAgo: 230,
    programId: 'prg-ignite',
    decisionNote: 'Accepted into Ignite Cohort 2026.',
    history: [
      { status: 'DRAFT', daysAgo: 234, byName: 'Karthik Reddy', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 230, byName: 'Karthik Reddy', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 226, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'EVALUATED', daysAgo: 222, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 82.5% — High Potential.' },
      { status: 'SHORTLISTED', daysAgo: 220, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'ACCEPTED', daysAgo: 216, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
    ],
  },
  {
    startupId: 'stp-aquapure',
    founderId: 'usr-nandini',
    status: 'ACCEPTED',
    completedSteps: 8,
    createdDaysAgo: 184,
    submittedDaysAgo: 180,
    programId: 'prg-sustain',
    decisionNote: 'Accepted into Sustain Track 2026.',
    history: [
      { status: 'DRAFT', daysAgo: 184, byName: 'Nandini Rao', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 180, byName: 'Nandini Rao', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 176, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'EVALUATED', daysAgo: 172, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 73.8% — Promising.' },
      { status: 'SHORTLISTED', daysAgo: 170, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'ACCEPTED', daysAgo: 166, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
    ],
  },
  {
    startupId: 'stp-finledger',
    founderId: 'usr-imran',
    status: 'SHORTLISTED',
    completedSteps: 8,
    createdDaysAgo: 34,
    submittedDaysAgo: 30,
    programId: null,
    decisionNote: null,
    history: [
      { status: 'DRAFT', daysAgo: 34, byName: 'Imran Qureshi', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 30, byName: 'Imran Qureshi', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 24, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'EVALUATED', daysAgo: 18, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 76.3% — Promising.' },
      { status: 'SHORTLISTED', daysAgo: 16, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Awaiting mentor availability before offer.' },
    ],
  },
  {
    startupId: 'stp-eduspark',
    founderId: 'usr-tara',
    status: 'EVALUATED',
    completedSteps: 8,
    createdDaysAgo: 28,
    submittedDaysAgo: 25,
    programId: null,
    decisionNote: null,
    history: [
      { status: 'DRAFT', daysAgo: 28, byName: 'Tara Sundaram', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 25, byName: 'Tara Sundaram', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 19, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'EVALUATED', daysAgo: 12, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 58.8% — Needs Improvement.' },
    ],
  },
  {
    startupId: 'stp-carbontrace',
    founderId: 'usr-devansh',
    status: 'UNDER_REVIEW',
    completedSteps: 8,
    createdDaysAgo: 15,
    submittedDaysAgo: 11,
    programId: null,
    decisionNote: null,
    history: [
      { status: 'DRAFT', daysAgo: 15, byName: 'Devansh Kapoor', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 11, byName: 'Devansh Kapoor', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 6, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Queued for the August evaluation panel.' },
    ],
  },
  {
    startupId: 'stp-routegrid',
    founderId: 'usr-fiona',
    status: 'SUBMITTED',
    completedSteps: 8,
    createdDaysAgo: 9,
    submittedDaysAgo: 4,
    programId: null,
    decisionNote: null,
    history: [
      { status: 'DRAFT', daysAgo: 9, byName: "Fiona D'Souza", byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 4, byName: "Fiona D'Souza", byRole: 'FOUNDER', note: null },
    ],
  },
  {
    startupId: 'stp-skillbridge',
    founderId: 'usr-manish',
    status: 'REJECTED',
    completedSteps: 8,
    createdDaysAgo: 110,
    submittedDaysAgo: 106,
    programId: null,
    decisionNote:
      'Not accepted this cycle. The model is already served by several well-capitalised national platforms and the application did not identify a defensible wedge. Encouraged to reapply with evidence of paid employer demand in a specific cluster.',
    history: [
      { status: 'DRAFT', daysAgo: 110, byName: 'Manish Thakur', byRole: 'FOUNDER', note: null },
      { status: 'SUBMITTED', daysAgo: 106, byName: 'Manish Thakur', byRole: 'FOUNDER', note: null },
      { status: 'UNDER_REVIEW', daysAgo: 100, byName: 'Kavita Menon', byRole: 'ADMIN', note: null },
      { status: 'EVALUATED', daysAgo: 94, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Scored 36.3% — Not Recommended.' },
      { status: 'REJECTED', daysAgo: 92, byName: 'Kavita Menon', byRole: 'ADMIN', note: 'Feedback shared with founder.' },
    ],
  },
];

function buildApplications(t: Clock): Application[] {
  return APP_PLANS.map((plan) => {
    const id = `app-${plan.startupId.replace('stp-', '')}`;
    const history: StatusEvent[] = plan.history.map((h, i) => ({
      id: `${id}-h${i + 1}`,
      status: h.status,
      at: t.ago(h.daysAgo),
      byName: h.byName,
      byRole: h.byRole,
      note: h.note,
    }));

    const hasEvaluation = plan.history.some((h) => h.status === 'EVALUATED');

    return {
      id,
      startupId: plan.startupId,
      founderId: plan.founderId,
      status: plan.status,
      form: FORMS[plan.startupId],
      completedSteps: plan.completedSteps,
      programId: plan.programId,
      evaluationId: hasEvaluation
        ? `evl-${plan.startupId.replace('stp-', '')}`
        : null,
      decisionNote: plan.decisionNote,
      history,
      createdAt: t.ago(plan.createdDaysAgo),
      updatedAt: t.ago(plan.history[plan.history.length - 1].daysAgo),
      submittedAt:
        plan.submittedDaysAgo === null ? null : t.ago(plan.submittedDaysAgo),
    };
  });
}

/* ------------------------------------------------------------- evaluations */

interface EvalPlan {
  key: string;
  scores: [number, number, number, number, number, number, number, number];
  strengths: string;
  concerns: string;
  recommendation: string;
  daysAgo: number;
}

const EVAL_PLANS: EvalPlan[] = [
  {
    key: 'nexus',
    scores: [9, 10, 8, 9, 9, 8, 9, 8],
    strengths:
      'Validated on locally captured imaging, which is the difference between a demo and a deployable product here. Real recognised revenue and a 94% renewal rate on the first cohort. Clinical leadership sits inside the founding team rather than on an advisory board.',
    concerns:
      'Regulatory pathway for the next two indications is the binding constraint on growth, and appliance inventory ties up working capital at a rate that will strain the balance sheet before the next raise.',
    recommendation:
      'Accept. Assign a mentor with regulatory depth and prioritise the multi-site validation study.',
    daysAgo: 288,
  },
  {
    key: 'mediqueue',
    scores: [6, 9, 8, 7, 6, 7, 7, 7],
    strengths:
      'The measured drop in patient wait time from 3h 10m to 1h 05m is a genuinely strong outcome, and the founder has operated inside the customer she is selling to.',
    concerns:
      'Nine sites are live but every one is a free pilot — willingness to pay is entirely unproven. Integration with the two dominant HIS vendors is a hard dependency that has not been started.',
    recommendation:
      'Accept. Focus the engagement on pilot-to-contract conversion rather than on product.',
    daysAgo: 250,
  },
  {
    key: 'agrisense',
    scores: [8, 9, 9, 8, 7, 8, 9, 8],
    strengths:
      'Price point is the insight: at ₹2,400 the probe is affordable to the segment that actually needs it. Selling through existing dealers avoids the distribution problem that kills most agri hardware. Third-party measured water saving of 22%.',
    concerns:
      'Currently hand-assembled. Moving to contract manufacture at 10,000-unit scale is a different discipline and the team has not done it before.',
    recommendation:
      'Accept. Manufacturing and vendor qualification support should be the core of the engagement.',
    daysAgo: 222,
  },
  {
    key: 'aquapure',
    scores: [7, 9, 7, 7, 7, 8, 6, 8],
    strengths:
      'Building the business around cartridge annuity rather than installation counts aligns revenue with units staying alive, which is precisely the failure mode of every predecessor. 21 of 23 units still running after a year.',
    concerns:
      'Two-person technical team for a hardware product with a certification burden. CSR funding dependence makes the revenue lumpy and politically exposed.',
    recommendation:
      'Accept into the Sustain track. Prioritise a second technical hire and BOM cost work.',
    daysAgo: 172,
  },
  {
    key: 'finledger',
    scores: [7, 8, 8, 8, 8, 8, 6, 8],
    strengths:
      'Treating the GST return as the source of truth is a real technical insight that removes most of the reconciliation burden. 34 paying pilots and zero churn in six months is meaningful validation at this stage, and the CA reseller channel is capital-efficient.',
    concerns:
      'Five-person team with a single backend engineer against a product that will need a security audit and bank-grade compliance. Founder is a domain expert but has not built a software company before.',
    recommendation:
      'Shortlist. Strong on substance; hold pending a mentor with fintech go-to-market depth being available.',
    daysAgo: 18,
  },
  {
    key: 'eduspark',
    scores: [6, 8, 6, 5, 4, 5, 6, 7],
    strengths:
      'The founder taught the subject for six years and the one-kit-per-classroom decision shows she understands the budget reality. Early practical assessment results are encouraging.',
    concerns:
      'No revenue and pilots were donated, so willingness to pay is entirely untested — the application says so directly. State procurement is a long, opaque sales cycle that a four-person team with no pilot manager is not resourced to run. Scalability is limited by a physical kit with tooling costs not yet incurred.',
    recommendation:
      'Needs improvement. Invite to resubmit after securing one paid district-level order.',
    daysAgo: 12,
  },
  {
    key: 'skillbridge',
    scores: [3, 6, 4, 4, 3, 3, 3, 3],
    strengths:
      'Missed-call entry correctly removes the smartphone and literacy barrier, and 140 worker registrations were collected without any marketing spend.',
    concerns:
      'Several well-funded national platforms already run an identical model at scale, which the application itself acknowledges. No placements, no revenue, no pricing set and no employer has agreed to pay. Sole non-technical founder with the product built by a freelancer.',
    recommendation:
      'Not recommended for this cycle. Reapply with evidence of paid employer demand in a specific cluster.',
    daysAgo: 94,
  },
];

function buildEvaluations(t: Clock): Evaluation[] {
  const criteriaOrder = [
    'innovation',
    'problemRelevance',
    'solutionFeasibility',
    'marketPotential',
    'scalability',
    'businessModel',
    'teamStrength',
    'impact',
  ] as const;

  return EVAL_PLANS.map((plan) =>
    buildEvaluation({
      id: `evl-${plan.key}`,
      applicationId: `app-${plan.key}`,
      startupId: `stp-${plan.key}`,
      evaluatorId: 'usr-kavita',
      evaluatorName: 'Kavita Menon',
      scores: criteriaOrder.reduce(
        (acc, key, i) => {
          acc[key] = plan.scores[i];
          return acc;
        },
        {} as Evaluation['scores'],
      ),
      strengths: plan.strengths,
      concerns: plan.concerns,
      recommendation: plan.recommendation,
      createdAt: t.ago(plan.daysAgo),
    }),
  );
}

/* -------------------------------------------------------------- milestones */

interface MilestonePlan {
  id: string;
  startupId: string;
  title: string;
  description: string;
  dueInDays: number;
  progress: number;
  status: Milestone['status'];
  byId: string;
  byName: string;
  createdDaysAgo: number;
  completedDaysAgo: number | null;
}

const MILESTONE_PLANS: MilestonePlan[] = [
  {
    id: 'mls-nexus-1',
    startupId: 'stp-nexus',
    title: 'Complete CDSCO dossier for indication two',
    description:
      'Assemble the clinical evidence package and predicate device comparison for the second indication, ready for submission.',
    dueInDays: -40,
    progress: 100,
    status: 'COMPLETED',
    byId: 'mnt-rahul',
    byName: 'Rahul Sharma',
    createdDaysAgo: 140,
    completedDaysAgo: 44,
  },
  {
    id: 'mls-nexus-2',
    startupId: 'stp-nexus',
    title: 'Multi-site validation study — enrol 4 hospitals',
    description:
      'Sign study agreements with four hospital sites and begin prospective data collection for the validation study.',
    dueInDays: 22,
    progress: 60,
    status: 'IN_PROGRESS',
    byId: 'mnt-rahul',
    byName: 'Rahul Sharma',
    createdDaysAgo: 70,
    completedDaysAgo: null,
  },
  {
    id: 'mls-nexus-3',
    startupId: 'stp-nexus',
    title: 'Reduce appliance BOM by 20%',
    description:
      'Requalify the inference appliance on a lower-cost SoC to free working capital tied up in inventory.',
    dueInDays: 65,
    progress: 15,
    status: 'IN_PROGRESS',
    byId: 'mnt-rahul',
    byName: 'Rahul Sharma',
    createdDaysAgo: 30,
    completedDaysAgo: null,
  },
  {
    id: 'mls-mediqueue-1',
    startupId: 'stp-mediqueue',
    title: 'Convert three pilot sites to paid annual contracts',
    description:
      'Move the three longest-running pilots onto signed annual subscriptions at list price.',
    dueInDays: -6,
    progress: 65,
    status: 'OVERDUE',
    byId: 'mnt-ananya',
    byName: 'Ananya Iyer',
    createdDaysAgo: 84,
    completedDaysAgo: null,
  },
  {
    id: 'mls-mediqueue-2',
    startupId: 'stp-mediqueue',
    title: 'Publish the wait-time reduction case study',
    description:
      'Turn the 66% wait-time result into a two-page case study the sales conversation can lead with.',
    dueInDays: 38,
    progress: 30,
    status: 'IN_PROGRESS',
    byId: 'mnt-ananya',
    byName: 'Ananya Iyer',
    createdDaysAgo: 40,
    completedDaysAgo: null,
  },
  {
    id: 'mls-agrisense-1',
    startupId: 'stp-agrisense',
    title: 'Qualify contract manufacturer for enclosures',
    description:
      'Shortlist and audit three injection-moulding vendors, run first-article inspection and place a pilot order of 2,000 units.',
    dueInDays: -20,
    progress: 100,
    status: 'COMPLETED',
    byId: 'mnt-vikram',
    byName: 'Vikram Desai',
    createdDaysAgo: 120,
    completedDaysAgo: 24,
  },
  {
    id: 'mls-agrisense-2',
    startupId: 'stp-agrisense',
    title: 'Onboard 15 dealers across two new districts',
    description:
      'Extend the dealer network into Adilabad and Nanded with training and initial stock placement.',
    dueInDays: 30,
    progress: 45,
    status: 'IN_PROGRESS',
    byId: 'mnt-vikram',
    byName: 'Vikram Desai',
    createdDaysAgo: 55,
    completedDaysAgo: null,
  },
  {
    id: 'mls-agrisense-3',
    startupId: 'stp-agrisense',
    title: 'Season-two renewal campaign',
    description:
      'Run the advisory subscription renewal campaign for the first 1,200 farms and target 75% renewal.',
    dueInDays: 75,
    progress: 0,
    status: 'NOT_STARTED',
    byId: 'mnt-vikram',
    byName: 'Vikram Desai',
    createdDaysAgo: 12,
    completedDaysAgo: null,
  },
  {
    id: 'mls-aquapure-1',
    startupId: 'stp-aquapure',
    title: 'Complete cartridge certification testing',
    description:
      'Submit cartridges for NABL-accredited potability testing and obtain the certificate needed for CSR procurement.',
    dueInDays: 14,
    progress: 80,
    status: 'IN_PROGRESS',
    byId: 'mnt-arjun',
    byName: 'Arjun Bose',
    createdDaysAgo: 60,
    completedDaysAgo: null,
  },
  {
    id: 'mls-aquapure-2',
    startupId: 'stp-aquapure',
    title: 'Train 12 village operators in cartridge swap',
    description:
      'Run hands-on training for local operators across the 19 installed villages and issue competency cards.',
    dueInDays: 45,
    progress: 25,
    status: 'IN_PROGRESS',
    byId: 'mnt-arjun',
    byName: 'Arjun Bose',
    createdDaysAgo: 20,
    completedDaysAgo: null,
  },
];

function buildMilestones(t: Clock): Milestone[] {
  return MILESTONE_PLANS.map((p) => ({
    id: p.id,
    startupId: p.startupId,
    title: p.title,
    description: p.description,
    dueDate: p.dueInDays >= 0 ? t.ahead(p.dueInDays) : t.ago(-p.dueInDays),
    progress: p.progress,
    status: p.status,
    createdByRole: 'MENTOR' as const,
    createdById: p.byId,
    createdByName: p.byName,
    createdAt: t.ago(p.createdDaysAgo),
    lastUpdatedAt: t.ago(Math.max(0, p.createdDaysAgo - 10)),
    completedAt: p.completedDaysAgo === null ? null : t.ago(p.completedDaysAgo),
  }));
}

/* ---------------------------------------------------------------- feedback */

function buildFeedback(t: Clock): FeedbackNote[] {
  return [
    {
      id: 'fbk-1',
      startupId: 'stp-nexus',
      mentorId: 'mnt-rahul',
      mentorName: 'Rahul Sharma',
      milestoneId: 'mls-nexus-1',
      content:
        'Dossier is in good shape. The predicate comparison is thorough, but the reviewer will focus on how you handled the class imbalance in the training set — put that analysis in the main body rather than the appendix.',
      rating: 4,
      createdAt: t.ago(46),
    },
    {
      id: 'fbk-2',
      startupId: 'stp-nexus',
      mentorId: 'mnt-rahul',
      mentorName: 'Rahul Sharma',
      milestoneId: 'mls-nexus-2',
      content:
        'Two sites signed out of four and the other two are stalling on the data sharing agreement. Escalate to the medical superintendent rather than working through the radiology department — that is where these usually unblock.',
      rating: 3,
      createdAt: t.ago(12),
    },
    {
      id: 'fbk-3',
      startupId: 'stp-mediqueue',
      mentorId: 'mnt-ananya',
      mentorName: 'Ananya Iyer',
      milestoneId: 'mls-mediqueue-1',
      content:
        'The conversion milestone slipped because you are negotiating with the IT head. The person who feels the outpatient pain is the medical superintendent — restart the conversation there and lead with the wait-time numbers, not the feature list.',
      rating: 3,
      createdAt: t.ago(8),
    },
    {
      id: 'fbk-4',
      startupId: 'stp-agrisense',
      mentorId: 'mnt-vikram',
      mentorName: 'Vikram Desai',
      milestoneId: 'mls-agrisense-1',
      content:
        'Vendor selection was handled well and first-article inspection caught the wall thickness issue before tooling was cut. Hold 10% retention on the tooling payment until you have run a full 2,000-unit batch.',
      rating: 5,
      createdAt: t.ago(26),
    },
    {
      id: 'fbk-5',
      startupId: 'stp-aquapure',
      mentorId: 'mnt-arjun',
      mentorName: 'Arjun Bose',
      milestoneId: 'mls-aquapure-1',
      content:
        'Certification is on track. Start the operator training in parallel rather than waiting for the certificate — the two are not dependent and you will lose a month if you sequence them.',
      rating: 4,
      createdAt: t.ago(16),
    },
  ];
}

/* ---------------------------------------------------------------- sessions */

function buildSessions(t: Clock): MentorSession[] {
  return [
    {
      id: 'ses-1',
      startupId: 'stp-nexus',
      mentorId: 'mnt-rahul',
      title: 'Validation study — site enrolment review',
      agenda:
        'Review the two stalled data sharing agreements and agree an escalation path for each.',
      scheduledAt: t.ahead(4),
      durationMins: 45,
      status: 'SCHEDULED',
      notes: null,
      createdAt: t.ago(10),
    },
    {
      id: 'ses-2',
      startupId: 'stp-nexus',
      mentorId: 'mnt-rahul',
      title: 'Regulatory dossier walkthrough',
      agenda: 'Page-by-page review of the indication two submission package.',
      scheduledAt: t.ago(48),
      durationMins: 90,
      status: 'COMPLETED',
      notes:
        'Agreed to move the class imbalance analysis into the main body. Arun to circulate the revised draft within a week.',
      createdAt: t.ago(60),
    },
    {
      id: 'ses-3',
      startupId: 'stp-mediqueue',
      mentorId: 'mnt-ananya',
      title: 'Pilot-to-paid conversion strategy',
      agenda:
        'Rework the pitch for the medical superintendent persona and rehearse the wait-time narrative.',
      scheduledAt: t.ahead(2),
      durationMins: 60,
      status: 'SCHEDULED',
      notes: null,
      createdAt: t.ago(6),
    },
    {
      id: 'ses-4',
      startupId: 'stp-mediqueue',
      mentorId: 'mnt-ananya',
      title: 'Pricing and packaging review',
      agenda:
        'Test whether per-bed pricing survives contact with a 600-bed hospital, and set the floor for discounting.',
      scheduledAt: t.ago(22),
      durationMins: 60,
      status: 'COMPLETED',
      notes:
        'Held per-bed pricing but introduced a 3-year commitment discount. Sneha to re-quote the two largest pilots on the new structure.',
      createdAt: t.ago(30),
    },
    {
      id: 'ses-5',
      startupId: 'stp-agrisense',
      mentorId: 'mnt-vikram',
      title: 'Dealer expansion planning',
      agenda: 'District sequencing and stock placement for Adilabad and Nanded.',
      scheduledAt: t.ahead(9),
      durationMins: 60,
      status: 'SCHEDULED',
      notes: null,
      createdAt: t.ago(5),
    },
    {
      id: 'ses-6',
      startupId: 'stp-aquapure',
      mentorId: 'mnt-arjun',
      title: 'BOM cost reduction workshop',
      agenda:
        'Line-by-line BOM review targeting a 15% reduction on the treatment unit.',
      scheduledAt: t.ago(20),
      durationMins: 120,
      status: 'COMPLETED',
      notes:
        'Identified ₹9,400 of addressable cost, mostly in the pump assembly and enclosure. Nandini to get quotes from two alternate pump suppliers.',
      createdAt: t.ago(35),
    },
  ];
}

/* ------------------------------------------------------ funding & resources */

function buildFundingRequests(t: Clock): FundingRequest[] {
  return [
    {
      id: 'fnd-1',
      startupId: 'stp-shopthread',
      amount: 400_000,
      category: 'Prototype Grant',
      purpose:
        'Build the intake and authentication workflow prototype with a partner cleaning facility, covering three months of facility time.',
      status: 'PENDING',
      requestedAt: t.ago(2),
      decidedAt: null,
      decidedBy: null,
      note: null,
      disbursed: false,
    },
    {
      id: 'fnd-2',
      startupId: 'stp-nexus',
      amount: 2_500_000,
      category: 'Working Capital',
      purpose:
        'Appliance inventory for the next 30 site deployments, repaid against licence collections.',
      status: 'APPROVED',
      requestedAt: t.ago(72),
      decidedAt: t.ago(65),
      decidedBy: 'Kavita Menon',
      note: 'Approved against the signed pipeline. Disbursed in two tranches.',
      disbursed: true,
    },
    {
      id: 'fnd-3',
      startupId: 'stp-agrisense',
      amount: 1_800_000,
      category: 'Equipment',
      purpose:
        'Injection moulding tooling for the probe enclosure, amortised over the first 40,000 units.',
      status: 'APPROVED',
      requestedAt: t.ago(96),
      decidedAt: t.ago(88),
      decidedBy: 'Kavita Menon',
      note: 'Approved. Retention of 10% held pending a full production batch.',
      disbursed: true,
    },
    {
      id: 'fnd-4',
      startupId: 'stp-aquapure',
      amount: 900_000,
      category: 'Seed Grant',
      purpose:
        'NABL certification testing fees and the first cartridge production run.',
      status: 'PENDING',
      requestedAt: t.ago(9),
      decidedAt: null,
      decidedBy: null,
      note: null,
      disbursed: false,
    },
    {
      id: 'fnd-5',
      startupId: 'stp-mediqueue',
      amount: 650_000,
      category: 'Working Capital',
      purpose: 'Two implementation engineers for six months.',
      status: 'PENDING',
      requestedAt: t.ago(5),
      decidedAt: null,
      decidedBy: null,
      note: null,
      disbursed: false,
    },
    {
      id: 'fnd-6',
      startupId: 'stp-mediqueue',
      amount: 300_000,
      category: 'Travel & Events',
      purpose: 'Booth and travel for the hospital administrators conference.',
      status: 'REJECTED',
      requestedAt: t.ago(52),
      decidedAt: t.ago(47),
      decidedBy: 'Kavita Menon',
      note:
        'Declined for this quarter. Conference spend is hard to justify before pilot conversion is proven; revisit after three paid contracts.',
      disbursed: false,
    },
  ];
}

function buildResourceRequests(t: Clock): ResourceRequest[] {
  return [
    {
      id: 'res-1',
      startupId: 'stp-shopthread',
      resourceType: 'Office Desk',
      title: 'Two desks in the co-working floor',
      details:
        'Founder and engineering lead need permanent seating from the start of next month.',
      quantity: 2,
      status: 'PENDING',
      requestedAt: t.ago(2),
      decidedAt: null,
      decidedBy: null,
      note: null,
    },
    {
      id: 'res-2',
      startupId: 'stp-nexus',
      resourceType: 'Cloud Credits',
      title: 'GPU credits for model retraining',
      details:
        'Retraining for the second indication needs roughly 900 GPU hours over six weeks.',
      quantity: 1,
      status: 'APPROVED',
      requestedAt: t.ago(58),
      decidedAt: t.ago(55),
      decidedBy: 'Kavita Menon',
      note: 'Approved under the cloud partner programme.',
    },
    {
      id: 'res-3',
      startupId: 'stp-agrisense',
      resourceType: 'Prototyping Equipment',
      title: 'Environmental chamber access',
      details:
        'Humidity and temperature cycling for probe enclosure validation, roughly 40 hours.',
      quantity: 1,
      status: 'APPROVED',
      requestedAt: t.ago(70),
      decidedAt: t.ago(66),
      decidedBy: 'Kavita Menon',
      note: 'Booked into the shared hardware lab schedule.',
    },
    {
      id: 'res-4',
      startupId: 'stp-aquapure',
      resourceType: 'Lab Space',
      title: 'Wet lab bench for cartridge testing',
      details:
        'Ongoing bench access for water quality testing, three days a week.',
      quantity: 1,
      status: 'PENDING',
      requestedAt: t.ago(7),
      decidedAt: null,
      decidedBy: null,
      note: null,
    },
    {
      id: 'res-5',
      startupId: 'stp-finledger',
      resourceType: 'Legal Advisory',
      title: 'Data processing agreement review',
      details:
        'Need counsel to review the DPA template before we sign the first CA reseller.',
      quantity: 1,
      status: 'PENDING',
      requestedAt: t.ago(4),
      decidedAt: null,
      decidedBy: null,
      note: null,
    },
    {
      id: 'res-6',
      startupId: 'stp-mediqueue',
      resourceType: 'Marketing Support',
      title: 'Case study production',
      details:
        'Design and copy support for a case study on the wait-time reduction result.',
      quantity: 1,
      status: 'APPROVED',
      requestedAt: t.ago(30),
      decidedAt: t.ago(27),
      decidedBy: 'Kavita Menon',
      note: 'Assigned to the communications team.',
    },
    {
      id: 'res-7',
      startupId: 'stp-eduspark',
      resourceType: 'Prototyping Equipment',
      title: '3D printer time for kit enclosure',
      details: 'Iterating the kit tray design, roughly 20 hours of print time.',
      quantity: 1,
      status: 'REJECTED',
      requestedAt: t.ago(14),
      decidedAt: t.ago(11),
      decidedBy: 'Kavita Menon',
      note:
        'Lab resources are reserved for startups accepted into a programme. Reapply if the application is accepted.',
    },
  ];
}

/* ---------------------------------------------------------------- programs */

function buildPrograms(t: Clock): Program[] {
  return [
    {
      id: 'prg-ignite',
      name: 'Ignite Cohort 2026',
      cohort: 'Ignite / 2026',
      description:
        'Six-month core incubation track for startups with a working product and early customers. Weekly mentor sessions, milestone reviews every fortnight, and a demo day at the close.',
      focusAreas: ['HealthTech', 'AgriTech', 'Deep Tech'],
      startDate: t.ago(200),
      endDate: t.ahead(20),
      status: 'ACTIVE',
      capacity: 12,
      startupIds: ['stp-nexus', 'stp-mediqueue', 'stp-agrisense'],
    },
    {
      id: 'prg-sustain',
      name: 'Sustain Track 2026',
      cohort: 'Sustain / 2026',
      description:
        'Climate and resource-efficiency track run with a CSR funding partner. Emphasis on hardware readiness, certification and field durability.',
      focusAreas: ['CleanTech', 'ClimateTech', 'Water'],
      startDate: t.ago(160),
      endDate: t.ahead(40),
      status: 'ACTIVE',
      capacity: 8,
      startupIds: ['stp-aquapure'],
    },
    {
      id: 'prg-launchpad',
      name: 'Launchpad Winter 2025',
      cohort: 'Launchpad / 2025',
      description:
        'Pre-incubation sprint for idea-stage teams. Twelve weeks of customer discovery ending in a go / no-go review.',
      focusAreas: ['Pre-seed', 'Customer Discovery'],
      startDate: t.ago(420),
      endDate: t.ago(330),
      status: 'COMPLETED',
      capacity: 20,
      startupIds: [],
    },
    {
      id: 'prg-scale',
      name: 'Scale Cohort 2027',
      cohort: 'Scale / 2027',
      description:
        'Planned growth-stage track for graduates with over ₹1 crore in annual revenue, focused on institutional fundraising readiness.',
      focusAreas: ['Growth', 'Fundraising'],
      startDate: t.ahead(120),
      endDate: t.ahead(300),
      status: 'PLANNED',
      capacity: 10,
      startupIds: [],
    },
  ];
}

/* ----------------------------------------------- notifications & activity */

function buildNotifications(t: Clock): Notification[] {
  return [
    {
      id: 'ntf-1',
      audienceRole: 'ADMIN',
      audienceId: null,
      title: 'New application submitted',
      message: 'RouteGrid submitted an application for review.',
      type: 'APPLICATION',
      read: false,
      link: '/admin/applications',
      createdAt: t.ago(4),
    },
    {
      id: 'ntf-2',
      audienceRole: 'ADMIN',
      audienceId: null,
      title: 'Application awaiting evaluation',
      message:
        'CarbonTrace has been under review for 6 days without a scorecard.',
      type: 'APPLICATION',
      read: false,
      link: '/admin/applications',
      createdAt: t.ago(3),
    },
    {
      id: 'ntf-3',
      audienceRole: 'ADMIN',
      audienceId: null,
      title: 'Funding request pending',
      message: 'AquaPure requested ₹9,00,000 for certification testing.',
      type: 'FUNDING',
      read: false,
      link: '/admin/funding',
      createdAt: t.ago(9),
    },
    {
      id: 'ntf-4',
      audienceRole: 'ADMIN',
      audienceId: null,
      title: 'Milestone overdue',
      message:
        'MediQueue — "Convert three pilot sites to paid annual contracts" is past its due date.',
      type: 'MILESTONE',
      read: true,
      link: '/admin/startups',
      createdAt: t.ago(6),
    },
    {
      id: 'ntf-5',
      audienceRole: 'ADMIN',
      audienceId: null,
      title: 'Resource request pending',
      message: 'FinLedger requested legal advisory support.',
      type: 'RESOURCE',
      read: true,
      link: '/admin/resources',
      createdAt: t.ago(4),
    },
    {
      id: 'ntf-6',
      audienceRole: 'FOUNDER',
      audienceId: 'usr-priya',
      title: 'Finish your application',
      message:
        'Your ShopThread application is saved as a draft. Five steps remain before you can submit.',
      type: 'APPLICATION',
      read: false,
      link: '/founder/application',
      createdAt: t.ago(3),
    },
    {
      id: 'ntf-7',
      audienceRole: 'FOUNDER',
      audienceId: 'usr-priya',
      title: 'Funding request received',
      message:
        'Your ₹4,00,000 prototype grant request is with the incubation team.',
      type: 'FUNDING',
      read: false,
      link: '/founder/funding',
      createdAt: t.ago(2),
    },
    {
      id: 'ntf-8',
      audienceRole: 'FOUNDER',
      audienceId: 'usr-arun',
      title: 'New mentor feedback',
      message:
        'Rahul Sharma left feedback on your validation study milestone.',
      type: 'MENTOR',
      read: false,
      link: '/founder/progress',
      createdAt: t.ago(12),
    },
    {
      id: 'ntf-9',
      audienceRole: 'FOUNDER',
      audienceId: 'usr-sneha',
      title: 'Milestone overdue',
      message:
        '"Convert three pilot sites to paid annual contracts" was due 6 days ago.',
      type: 'MILESTONE',
      read: false,
      link: '/founder/progress',
      createdAt: t.ago(6),
    },
    {
      id: 'ntf-10',
      audienceRole: 'MENTOR',
      audienceId: 'mnt-ananya',
      title: 'Session in two days',
      message: 'Pilot-to-paid conversion strategy with MediQueue.',
      type: 'SESSION',
      read: false,
      link: '/mentor/sessions',
      createdAt: t.ago(1),
    },
    {
      id: 'ntf-11',
      audienceRole: 'MENTOR',
      audienceId: 'mnt-ananya',
      title: 'Milestone overdue',
      message:
        'MediQueue is 6 days past due on the pilot conversion milestone you set.',
      type: 'MILESTONE',
      read: false,
      link: '/mentor/startups',
      createdAt: t.ago(6),
    },
    {
      id: 'ntf-12',
      audienceRole: 'MENTOR',
      audienceId: 'mnt-rahul',
      title: 'Milestone needs review',
      message:
        'Nexus AI updated progress on "Multi-site validation study" to 60%.',
      type: 'MILESTONE',
      read: false,
      link: '/mentor/startups',
      createdAt: t.ago(11),
    },
    {
      id: 'ntf-13',
      audienceRole: 'MENTOR',
      audienceId: 'mnt-vikram',
      title: 'Milestone completed',
      message: 'AgriSense marked "Qualify contract manufacturer" complete.',
      type: 'MILESTONE',
      read: true,
      link: '/mentor/startups',
      createdAt: t.ago(24),
    },
    {
      id: 'ntf-14',
      audienceRole: 'MENTOR',
      audienceId: 'mnt-arjun',
      title: 'Session summary saved',
      message: 'Your notes from the AquaPure BOM workshop have been shared.',
      type: 'SESSION',
      read: true,
      link: '/mentor/sessions',
      createdAt: t.ago(20),
    },
    {
      id: 'ntf-15',
      audienceRole: 'INVESTOR',
      audienceId: null,
      title: 'New startups accepted',
      message:
        'Four startups have been accepted into the 2026 cohorts and are open to browse.',
      type: 'SYSTEM',
      read: false,
      link: '/investor',
      createdAt: t.ago(5),
    },
    {
      id: 'ntf-16',
      audienceRole: 'INVESTOR',
      audienceId: null,
      title: 'Funding opportunities updated',
      message: 'Three startups currently have open funding requests.',
      type: 'FUNDING',
      read: false,
      link: '/investor/opportunities',
      createdAt: t.ago(9),
    },
  ];
}

function buildActivities(t: Clock): Activity[] {
  const rows: [
    string,
    Activity['actorRole'],
    string,
    string,
    string,
    string,
    number,
  ][] = [
    ["Fiona D'Souza", 'FOUNDER', 'SUBMITTED_APPLICATION', 'Application', 'app-routegrid', 'RouteGrid submitted its incubation application.', 4],
    ['Kavita Menon', 'ADMIN', 'MOVED_TO_REVIEW', 'Application', 'app-carbontrace', 'CarbonTrace moved to Under Review.', 6],
    ['Priya Raghunathan', 'FOUNDER', 'SAVED_DRAFT', 'Application', 'app-shopthread', 'ShopThread application draft saved at step 3.', 3],
    ['Priya Raghunathan', 'FOUNDER', 'REQUESTED_FUNDING', 'FundingRequest', 'fnd-1', 'ShopThread requested ₹4,00,000 as a prototype grant.', 2],
    ['Kavita Menon', 'ADMIN', 'SHORTLISTED', 'Application', 'app-finledger', 'FinLedger shortlisted after scoring 76.3%.', 16],
    ['Kavita Menon', 'ADMIN', 'EVALUATED', 'Application', 'app-eduspark', 'EduSpark evaluated — 58.8%, Needs Improvement.', 12],
    ['Rahul Sharma', 'MENTOR', 'ADDED_FEEDBACK', 'Startup', 'stp-nexus', 'Feedback added on the multi-site validation milestone.', 12],
    ['Ananya Iyer', 'MENTOR', 'ADDED_FEEDBACK', 'Startup', 'stp-mediqueue', 'Feedback added on pilot conversion strategy.', 8],
    ['Arun Vasudevan', 'FOUNDER', 'UPDATED_MILESTONE', 'Milestone', 'mls-nexus-2', 'Progress on the validation study updated to 60%.', 11],
    ['Nandini Rao', 'FOUNDER', 'UPDATED_MILESTONE', 'Milestone', 'mls-aquapure-1', 'Cartridge certification progress updated to 80%.', 15],
    ['Arjun Bose', 'MENTOR', 'COMPLETED_SESSION', 'Session', 'ses-6', 'BOM cost reduction workshop completed with AquaPure.', 20],
    ['Ananya Iyer', 'MENTOR', 'COMPLETED_SESSION', 'Session', 'ses-4', 'Pricing and packaging review completed with MediQueue.', 22],
    ['Karthik Reddy', 'FOUNDER', 'COMPLETED_MILESTONE', 'Milestone', 'mls-agrisense-1', 'Contract manufacturer qualification marked complete.', 24],
    ['Vikram Desai', 'MENTOR', 'CREATED_MILESTONE', 'Milestone', 'mls-agrisense-3', 'Season-two renewal campaign milestone created for AgriSense.', 12],
    ['Kavita Menon', 'ADMIN', 'APPROVED_RESOURCE', 'ResourceRequest', 'res-6', 'Marketing support approved for MediQueue.', 27],
    ['Kavita Menon', 'ADMIN', 'REJECTED_FUNDING', 'FundingRequest', 'fnd-6', 'MediQueue conference travel request declined.', 47],
    ['Kavita Menon', 'ADMIN', 'ASSIGNED_MENTOR', 'Startup', 'stp-aquapure', 'Arjun Bose assigned as mentor to AquaPure.', 160],
    ['Kavita Menon', 'ADMIN', 'ACCEPTED_APPLICATION', 'Application', 'app-aquapure', 'AquaPure accepted into Sustain Track 2026.', 166],
    ['Kavita Menon', 'ADMIN', 'REJECTED_APPLICATION', 'Application', 'app-skillbridge', 'SkillBridge not accepted — 36.3%, Not Recommended.', 92],
  ];

  return rows.map(
    (
      [actorName, actorRole, action, entityType, entityId, summary, daysAgo],
      i,
    ) => ({
      id: `act-${i + 1}`,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      summary,
      createdAt: t.ago(daysAgo),
    }),
  );
}

/* ------------------------------------------------------------- identities */

const IDENTITIES: DemoIdentity[] = [
  {
    role: 'FOUNDER',
    name: 'Priya Raghunathan',
    email: 'founder@siims.demo',
    refId: 'usr-priya',
    blurb: 'Founder of ShopThread — application still in draft',
  },
  {
    role: 'ADMIN',
    name: 'Kavita Menon',
    email: 'admin@siims.demo',
    refId: 'usr-kavita',
    blurb: 'Head of Incubation — reviews, scores and accepts applications',
  },
  {
    role: 'MENTOR',
    name: 'Ananya Iyer',
    email: 'mentor@siims.demo',
    refId: 'mnt-ananya',
    blurb: 'Growth mentor — currently mentoring MediQueue',
  },
  {
    role: 'INVESTOR',
    name: 'Rohan Malhotra',
    email: 'investor@siims.demo',
    refId: 'usr-rohan',
    blurb: 'Read-only lens — browses startups and funding opportunities',
  },
];

/* ------------------------------------------------------------------- seed */

/**
 * Builds a complete demo dataset. Called on first load and by "Reset demo
 * data", so dates are always relative to the moment it runs.
 */
export function createSeedState(): AppState {
  const t = makeClock();

  return {
    version: STATE_VERSION,
    activeRole: 'FOUNDER',
    identities: IDENTITIES,
    users: buildUsers(t),
    mentors: buildMentors(t),
    startups: buildStartups(t),
    applications: buildApplications(t),
    evaluations: buildEvaluations(t),
    milestones: buildMilestones(t),
    feedback: buildFeedback(t),
    sessions: buildSessions(t),
    fundingRequests: buildFundingRequests(t),
    resourceRequests: buildResourceRequests(t),
    programs: buildPrograms(t),
    notifications: buildNotifications(t),
    activities: buildActivities(t),
  };
}
