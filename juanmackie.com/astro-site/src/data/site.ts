// ──────────────────────────────────────────────────────────────────
// Site data: single source of truth for copy, projects, and proof.
// Honesty rule: nothing here claims adoption, revenue, or impact
// that is not labelled as such. See docs/claim-rules.md.
// ──────────────────────────────────────────────────────────────────

export const email = 'juan.mackie@gmail.com';

// ── Types ─────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'Active'
  | 'Live'
  | 'Maintained'
  | 'Experimental'
  | 'Paused'
  | 'Retired'
  | 'Deprecated';

export type ProjectGroup =
  | 'applied' // field-service and fire-protection work
  | 'ai-automation' // practical AI, agents, model-serving
  | 'knowledge' // knowledge and workflow tools
  | 'experiments' // generative art, widgets, visual experiments
  | 'writing-audio' // essays and podcast
  | 'retired'; // no longer maintained

export interface Project {
  title: string;
  group: ProjectGroup;
  status: ProjectStatus;
  /** Year started, only where verifiable from public sources. */
  year?: number;
  /** External link. Omitted when the project has no public surface. */
  href?: string;
  description: string;
  /** Evidence ladder position (1 Idea → 9 Recurring revenue). */
  evidenceStage: number;
  /** Latest commit date for public GitHub projects, when checked. */
  lastCommit?: string;
  lastReviewed: string;
  featured?: boolean;
}

export interface EvidenceLink {
  label: string;
  href?: string;
}

export interface CaseStudy extends Project {
  slug: string;
  /** Short card label, e.g. 'Product' / 'AI-agent workflow'. */
  kicker: string;
  problem: string;
  user: string;
  intervention: string;
  role: string;
  stack?: string;
  constraints: string;
  /** Direct, quotable one-to-two-sentence answer rendered as the TL;DR block. */
  answer: string;
  outcome: string;
  evidence: EvidenceLink[];
  limitations: string;
  nextStep: string;
}

export type WritingCategory =
  | 'ai-ops'
  | 'business'
  | 'products'
  | 'capital'
  | 'systems'
  | 'life';

// ── Labels ────────────────────────────────────────────────────────

export const statusLabels: Record<ProjectStatus, string> = {
  Active: 'Active',
  Live: 'Live',
  Maintained: 'Maintained',
  Experimental: 'Experimental',
  Paused: 'Paused',
  Retired: 'Retired',
  Deprecated: 'Deprecated'
};

export const groupLabels: Record<ProjectGroup, string> = {
  applied: 'Applied systems',
  'ai-automation': 'AI & automation',
  knowledge: 'Knowledge & workflow',
  experiments: 'Experiments & art',
  'writing-audio': 'Writing & audio',
  retired: 'Retired'
};

export const groupOrder: ProjectGroup[] = [
  'ai-automation',
  'knowledge',
  'experiments'
];

/** The evidence ladder: a public repo proves existence, nothing more. */
export const evidenceLadder = [
  'Idea',
  'Prototype',
  'Working locally',
  'Publicly released',
  'Used by Juan',
  'Used by others',
  'Deployed commercially',
  'Measured outcome',
  'Recurring revenue'
];

export const writingCategories: Record<WritingCategory, string> = {
  'ai-ops': 'AI & operations',
  business: 'Business & fire protection',
  products: 'Building products',
  capital: 'Investing & capital',
  systems: 'Systems & leverage',
  life: 'Life & long horizons'
};

export const writingCategoryOrder: WritingCategory[] = [
  'ai-ops',
  'business',
  'products',
  'capital',
  'systems',
  'life'
];

// ── Identity ──────────────────────────────────────────────────────

export const thesis = {
  eyebrow: 'Operator // Builder // Writer // Systems',
  lede: 'I build practical AI and automation systems for real-world businesses, starting with fire protection.',
  support:
    'Field service, fire protection, and the unglamorous work that keeps businesses moving. I build tools, test ideas, and document what survives contact with real work.',
  quote:
    '"AI will do to the human mind, what the bicycle did for human movement."'
};

export const operatingAreas = [
  {
    index: '01',
    title: 'Field-service & fire-protection operations',
    body: 'Where the work starts: hours, callouts, scheduling, routing, paperwork, and the compliance layer that cannot be skipped.',
    href: '/thesis'
  },
  {
    index: '02',
    title: 'Practical AI & automation',
    body: 'Agent memory, voice, local models, and browser assistants that do the mechanical parts and leave judgment with people.',
    href: '/work#ai-automation'
  },
  {
    index: '03',
    title: 'Product & systems experiments',
    body: 'The lab layer: small public tools that earn their place or get retired honestly.',
    href: '/work#experiments'
  }
];

