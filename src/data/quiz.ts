// Shared by the standard quiz section and the Salesforce view's quiz tab
export const questions = [
  {
    q: 'What is the maximum number of SOQL queries allowed in a single Apex transaction?',
    options: ['50', '100', '150', '200'],
    answer: 1,
    explanation: '100 SOQL queries per transaction is a key Apex governor limit.',
  },
  {
    q: 'Which Salesforce feature allows you to build autonomous AI agents that take actions?',
    options: ['Einstein Bots', 'Agentforce', 'Flow Orchestrator', 'OmniStudio'],
    answer: 1,
    explanation: "Agentforce is Salesforce's platform for building autonomous AI agents.",
  },
  {
    q: 'What does LWC stand for in Salesforce development?',
    options: ['Lightweight Web Coding', 'Lightning Web Components', 'Live Web Constructor', 'Linked Web Container'],
    answer: 1,
    explanation: 'Lightning Web Components is the modern UI framework for Salesforce.',
  },
  {
    q: 'Which object in Salesforce unifies customer data from multiple sources in Data Cloud?',
    options: ['Contact', 'Lead', 'Unified Individual', 'Person Account'],
    answer: 2,
    explanation: 'The Unified Individual is the resolved, deduplicated customer profile in Data Cloud.',
  },
  {
    q: 'What is the correct order of trigger execution in Salesforce?',
    options: [
      'After triggers → Validation rules → Before triggers',
      'Before triggers → Validation rules → After triggers',
      'Validation rules → Before triggers → After triggers',
      'Before triggers → After triggers → Validation rules',
    ],
    answer: 1,
    explanation: 'Salesforce processes before triggers first, then validation rules, then after triggers.',
  },
]

export const SCORE_MESSAGES = [
  { min: 0, max: 1, emoji: '😅', msg: 'Keep exploring Trailhead! Every expert started somewhere.' },
  { min: 2, max: 3, emoji: '💪', msg: 'Solid foundation! You know your Salesforce basics.' },
  { min: 4, max: 4, emoji: '🔥', msg: "Impressive! You clearly spend time on Trailhead." },
  { min: 5, max: 5, emoji: '🏆', msg: "Perfect score! You're a true Salesforce champion." },
]
