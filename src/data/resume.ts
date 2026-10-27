// Single source for résumé content — read by both the standard and the Salesforce record views.
// Wrap a phrase in **double asterisks** to highlight it.

export interface Job {
  title: string
  company: string
  start: Date
  end: Date | null // null → Present
  location: string
  stack: string[]
  achievements: string[]
}

export const jobs: Job[] = [
  {
    title: 'Technology Analyst',
    company: 'Infosys Limited',
    start: new Date(2022, 7, 1), // Aug 2022
    end: null,
    location: 'India · UK onsite engagement',
    stack: ['Apex', 'LWC', 'Flows', 'OmniStudio', 'Experience Cloud', 'REST / SOAP'],
    achievements: [
      'Built and maintained Apex classes, triggers, batch and schedulable jobs, cutting Apex character usage by **20%** for better governor-limit headroom.',
      'Automated business processes with **Flows, Approval Processes and Validation Rules**, reducing manual interventions by **40%**.',
      '**Optimized SOQL** and bulkified Apex, lowering governor-limit exceptions by **25%** and improving system stability.',
      'Delivered an OmniStudio automation framework (**OmniScripts, DataRaptors, Integration Procedures, FlexCards**) — a **50% reduction** in manual data entry.',
      'Designed **Experience Cloud** solutions that gave external users self-service access to business functions.',
      'Hardened data security through Profiles, Permission Sets, Role Hierarchies and Sharing Rules.',
      'Worked **onsite with UK stakeholders** — requirement workshops, customer demos, user training and UAT support.',
    ],
  },
]

export const education = {
  school: 'Allenhouse Institute of Technology',
  university: 'AKTU University, Uttar Pradesh',
  degree: 'B.Tech, Computer Science & Engineering',
  years: '2018 – 2022',
  grade: '7.8 CGPA',
}