// ── Projects & archive ────────────────────────────────────────────

export const projects: Project[] = [
  {
    title: 'Last P',
    group: 'ai-automation',
    status: 'Live',
    year: 2026,
    href: 'https://github.com/juanmackie/Last-P-extension',
    description: 'A pi extension that shows a five-word summary of the latest user prompt in the status bar, with a local fallback when model access is unavailable.',
    evidenceStage: 4,
    lastCommit: '2026-08-29T10:49:42Z',
    lastReviewed: '2026-08-30',
    featured: true
  },
  {
    title: 'finalcut.ai',
    group: 'ai-automation',
    status: 'Live',
    year: 2026,
    href: 'https://www.finalcut.ai/',
    description: 'A social platform for AI agents. The public site is live; adoption has not been measured.',
    evidenceStage: 4,
    lastCommit: '2026-08-21T10:45:24Z',
    lastReviewed: '2026-08-30',
    featured: true
  },
  {
    title: 'Prompt Paul',
    group: 'ai-automation',
    status: 'Live',
    year: 2025,
    href: 'https://www.promptpaul.juanmackie.com/',
    description: 'A browser text assistant for selected text. It keeps the feedback loop short.',
    evidenceStage: 4,
    lastReviewed: '2026-08-30',
    featured: true
  },
  {
    title: 'pi-deepseek-peak',
    group: 'ai-automation',
    status: 'Maintained',
    year: 2026,
    href: 'https://github.com/juanmackie/pi-deepseek-peak',
    description: "A pi package that shows DeepSeek's PEAK/OFF-PEAK pricing phase and account health in the status bar.",
    evidenceStage: 4,
    lastCommit: '2026-08-23T06:00:18Z',
    lastReviewed: '2026-08-30',
    featured: true
  },
  {
    title: 'Logseq Housekeeper',
    group: 'knowledge',
    status: 'Maintained',
    year: 2026,
    href: 'https://github.com/juanmackie/Logseq-housekeeper',
    description: 'Scans Logseq graphs for unlinked mentions and adds sensible wikilinks.',
    evidenceStage: 5,
    lastCommit: '2026-08-22T06:18:06Z',
    lastReviewed: '2026-08-30',
    featured: true
  },
  {
    title: 'ccswap',
    group: 'ai-automation',
    status: 'Maintained',
    year: 2025,
    href: 'https://github.com/juanmackie/ccswap',
    description: 'A cross-platform CLI for switching Claude Code settings profiles.',
    evidenceStage: 5,
    lastCommit: '2026-01-17T08:02:18Z',
    lastReviewed: '2026-08-30'
  },
  {
    title: 'utilviewer',
    group: 'knowledge',
    status: 'Live',
    year: 2026,
    href: 'https://juanmackie.github.io/utilviewer/',
    description: 'A browser tool for viewing .util archives. Processing happens locally.',
    evidenceStage: 6,
    lastCommit: '2026-08-21T10:49:26Z',
    lastReviewed: '2026-08-30'
  },
  {
    title: 'Vectra',
    group: 'experiments',
    status: 'Live',
    year: 2026,
    href: 'https://juanmackie.github.io/vectra/',
    description: 'A browser tool for making mathematical patterns and exporting SVG or PNG.',
    evidenceStage: 6,
    lastCommit: '2026-08-21T10:40:26Z',
    lastReviewed: '2026-08-30'
  },
  {
    title: 'WhatsApp Desktop Webapp',
    group: 'knowledge',
    status: 'Maintained',
    year: 2026,
    href: 'https://github.com/juanmackie/WhatsApp-Desktop-Webapp',
    description: 'A lightweight desktop wrapper for WhatsApp Web, with a public Windows installer.',
    evidenceStage: 5,
    lastCommit: '2026-08-21T10:47:30Z',
    lastReviewed: '2026-08-30'
  },
  {
    title: 'Ecovacs GOAT G1 beacon planner',
    group: 'experiments',
    status: 'Live',
    year: 2026,
    href: 'https://juanmackie.github.io/Ecovacs-G1-beacon-placement-optimiser/',
    description: 'An unofficial planner for placing Ecovacs GOAT G1 beacons.',
    evidenceStage: 4,
    lastCommit: '2026-08-22T06:26:47Z',
    lastReviewed: '2026-08-30'
  },
  {
    title: 'Free LLM Tracker',
    group: 'ai-automation',
    status: 'Live',
    year: 2026,
    href: '/free-llm-tracker',
    description: 'A public tracker for free and open-source AI models, using current model and benchmark data.',
    evidenceStage: 4,
    lastReviewed: '2026-08-30'
  }
];

/** Sort public work by the latest checked commit, keeping untracked/private work last. */
export const sortProjectsByLatestCommit = (a: Project, b: Project) =>
  (b.lastCommit ?? '').localeCompare(a.lastCommit ?? '');

// ── Case studies ──────────────────────────────────────────────────
// Fields follow the plan's project-page standard. Where a number is
// missing, the copy says so. "Built" is not "validated".

export const caseStudies: CaseStudy[] = [
  {
    slug: 'prompt-paul',
    kicker: 'Product',
    title: 'Prompt Paul',
    group: 'ai-automation',
    status: 'Live',
    year: 2025,
    href: 'https://www.promptpaul.juanmackie.com/',
    description: 'AI-powered text assistant in the browser.',
    evidenceStage: 4,
    lastReviewed: '2026-08-30',
    problem:
      'Processing selected text with AI usually means a copy-paste ritual: switch apps, paste, wait, copy back, switch again. For repetitive text work the ceremony costs more than the model.',
    user: 'Anyone doing repeated text processing in the browser, starting with me.',
    intervention:
      'A Chrome extension that turns selected text into an immediate AI action with a short feedback loop. You never switch tabs or paste anything.',
    role: 'Design, development, publishing.',
    stack: 'Chrome extension, browser AI providers.',
    constraints:
      'Extension store review, provider API costs, and the privacy expectations of a tool that touches selected text.',
    answer:
      'Prompt Paul is a Chrome extension by Juan Mackie that processes selected text with AI in place, without tab switching or a copy-paste ritual. It shipped publicly in 2025 with a dedicated product site; adoption is not yet measured.',
    outcome:
      'Shipped and publicly released with a dedicated product site and a published privacy policy. Adoption and usage are not yet measured.',
    evidence: [
      { label: 'Product site', href: 'https://www.promptpaul.juanmackie.com/' },
      { label: 'Privacy policy', href: '/privacy' }
    ],
    limitations:
      'No published adoption metrics. The value claim rests on the feedback-loop argument, not on data.',
    nextStep: 'Measure activation and retention, then decide whether it earns a paid tier or stays a utility.'
  },
  {
    slug: 'logseq-housekeeper',
    kicker: 'AI-agent workflow',
    title: 'Logseq Housekeeper',
    group: 'knowledge',
    status: 'Maintained',
    year: 2026,
    href: 'https://github.com/juanmackie/Logseq-housekeeper',
    description: 'Reduces maintenance friction in a large Logseq knowledge base.',
    evidenceStage: 5,
    lastReviewed: '2026-08-30',
    problem:
      'A large Logseq graph accumulates unlinked mentions: notes that reference a topic without creating a link. Left alone, the graph rots through orphaned references, broken navigation, and manual cleanup sessions.',
    user: 'Me, maintaining a multi-year personal knowledge base.',
    intervention:
      'A tool that scans the graph for unlinked mentions and proposes sensible wikilinks, turning a recurring maintenance chore into a review step.',
    role: 'Author.',
    stack: 'Python.',
    constraints:
      'Logseq file formats change; false positives erode trust in the tool faster than missed links do.',
    answer:
      'Logseq Housekeeper is an open-source Python tool by Juan Mackie that scans a Logseq graph for unlinked mentions and proposes sensible wikilinks, turning recurring graph cleanup into a single review step.',
    outcome:
      'Publicly released and used in my own graph. Adoption and quantified time savings are not yet measured.',
    evidence: [
      { label: 'Repository', href: 'https://github.com/juanmackie/Logseq-housekeeper' }
    ],
    limitations:
      'No measured before/after time savings. The heuristics can miss or over-link.',
    nextStep: 'Measure cleanup time before and after, and publish the numbers.'
  }
];

// ── Method ────────────────────────────────────────────────────────

export const methodSteps = [
  {
    num: '01',
    title: 'Observe the workflow',
    body: 'Watch the day as it actually runs. The friction lives in the repetition nobody writes down.',
    project: 'Logseq Housekeeper'
  },
  {
    num: '02',
    title: 'Find the repeated bottleneck',
    body: 'Locate the step that costs the most attention per week. That is the only place worth automating.',
    project: 'Prompt Paul'
  },
  {
    num: '03',
    title: 'Preserve human judgment',
    body: 'Decide what stays with a person: compliance, safety, taste, and every call with consequences.',
    project: 'Logseq Housekeeper'
  },
  {
    num: '04',
    title: 'Automate the mechanical parts',
    body: 'Build the smallest tool that removes the repetition. If the tool is bigger than the chore, it is decoration.',
    project: 'Logseq Housekeeper'
  },
  {
    num: '05',
    title: 'Measure the result',
    body: 'Before and after, honestly. If it cannot be measured, say so out loud.',
    project: 'Prompt Paul'
  },
  {
    num: '06',
    title: 'Productise only after the loop works',
    body: 'A working workflow first; a product later, and only if it survives contact with real work.',
    project: 'finalcut.ai'
  }
];