export const skills: { label: string; items: string[] }[] = [
  { label: 'Languages',  items: ['Apex', 'SOQL', 'SOSL', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Java', 'SQL'] },
  { label: 'Frameworks', items: ['LWC', 'Aura', 'Salesforce Flows', 'OmniStudio', 'REST & SOAP APIs', 'Chart.js'] },
  { label: 'Clouds',     items: ['Sales Cloud', 'Service Cloud', 'Experience Cloud', 'Data Cloud', 'Marketing Cloud'] },
  { label: 'Tools',      items: ['Salesforce CLI', 'VS Code', 'Git / GitHub', 'Bitbucket', 'Postman', 'Workbench', 'MuleSoft'] },
]

export const summary = 'Detail-oriented Salesforce Developer with strong expertise in **Apex, Lightning Web Components, Flows and API-based integrations** — delivering automated, performance-optimized solutions and better user experiences on enterprise-grade Salesforce orgs.'

export const technologies = [
  { name: 'Apex',                    color: '#0ea5e9', category: 'Development' },
  { name: 'Lightning Web Components',color: '#6366f1', category: 'Development' },
  { name: 'Salesforce Flow',         color: '#8b5cf6', category: 'Automation' },
  { name: 'SOQL / SOSL',             color: '#22c55e', category: 'Development' },
  { name: 'Data Cloud',              color: '#8b5cf6', category: 'Clouds' },
  { name: 'Agentforce',              color: '#f59e0b', category: 'AI' },
  { name: 'Marketing Cloud',         color: '#f97316', category: 'Clouds' },
  { name: 'Einstein AI',             color: '#0ea5e9', category: 'AI' },
  { name: 'Experience Cloud',        color: '#6366f1', category: 'Clouds' },
  { name: 'REST & SOAP APIs',        color: '#22c55e', category: 'Integration' },
  { name: 'Salesforce CLI',          color: '#8b5cf6', category: 'Tooling' },
  { name: 'Platform Events',         color: '#f59e0b', category: 'Integration' },
  { name: 'Integration Patterns',    color: '#6366f1', category: 'Integration' },
  { name: 'CPQ',                     color: '#0ea5e9', category: 'Clouds' },
  { name: 'JavaScript / ES6+',       color: '#f59e0b', category: 'Development' },
  { name: 'Git',                     color: '#f97316', category: 'Tooling' },
  { name: 'Trigger Framework',       color: '#8b5cf6', category: 'Development' },
  { name: 'OmniStudio',              color: '#22c55e', category: 'Automation' },
  { name: 'Visualforce',             color: '#94a3b8', category: 'Development' },
  { name: 'Salesforce Connect',      color: '#6366f1', category: 'Integration' },
]

export interface Project {
  id: string
  name: string
  type: string
  icon: string
  /** Primary call to action: install / open */
  url: string
  cta: string
  /** Label/value facts shown in the record highlights */
  facts: { label: string; value: string }[]
  pitch: string
  features: { icon: string; title: string; desc: string }[]
  highlights: string[]
}

export const impactAnalyzer = {
  id: 'impact-analyzer',
  name: 'SF Impact Analyzer',
  type: 'Chrome Extension',
  icon: '/sf-impact-analyzer.png',
  version: 'v1.0',
  compatibility: 'Chrome & Edge 116+',
  storeUrl: 'https://chromewebstore.google.com/detail/ijamiihglnmoohemmnilcjnhhkhfihoh',
  url: 'https://chromewebstore.google.com/detail/ijamiihglnmoohemmnilcjnhhkhfihoh',
  cta: 'Add to Chrome — free',
  facts: [
    { label: 'Type', value: 'Chrome Extension' },
    { label: 'Version', value: 'v1.0' },
    { label: 'Compatibility', value: 'Chrome & Edge 116+' },
  ],
  pitch: "See **everywhere a Salesforce field, object or Apex class is used** before you rename, change or delete it — straight from the org you're already logged into.",
  features: [
    { icon: '🔎', title: 'Deep reference search', desc: 'Apex, Flows, LWC, Aura, Visualforce, formulas, layouts, reports, validation rules & more.' },
    { icon: '🚦', title: 'Change risk rating',    desc: 'High / Medium / Low risk with a clear reason, including indirect impact.' },
    { icon: '🕸️', title: 'Dependency graph',      desc: 'Interactive graph of everything that touches a field, object or class.' },
    { icon: '🧪', title: 'Deploy-ready output',   desc: 'Test classes to run, an SF CLI deploy command, Jira/PR summary & CSV export.' },
  ],
  highlights: ['Read-only', 'Runs in your browser', 'No external servers', 'Demo org included'],
} satisfies Project & Record<string, unknown>

export const tradeNotes = {
  id: 'tradenotes',
  name: 'TradeNotes',
  type: 'Installable web app (PWA)',
  icon: '/projects/tradenotes-icon-192.png',
  url: 'https://trading-notes-two.vercel.app/',
  cta: 'Install free',
  facts: [
    { label: 'Type', value: 'Installable web app' },
    { label: 'Platforms', value: 'Windows · Mac · Android · iOS' },
    { label: 'Data', value: 'On-device only' },
  ],
  pitch: '**Trading notes that can draw charts.** Sketch candles, chart patterns and trade setups right inside your notes, and journal every trade — all on your own device.',
  features: [
    { icon: '🕯️', title: 'Chart sketch editor', desc: 'Candles, trendlines, support/resistance and long/short boxes with live risk:reward.' },
    { icon: '📚', title: 'Pattern library',     desc: '40+ chart and candlestick patterns, ready to drop into a note.' },
    { icon: '📒', title: 'Trade journal',       desc: 'P&L, R-multiples, win rate, profit factor and an equity curve.' },
    { icon: '💾', title: 'Private by design',   desc: 'Works offline, no account — daily auto-backup to a folder you choose.' },
  ],
  highlights: ['Free', 'No account', 'Works offline', 'Installs on any device'],
  screenshots: [
    { src: '/projects/tradenotes-shot-editor.webp',    label: 'Chart editor' },
    { src: '/projects/tradenotes-shot-dashboard.webp', label: 'Trade journal' },
    { src: '/projects/tradenotes-shot-notes.webp',     label: 'Notes' },
  ],
} satisfies Project & Record<string, unknown>

export const projects: Project[] = [impactAnalyzer, tradeNotes]

export const certs = [
  { name: 'Salesforce Certified Administrator',           short: 'Admin',             color: '#0ea5e9', icon: '🛡️', desc: 'Core platform administration, security, and automation.' },
  { name: 'Salesforce Certified Marketing Associate',     short: 'Marketing',         color: '#f97316', icon: '📣', desc: 'Marketing Cloud foundations, journeys, and email campaigns.' },
  { name: 'Data Cloud Consultant',                        short: 'Data Cloud',        color: '#8b5cf6', icon: '☁️', desc: 'Unified data profiles, segmentation, and real-time activation.' },
  { name: 'AI Associate',                                 short: 'AI',                color: '#22c55e', icon: '🤖', desc: 'AI fundamentals, ethical AI, and Einstein platform capabilities.' },
  { name: 'Platform Developer I',                         short: 'PD1',               color: '#6366f1', icon: '⚡', desc: 'Apex, Visualforce, SOQL, and core Salesforce development patterns.' },
  { name: 'Agentforce Specialist',                        short: 'Agentforce',        color: '#f59e0b', icon: '🤝', desc: 'Building and configuring autonomous Agentforce AI agents.' },
]

export const links = {
  linkedin:  'https://www.linkedin.com/in/batham/',
  github:    'https://github.com/saransh2107',
  trailhead: 'https://www.salesforce.com/trailblazer/saranshbatham21',
  resume:    '/resume.pdf',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const fmtMonth = (d: Date | null) => d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'Present'

/** "3 yrs 2 mos" between start and end (or now). */
export function tenure(start: Date, end: Date | null = null): string {
  const to = end ?? new Date()
  const total = (to.getFullYear() - start.getFullYear()) * 12 + to.getMonth() - start.getMonth() + 1
  const y = Math.floor(total / 12), m = total % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, m && `${m} mo${m > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}