// ── Thesis zones ──────────────────────────────────────────────────

export const thesisZones = [
  {
    tag: 'CURRENT',
    title: 'What is real now',
    body: 'Daily operational work in fire protection: hours, callouts, scheduling, and the paperwork layer that keeps businesses compliant.',
    points: [
      'Workflows in fire protection: hours, callouts, scheduling, and the paperwork layer.',
      'Administrative workflow automation for tasks such as hours, scheduling, and reporting; public details remain intentionally general.',
      'Public tooling that grew out of this work: routing experiments, hours visualisation, text agents.'
    ]
  },
  {
    tag: 'TESTING',
    title: 'What is being tested',
    body: 'The gap between a working workflow and a validated one. Nothing here is claimed as deployed capability.',
    points: [
      'AI assistance for administrative workflows; no deployment or safety outcome is claimed.',
      'Route optimisation against real constraints rather than demo data.',
      'Local AI infrastructure that runs models close to the work instead of renting every layer.'
    ]
  },
  {
    tag: 'FUTURE',
    title: 'Where this is headed',
    body: 'The long-term direction. Nothing in this zone is present capability. Robotics is a destination, not a present tense.',
    points: [
      'Recurring service models where software, inspection data, and maintenance cycles compound.',
      'AI-assisted decision support that leaves certified judgment with people.',
      'Physical automation and robotics where the economics and the safety case justify them.'
    ]
  }
];

export const thesisSections = [
  {
    title: 'The industry problem',
    body: 'Fire protection is a field service business: people, vehicles, inspections, paperwork, and compliance deadlines. The margin and the safety both live in the operational layer, and that layer still runs on spreadsheets, callouts, and institutional memory.'
  },
  {
    title: 'Why the workflows are inefficient',
    body: 'The work is repetitive in the places nobody notices: re-keying hours, rebuilding the same report, re-routing the same day. Each step is small; the sum is a second job nobody applied for.'
  },
  {
    title: 'Where AI actually helps',
    body: 'AI helps with the mechanical parts: summarising, extracting, routing, drafting, reconciling. It helps with administration and decision support. It does not sign off on compliance, and it should not.'
  },
  {
    title: 'What stays human-controlled',
    body: 'Certified inspections, compliance decisions, safety calls, and client relationships stay with people. The system exists to make those people faster and less tired, not to replace their judgment.'
  },
  {
    title: 'Recurring service models',
    body: 'Fire protection has recurring inspection and maintenance cycles. A future direction is to combine service, data, and software around that cycle; this is a direction, not a current capability.'
  },
  {
    title: 'Evidence and uncertainty',
    body: 'What is certain: the friction is real, the field is real, and the tools work in controlled use. What is uncertain: measured savings, adoption at scale, and how far automation can responsibly go. This page will be updated as evidence replaces intent.'
  }
];

// ── Direction ─────────────────────────────────────────────────────

export const directionItems = [
  {
    title: 'Better operational data',
    body: 'The same day, captured once, usable everywhere. Hours, jobs, and compliance status that stop living in separate spreadsheets.'
  },
  {
    title: 'AI-assisted decision making',
    body: 'Support, not substitution. Systems that surface the right question to a person at the right time.'
  },
  {
    title: 'Recurring service models',
    body: 'Fire protection already renews on fixed cycles. Productising that cycle, combining service, data, and software, is the durable business shape.'
  },
  {
    title: 'Less repetitive labour',
    body: 'Automation here means fewer second jobs, not fewer people: less re-keying, less re-reporting, more of the day spent on work that matters.'
  },
  {
    title: 'Physical automation where justified',
    body: 'Robotics stays a long-term direction until the economics and the safety case survive contact with reality. Where they do, it earns a place.'
  },
  {
    title: 'Durable businesses and optionality',
    body: 'The long game: build useful things, create optionality, and leave the systems better than I found them. Family and legacy are principles, not branding.'
  }
];

// ── FAQ (visible on the homepage; backs the FAQPage schema) ───────

export const faq = [
  {
    q: 'Who is Juan Mackie?',
    a: 'Juan Mackie is a builder, writer, and observer of systems based in Australia. He works across fire protection, operations, AI, and business design, turning messy workflows into safer, clearer systems.'
  },
  {
    q: 'What does Juan work on?',
    a: 'Practical AI and automation for real-world businesses, starting with fire protection. Current public work also explores agent memory, voice, browser tools, and autonomous development loops. The work sits between field-service operations, software, and the recurring-service models that make both durable.'
  },
  {
    q: 'What is Prompt Paul?',
    a: 'Prompt Paul is a Chrome extension built by Juan Mackie that allows users to process selected text quickly with AI. It is built for practical use, with short feedback loops for text processing.'
  },
  {
    q: 'What is the One at a Time podcast?',
    a: 'One at a Time is a podcast hosted by Juan Mackie that explores one thought-provoking idea per episode. Topics include technology, business, investing, and whatever else is worth sitting with for a while. Available on Spotify, Apple Podcasts, Overcast, and other platforms.'
  },
  {
    q: 'What projects has Juan Mackie built?',
    a: 'The public archive includes Prompt Paul, finalcut.ai, Last P, pi-deepseek-peak, ccswap, Logseq Housekeeper, WhatsApp Desktop Webapp, utilviewer, Vectra, and the Ecovacs GOAT G1 beacon planner. Each entry links to a public repository or live product surface.'
  },
  {
    q: 'How can I contact Juan Mackie?',
    a: 'By email at juan.mackie@gmail.com. No form and no queue; mail gets read. Operational problems, partnerships, product feedback, and introductions are welcome.'
  }
];

// ── Contact expectations ──────────────────────────────────────────

export const welcomeConversations = [
  'Operational problems that need a builder',
  'Fire-protection and field-service workflow questions',
  'Product feedback on anything in the archive',
  'Introductions to people solving real operations problems'
];

export const notAFit = [
  'Anything that needs a certified compliance decision from an AI',
  'Cold marketing, growth-hacking services, or paid link placement'
];

// ── Socials ───────────────────────────────────────────────────────

export const socials = [
  { label: 'GitHub', tag: 'Code archive', href: 'https://github.com/juanmackie' },
  { label: 'Twitter', tag: 'Primary channel', href: 'https://twitter.com/juanmackie' },
  { label: 'Substack', tag: 'Archive', href: 'https://juanmackie.substack.com' },
  { label: 'Goodreads', tag: 'Library', href: 'https://www.goodreads.com/user/show/53993557-juan-mackie' },
  { label: 'Medium', tag: 'Archive', href: 'https://medium.com/@juan.mackie' },
  { label: 'Ko-fi', tag: 'Support', href: 'https://ko-fi.com/N4N3184MUV' },
  { label: 'Last.fm', href: 'https://www.last.fm/user/juanmackie' },
  { label: 'Email', href: `mailto:${email}` }
];

// ── Reading / podcast / referrals ─────────────────────────────────

export const readingList = [
  'The Difference Between God and Larry Ellison: God Doesn\'t Think He\'s Larry Ellison',
  'The Unaccountability Machine by Dan Davies',
  'Unreasonable Hospitality by Will Guidara',
  'Abundance by Ezra Klein',
  'Transport for Humans by Pete Dyson and Rory Sutherland',
  'Alchemy by Rory Sutherland',
  'Kill Decision by Daniel Suarez',
  'Elements of Choice by Eric J. Johnson',
  'City of Joy',
  'Inheritocracy by Eliza Filby',
  'Outlive: The Science and Art of Longevity',
  'Under the Hood by Stan Slap',
  'A Little Book on the Human Shadow by Robert Bly',
  'Becoming Trader Joe by Joe Coulombe',
  'Asian Godfathers',
  'Built from Scratch by Bernie Marcus',
  'Let My People Go Surfing by Yvon Chouinard',
  'The Death of the Banker by Ron Chernow',
  'Case Studies For Corporate Finance by J.R. Harold Bierman',
  'Doing What Matters by James M. Kilts',
  'The Responsible Company by Yvon Chouinard',
  'Behind the Banyan by Aaron Low',
  'The Heart of Innovation by Matt Chanoff',
  'Purple on the Inside: How J.B. Hunt Transport Set Itself Apart',
  'The Nature of Our Cities',
  'For Blood and Money',
  'Bury My Heart at Conference Room B by Stan Slap',
  'Hyperefficient: Optimize Your Brain to Transform the Way You Work',
  'Never Enough: From Barista to Billionaire',
  'A Million Miles in a Thousand Years',
  'Technofeudalism: What Killed Capitalism',
  'Manufacturing Consent by Noam Chomsky and Edward Herman',
  'Day Trading QuickStart Guide',
  'High and Mighty: The Dangerous Rise of the SUV',
  'Trading in the Zone by Mark Douglas',
  'Merchants of Doubt',
  'Run Your Business, Don\'t Let It Run You',
  'Outside Directors in Family Owned Businesses',
  'Freedom\'s Forge',
  'The Deming Management Method',
  'Lights Out: Pride, Delusion, and the Fall of General Electric',
  'Plain Talk: Lessons from a Business Maverick',
  'Electronic Value Exchange: Origins of the VISA Electronic Payment System',
  'The Fifth Discipline Fieldbook',
  'Measures of Success by Kevin Claydon',
  'Engines That Move Markets',
  'You Have A Choice: Beyond Hard Work to Meaningful Work',
  'Deming\'s Journey to Profound Knowledge',
  'Filterworld by Kyle Chayka',
  'Hello, My Name Is Awesome',
  'Platform Revolution',
  'Lean Analytics',
  'Hooked by Nir Eyal',
  'The Psychology of Money by Morgan Housel',
  'The Checklist Manifesto by Atul Gawande',
  'Tools of Titans by Tim Ferriss',
  'Zurich Axioms',
  'More Than You Know',
  'The Rise of Superman',
  'The Breakout Principle',
  'From the Rat Race to Financial Freedom',
  'Logo Design Love',
  'How Big Things Get Done by Bent Flyvbjerg',
  'Catalyst',
  'The CEO Next Door',
  'The 5 Elements of Effective Thinking',
  'How to Make a Few Billion Dollars',
  'The McKinsey Engagement',
  'The McKinsey Edge',
  'Red Notice by Ben Mezrich',
  'The Key Man',
  'The World for Sale',
  'MBS by Ben Hubbard',
  'Sales Pitch',
  'Leadership Secrets of Attila the Hun',
  'Maverick by Ricardo Semler',
  'When the Wolves Bite',
  'The Cult of We',
  'The High-Velocity Edge',
  'The Warren Buffett CEO',
  'The Fund by Robin Wigglesworth',
  'The Dealmaker',
  'Founder vs Investor',
  'Forget the Funnel',
  'Capital Returns',
  'Twenty Things You Need to Know',
  'Black Edge by Sheelah Kolhatkar',
  'Looking for Spinoza by Antonio Damasio',
  'The Fountainhead by Ayn Rand',
  'Demand-Side Sales 101',
  'The Kingdom of Prep',
  'Imagination House by E. Lee Walker',
  'Propaganda by Edward Bernays',
  'The Pretender by Melanie Benjamin',
  'Winning by Jack Welch',
  'Positioning by Al Ries and Jack Trout',
  'The Nurture Assumption by Judith Rich Harris',
  'Born of This Land by Chung Ju-Yung',
  'We\'re Pregnant! by Adrian Kulp',
  'The Price of Time by Edward Chancellor',
  'Antimemetics by Nadia Asparouhova',
  'Who Knew by Barry Diller',
  'Project Hail Mary by Andy Weir',
  'The Rhythm of Strategy by Marleen Dieleman',
  'Robert Kuok: A Memoir',
  'The Cult of Information by Theodore Roszak',
  'The Shock of the Old by David Edgerton',
  'How to Get Filthy Rich in Rising Asia by Mohsin Hamid',
  'Practical Wisdom by Barry Schwartz',
  'Buffett\'s Early Investments by Brett Gardner',
  'The Creation of Wealth by R.M. Lala',
  'Jamsetji Nusserwanji Tata by Frank Harris',
  'The Polyester Prince by Hamish McDonald',
  'Absolute Power by Sucheta Dalal and Debashis Basu',
  'The Life and Times of G.D. Birla by Medha M. Kudaisya',
  'A.D. Shroff: Titan of Finance and Free Enterprise by Sucheta Dalal',
  'The Platform Delusion by Jonathan A. Knee',
  'J.B. Hunt: The Long Haul to Success by Marvin Schwartz',
  'Up the Organisation by Robert C. Townsend',
  'The Wisdom of the Enneagram',
  'When the Machine Stopped by Max Holland',
  'Gas Wars by Paranjoy Guha Thakurta',
  'Ghost in the Wires by Kevin D. Mitnick',
  'The Strategy of Conflict by Thomas C. Schelling',
  'Samsung Rising by Geoffrey Cain',
  'System Collapse by Martha Wells',
  'Fugitive Telemetry by Martha Wells',
  'Network Effect by Martha Wells',
  'Exit Strategy by Martha Wells',
  'Rogue Protocol by Martha Wells',
  'Home: Habitat, Range, Niche, Territory by Martha Wells',
  'Artificial Condition by Martha Wells',
  'All Systems Red by Martha Wells',
  'The Inheritance of Loss by Kiran Desai',
  'Excession by Iain M. Banks',
  'Hotel by Arthur Hailey',
  'Blind Man\'s Bluff',
  'Crossing the Chasm by Geoffrey A. Moore',
  'Who Is Michael Ovitz?',
  'New Dress for Success by John T. Molloy',
  'Who Says Elephants Can\'t Dance',
  'Kochland by Christopher Leonard',
  'Ogilvy on Advertising',
  'What Would Machiavelli Do',
  'Guerrilla Marketing by Jay Conrad Levinson',
  'Marketing Metrics',
  'The Prince by Niccolo Machiavelli',
  'The Complete Guide to Taxation in Australia by Max Newnham',
  'Australian Taxation Study Manual by K. Tai',
  'Tax Planning for Family and Small Business by Linda Delaney',
  'Be Your Own VC',
  'The Millionaires\' Factory',
  'More Money Than God by Sebastian Mallaby',
  'Learning to Build',
  'Logic of Failure',
  'Made in Japan by Akio Morita',
  'Critical Path by R. Buckminster Fuller',
  'Invested',
  'How Will You Measure Your Life? by Clayton Christensen',
  'Productize',
  'The Fish That Ate the Whale',
  'The Symphony of Profound Knowledge',
  'Business Bullseye by Allan Mason',
  'The Power of Positive Thinking',
  'Awaken the Giant Within by Tony Robbins',
  'The Hypomanic Edge',
  'The Puppet Masters',
  'The Sovereign Individual',
  'The Paradox of Success',
  'The HP Way',
  'Profit First by Mike Michalowicz',
  'Treasure Islands by Nicholas Shaxson',
  'How Brands Grow',
  'Flow by Mihaly Csikszentmihalyi',
  'Simple Numbers, Straight Talk, Big Profits!',
  'Lives in Trust',
  'The Hidden Wealth of Nations',
  'Family Wealth',
  'Buy Then Build',
  'The Deming Dimension',
  'Understanding Variation by David Chamberlain',
  'Enlightenment Now by Steven Pinker',
  'Creating a Data-Driven Organization',
  'Creativity by Mihaly Csikszentmihalyi',
  'Necessary but Not Sufficient',
  'Better, Simpler Strategy',
  'The Haystack Syndrome',
  'The Millionaire Fastlane',
  'The Power Law by Sebastian Mallaby',
  'How to Become a Rainmaker',
  'Running with Purpose by Jim Weber',
  'I Could Do Anything If I Only Knew What It Was',
  'Essentialism by Greg McKeown',
  'Crossing the Chasm, 3rd Edition by Geoffrey A. Moore',
  'Small Giants by Bo Burlingham',
  'Predictably Irrational by Dan Ariely',
  'The Expectation Effect',
  'The Great A&P and the Struggle for Small Business in America',
  'The Ultimate Sales Machine',
  'The Power of Full Engagement',
  'The Surrender Experiment',
  'Million Dollar Consulting',
  'The Score Takes Care of Itself',
  'The Paradox of Choice',
  'American Bonds',
  'The Status Game',
  'The Rise and Fall of the Third Reich',
  'The Misfit Economy',
  'Geopolitical Alpha',
  'A First-Rate Madness',
  'Vested',
  'Amp It Up',
  'Zero to IPO',
  'Vested Outsourcing',
  'In Business As in Life, You Don\'t Get What You Deserve, You Get What You Negotiate',
  'The Emperors of Chocolate',
  'HBR Guide to Thinking Strategically',
  'Discovery-Driven Growth',
  'The Effortless Experience',
  'The Man Who Broke Capitalism',
  'Corporate Explorer',
  'Sell Like Crazy',
  'Empire of Pain by Patrick Radden Keefe',
  'What Got You Here Won\'t Get You There',
  'The Art of Pricing',
  'The Rise and Fall of the Conglomerate Kings',
  'The Innovator\'s Dilemma by Clayton Christensen',
  'Pleased, But Not Satisfied',
  'Priceless by William Poundstone',
  'Building a Second Brain',
  'Three Blind Mice by Ken Auletta',
  'Lessons from Private Equity by Orit Gadiesh',
  'Entrepreneurship',
  'The 1% Windfall',
  'The Art of Intrusion',
  'The Art of Deception by Kevin Mitnick',
  'Topgrading by Bradford D. Smart',
  'After Steve by Tripp Mickle',
  'Richer, Wiser, Happier by William Green',
  'The 3G Way',
  'A Triumph of Genius',
  'Skunk Works by Ben Rich',
  'Ultralearning by Scott Young',
  'How to Win in a Winner-Take-All World',
  'Hidden Champions of the Twenty-First Century',
  'The Lean Turnaround',
  'Amazon Unbound by Brad Stone',
  'Dream Big',
  'Zero-Base Budgeting by Peter Pyhrr',
  'The Moral Animal',
  'The Discipline of Market Leaders',
  'Family Trusts: A Plain English Guide for Australian Families'
];

export const podcastApps = [
  { label: 'Spotify', href: 'https://open.spotify.com/show/3smooBeEnrR7ZV050nEor7' },
  { label: 'Apple Podcasts', href: 'https://podcasts.apple.com/us/podcast/one-at-a-time/id1684205454?i=1000610383892' },
  { label: 'Overcast', href: 'https://overcast.fm/itunes1684205454' },
  { label: 'Podcast Addict', href: 'https://podcastaddict.com/podcast/one-at-a-time/4409589' },
  { label: 'Amazon Music', href: 'https://music.amazon.com/podcasts/8ca10e33-afc4-4030-b7be-f2bc8f6f9732' },
  { label: 'iHeartRadio', href: 'https://iheart.com/podcast/113765859/' },
  { label: 'Castro', href: 'https://castro.fm/itunes/1684205454' },
  { label: 'Castbox', href: 'https://castbox.fm/vic/1684205454?ref=buzzsprout' },
  { label: 'Pocket Casts', href: 'https://pca.st/kfxcg8np' },
  { label: 'Deezer', href: 'https://www.deezer.com/show/5985227' },
  { label: 'RSS feed', href: 'https://feeds.buzzsprout.com/2178255.rss' }
];

export const referralLinks = [
  { label: 'Google Workspace', href: 'https://referworkspace.app.goo.gl/xASM' },
  { label: 'American Express Platinum', href: 'https://americanexpress.com/en-au/referral/hAYDNMJHNG?CPID=100427402' },
  { label: 'BuzzSprout Podcasting', href: 'https://www.buzzsprout.com/?referrer_id=2156252' },
  { label: 'OctoBot Crypto Auto Trading', href: 'https://www.octobot.cloud/?rc=2ec1df2b2f2&utm_source=referral&utm_campaign=referrals&utm_content=2ec1df2b2f2' },
  { label: 'Buffer', href: 'https://buffer.com/join/b902f943ee8a5e710434fcf56078e2e44f89ac3840240eebae626b843aec4d0b' },
  { label: 'Railway.app', href: 'https://railway.app?referralCode=Ai2hbO' },
  { label: 'OVO Energy (EV Plan)', href: 'https://www.ovoenergy.com.au/refer/juan1479' }
];

export const principles = [
  {
    id: 'systems',
    label: 'Think in systems',
    text: 'Every part connects to something else. Isolate a component and you lose the behavior of the whole. Think in loops, not lines.'
  },
  {
    id: 'useful',
    label: 'Prefer useful over clever',
    text: 'Clever is cheap. Useful is rare. The best work solves a real problem without ceremony.'
  },
  {
    id: 'legible',
    label: 'Keep the UI legible',
    text: 'If the user has to decode the interface, the interface has failed. Clarity is the highest form of respect.'
  },
  {
    id: 'build-ship',
    label: 'Build, ship, refine',
    text: 'The loop is the product. Build something, ship it, listen to what it tells you, then make it better. Repeat.'
  },
  {
    id: 'own-stack',
    label: 'Own the stack',
    text: "Know every layer beneath you. When you don't, you're renting someone else's decisions."
  },
  {
    id: 'propose',
    label: 'Propose, then act',
    text: 'A good proposal beats a fast commit. Think clearly, then move with conviction.'
  },
  {
    id: 'move-fast',
    label: 'Move fast',
    text: "Speed compounds. Hesitation taxes everything downstream. Ship before you're ready, then iterate."
  },
  {
    id: 'eacc',
    label: 'e/acc',
    text: "Effective accelerationism: don't slow down for things that don't matter. Technology moves forward. Move with it."
  },
  {
    id: 'inputs',
    label: 'inputs > outputs',
    text: 'Focus on what you can control. Inputs determine outcomes. Optimize the source, not the symptom.'
  },
  {
    id: 'five-laws',
    label: '5-laws',
    text: "Question every requirement. Delete what doesn't belong. Simplify what remains. Accelerate the cycle. Automate last. The order matters; most people do it backwards."
  }
];

// ── External services ─────────────────────────────────────────────
// The Last.fm application identifier is intentionally client-visible: the
// only call is user.getrecenttracks (public data). See docs/baseline-2026-08.md.

export const lastFm = {
  username: 'juanmackie',
  // Public application identifier for Last.fm's unauthenticated read-only API.
  publicApplicationKey: '29db0717585301fa01228bda7b30002e',
  profileUrl: 'https://www.last.fm/user/juanmackie'
};

export const promptPaulPrivacy = [
  'Last updated: 2025/01/01',
  'Prompt Paul is a Chrome extension that can process selected text using AI providers.',
  'We may collect anonymous usage data such as general location, clicks, and interaction signals to improve the extension.',
  'We do not collect exact location and we do not sell or trade personal data for marketing.',
  'Data is used for product improvement, analytics, and compliance. If you have questions, contact juan.mackie@gmail.com.'
];
