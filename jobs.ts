
export type ProgramType = 'Business' | 'Hospitality & Tourism' | 'Health & Care' | 'Others';

export type ArchetypeType = 
  | 'The Visionary' | 'The Strategist' | 'The Caregiver' | 'The Tech Wizard' 
  | 'The Eco-Warrior' | 'The Alchemist' | 'The Guardian' | 'The Experience Architect'
  | 'The Data Poet' | 'The Human Connector' | 'The Growth Catalyst' | 'The Maker'
  | 'The Curator' | 'The Peacekeeper' | 'The Disruptor' | 'The Analyst'
  | 'The Storyteller' | 'The Optimizer' | 'The Navigator' | 'The Specialist';

export interface JobProfile {
  id: string;
  title: string;
  program: ProgramType | 'Any';
  archetype: ArchetypeType;
  image: string;
  location: string;
  bio: string;
  lookingFor: string;
  skills: string[];
  loveLanguage: string[];
  swipeRightIf: string[];
  funFact: string;
  tags: string[];
  isAI?: boolean;
}

export const JOB_CLOUDINARY_POOL = [
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504196/9_xktmj0.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504195/8_fi4vrd.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504192/7_oss68k.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504191/6_o3dub9.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504187/5_hbzhzq.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504186/4_qqlbpt.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504185/3_lnlqtr.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504182/2_oldxaw.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504181/1_gmpwhj.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504179/35_dge2ho.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504178/34_xupklp.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504175/33_h6erdo.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504175/32_kwxjhg.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504174/31_exumct.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504171/30_t9uux0.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504169/28_t1m9gs.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504170/29_ooam9y.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504169/27_i3wurk.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504165/26_tlvuh2.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504164/25_dfpny1.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504164/24_irpgxg.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504163/23_p2zat5.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504161/22_ks7mqa.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504160/21_kuf3z4.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504159/20_fxzuyv.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504156/16_k31wzp.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504155/11_i0fkbm.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504155/15_cq0ygc.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504155/14_prelcx.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504154/13_x2xoyn.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504154/12_szqxkn.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771504154/10_s9nbnz.jpg'
];

export const getAvatar = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return JOB_CLOUDINARY_POOL[Math.abs(hash) % JOB_CLOUDINARY_POOL.length];
};

export const PROFESSIONAL_SEEDS = [
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/4_lfr8tg.jpg', 
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/11_gq3bij.jpg', 
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/5_rbotrf.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/6_n5xko4.jpg', 
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/10_tymspw.jpg', 
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/7_vszm0u.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840553/9_tbiqe6.jpg', 
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840553/2_nfod8k.jpg', 
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840553/8_fy4iim.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840554/12_rtwg5k.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840553/Screenshot_2026-02-19_123300_gfveyh.jpg',
  'https://res.cloudinary.com/dtbejb9lk/image/upload/v1771840553/3_yirfep.jpg'
].map((url, i) => ({ seed: `UserAvatar-${i}`, customUrl: url }));

export const ARCHETYPE_DEFAULTS: Record<ArchetypeType, Partial<JobProfile>> = {
  'The Visionary': {
    bio: "I specialize in identifying long-term opportunities that others miss, crafting detailed roadmaps to transform hypothetical futures into commercial reality.",
    skills: ["Strategic Foresight", "Leadership", "Horizon Scanning", "Change Management", "Influence"],
    loveLanguage: ["✨ Autonomy", "✨ Innovation", "✨ Legacy Building", "✨ Disruption", "✨ Influence"],
    funFact: "Visionaries are 40% more likely to anticipate market shifts.",
    image: getAvatar('vision')
  },
  'The Caregiver': {
    bio: "I believe that empathy is the most powerful tool in any professional setting, creating safe environments where individuals achieve their potential.",
    skills: ["EQ", "Conflict Resolution", "Advocacy", "Inclusive Leadership", "Listening"],
    loveLanguage: ["✨ Human Connection", "✨ Trust", "✨ Holistic Support", "✨ Safety", "✨ Recovery"],
    funFact: "Teams led by high-empathy caregivers report 50% lower turnover.",
    image: getAvatar('care')
  },
  'The Tech Wizard': {
    bio: "I translate complex human challenges into elegant technical architectures, bridging the gap between legacy systems and the cutting-edge future of AI.",
    skills: ["Cloud Architecture", "ML", "Cybersecurity", "APIs", "Development"],
    loveLanguage: ["✨ Logic", "✨ Infrastructure", "✨ Prototyping", "✨ Technological Edge", "✨ Seamless UX"],
    funFact: "Tech Wizards solve more problems in a week than some software does in a year.",
    image: getAvatar('tech')
  },
  'The Experience Architect': {
    bio: "I orchestrate multi-sensory brand experiences ensuring touchpoints are masterpieces of intentional service design.",
    skills: ["Service Design", "Storytelling", "Ops", "Journey Mapping", "TQM"],
    loveLanguage: ["✨ Execution", "✨ Surprise", "✨ Aesthetic Precision", "✨ Resonance", "✨ Curation"],
    funFact: "Experience-led businesses see 1.6x higher brand awareness.",
    image: getAvatar('exp')
  },
  'The Eco-Warrior': {
    bio: "I operate at the intersection of profitability and planetary health, developing circular economy strategies.",
    skills: ["ESG", "Circular Economy", "Auditing", "Policy", "Carbon Accounting"],
    loveLanguage: ["✨ Net-Zero", "✨ Circularity", "✨ Transparency", "✨ Planetary Health", "✨ Growth"],
    funFact: "Sustainable companies typically outperform peers by 2.5% annually.",
    image: getAvatar('eco')
  },
  'The Alchemist': {
    bio: "I synthesize transformative products blending disparate ingredients, ideas, or data points.",
    skills: ["R&D", "Engineering", "Concept Dev", "Optimization", "Design"],
    loveLanguage: ["✨ Scientific Breakthroughs", "✨ Quality", "✨ Discovery", "✨ Transformation", "✨ Mastery"],
    funFact: "Alchemists are responsible for 80% of new product breakthroughs.",
    image: getAvatar('alch')
  },
  'The Guardian': {
    bio: "I protect institutional integrity and individual privacy, leveraging advanced security protocols.",
    skills: ["Crisis Management", "Risk Mitigation", "Compliance", "Data Protection", "Security"],
    loveLanguage: ["✨ Integrity", "✨ Privacy", "✨ Defense", "✨ Trust", "✨ Stability"],
    funFact: "Early intervention prevents an estimated $3.5M in enterprise risk losses.",
    image: getAvatar('guard')
  },
  'The Data Poet': {
    bio: "I distill vast datasets into compelling visual narratives empowering executives to make high-stakes decisions.",
    skills: ["Modeling", "Storytelling", "SQL", "Analytics", "Design"],
    loveLanguage: ["✨ Clarity", "Pattern Recognition", "✨ Insight", "✨ Elegance", "✨ Truth"],
    funFact: "Data Poets help organizations make decisions 5x faster.",
    image: getAvatar('data')
  },
  'The Human Connector': {
    bio: "I weave together global networks and cross-functional teams unifying diverse talents behind a single vision.",
    skills: ["Negotiation", "Networking", "PR", "Community", "Psychology"],
    loveLanguage: ["✨ Synergy", "✨ Capital", "✨ Fluidity", "✨ Vision", "✨ Relational Depth"],
    funFact: "Connectors have networks 3x more diverse than average.",
    image: getAvatar('conn')
  },
  'The Growth Catalyst': {
    bio: "I execute scalability strategies leveraging consumer psychology to turn successes into market leaders.",
    skills: ["Growth Hacking", "Revenue Ops", "Optimization", "Expansion", "Pricing"],
    loveLanguage: ["✨ Velocity", "✨ Dominance", "✨ Wins", "✨ Scalable Systems", "✨ ROI"],
    funFact: "Growth Catalysts focus on the 20% of actions driving 80% of growth.",
    image: getAvatar('grow')
  },
  'The Maker': {
    bio: "I am dedicated to the physical realization of ideas combining traditional craftsmanship with modern technology.",
    skills: ["Prototyping", "CAD", "Lean Manufacturing", "Science", "QA"],
    loveLanguage: ["✨ Tangible Quality", "✨ Integrity", "✨ Beauty", "✨ Mastery", "✨ Perfection"],
    funFact: "Makers reduce development cycles by an average of 60%.",
    image: getAvatar('make')
  },
  'The Curator': {
    bio: "I filter out the mediocre to present only the exceptional, building collections and brands of value.",
    skills: ["Curation", "Branding", "Forecasting", "Appraisal", "Exhibition"],
    loveLanguage: ["✨ Excellence", "✨ Influence", "✨ Rarity", "✨ Refinement", "✨ Appeal"],
    funFact: "Curated brands command a 200% premium in high-end markets.",
    image: getAvatar('cur')
  },
  'The Peacekeeper': {
    bio: "I specialize in professional mediation neutralizing high-conflict situations and designing fair policies.",
    skills: ["Mediation", "Labor Relations", "Policy", "Governance", "Communication"],
    loveLanguage: ["✨ Harmony", "✨ Respect", "✨ Fair Outcomes", "✨ Transparency", "✨ Stability"],
    funFact: "Organizations with Peacekeepers see 70% fewer internal disputes.",
    image: getAvatar('peace')
  },
  'The Disruptor': {
    bio: "I am the architect of constructive chaos relentlessly challenging the status quo for an agile future.",
    skills: ["Transformation", "Risk Strategy", "Engineering", "Design Thinking", "Pivot"],
    loveLanguage: ["✨ Change", "✨ Evolution", "✨ Bold Experimentation", "✨ New Paradigm", "✨ Iteration"],
    funFact: "Disruptors are 3x more likely to lead category-defining companies.",
    image: getAvatar('dis')
  },
  'The Analyst': {
    bio: "I eliminate uncertainty through rigorous auditing and predictive forecasting backed by logical evidence.",
    skills: ["Modeling", "Auditing", "Reasoning", "Econometrics", "Detail"],
    loveLanguage: ["✨ Precision", "✨ Verified Facts", "✨ Predictability", "✨ Proof", "✨ Depth"],
    funFact: "Predictive analysts are 20% more accurate than traditional peers.",
    image: getAvatar('ana')
  },
  'The Storyteller': {
    bio: "I translate complex corporate values into resonant narratives moving markets through emotional engagement.",
    skills: ["Strategy", "Voice Design", "Speaking", "Copywriting", "Creative Direction"],
    loveLanguage: ["✨ Resonance", "✨ Emotional Impact", "✨ Voice", "✨ Alignment", "✨ Connection"],
    funFact: "Information as a story is 22x more likely to be remembered.",
    image: getAvatar('story')
  },
  'The Optimizer': {
    bio: "I possess an obsessive drive for efficiency auditing workflows to eliminate waste and leveraging automation.",
    skills: ["Six Sigma", "Automation", "Allocation", "Engineering", "Optimization"],
    loveLanguage: ["✨ Efficiency", "✨ Streamlining", "✨ Waste Elimination", "✨ Flow", "✨ Performance"],
    funFact: "Optimizers can reclaim 15% of a budget in 6 months.",
    image: getAvatar('opt')
  },
  'The Navigator': {
    bio: "I serve as the strategic compass for complex logistics journeys ensuring initiatives reach their destination.",
    skills: ["PM", "Logistics", "Planning", "Mapping", "Resource Nav"],
    loveLanguage: ["✨ Execution", "✨ Timing", "✨ Direction", "✨ Journey Completion", "✨ Reliable Flow"],
    funFact: "Navigators improve reliability by an average of 45%.",
    image: getAvatar('nav')
  },
  'The Specialist': {
    bio: "I have dedicated my career to the mastery of a technical niche providing deep authority generalists cannot match.",
    skills: ["Subject Mastery", "Consulting", "Research", "Auditing", "Authority"],
    loveLanguage: ["✨ Technical Mastery", "✨ Industry Authority", "✨ Deep Knowledge", "✨ Precision", "✨ Niche Impact"],
    funFact: "Specialists in critical niches command salaries 50% higher than generalists.",
    image: getAvatar('spec')
  },
  'The Strategist': {
    bio: "I view the business world as a game of chess positioning resources and anticipating moves.",
    skills: ["Game Theory", "Strategy", "Execution", "Systems Thinking", "SWOT"],
    loveLanguage: ["✨ Strategic Victory", "✨ Planning", "✨ Calculated Risk", "✨ Advantage Building", "✨ Resource Efficiency"],
    funFact: "Strategists spend 50% more time on environmental analysis.",
    image: getAvatar('strat')
  }
};

export const specialPositions = [
  "Director of Guest Experience", "AI Concierge Manager", "Smart Room IoT Specialist", "Cybersecurity Liaison",
  "Guest Data Privacy Officer", "Predictive Maintenance Technician", "Smart Energy Analyst", "Hotel UX Lead",
  "Connectivity Manager", "Sustainable Ops Technologist", "Biometric Access Officer", "Robotic Fleet Supervisor",
  "Executive Chef", "Food Waste Analyst", "Plant-Based Consultant", "Sustainable Tourism Analyst",
  "Metaverse Destination Manager", "Space Tourism Trainer", "Dynamic Pricing Strategist", "Marketing Automation Manager",
  "Crisis Resolution Lead", "Cultural Sensitivity Advocate", "Agile Transformation Lead", "Digital Legacy Architect",
  "Employee Wellbeing Consultant", "Corporate Governance Auditor", "Venture Philanthropy Analyst", "Circular Supply Lead",
  "Net-Zero Transition Manager", "Renewable Energy Strategist", "Bio-mimicry Design Lead", "Ocean Plastics Analyst",
  "Regenerative Agriculture Lead", "ESG Disclosure Specialist", "Carbon Market Strategist", "Impact Investment Lead",
  "Telehealth Experience Lead", "Patient Advocacy Director", "Clinical Ops Strategist", "Health Equity Liaison",
  "Med-Tech Ethics Officer", "Precision Medicine Advocate", "Gerontology Living Lead", "Mental Health UX Strategist",
  "Neuro-Diversity Workplace Lead", "Public Health Data Poet", "Bio-Ethics Consultant", "Holistic Wellness Architect",
  "Hospitality Tech Evangelist", "Destination Branding Lead", "Revenue Yield Strategist", "Global Events Architect",
  "Luxury Concierge Director", "Food Security Strategist", "Ecotourism Development Lead", "Community Outreach Liaison",
  "Social Impact Storyteller", "Knowledge Transfer Lead", "Remote Workforce Strategist", "Inclusive Product Designer",
  "AI Ethics Researcher", "Platform Safety Director", "User Trust & Integrity Lead", "Decentralized Governance Lead",
  "Algorithm Fairness Auditor", "Data Sovereignty Advocate", "Chief Happiness Officer", "Innovation Ecosystem Lead",
  "Digital Ethics Advisor", "Sustainability Reporting Lead"
];

export const jobs: JobProfile[] = [
  {
    id: 'hc-01', title: 'Pediatric Unit Supervisor', program: 'Health & Care', archetype: 'The Guardian',
    image: getAvatar('Pediatric-Supervisor'), location: 'Children’s Wing',
    bio: 'I oversee daily operations ensuring young patients receive medical care and emotional support.',
    lookingFor: 'A resilient soul.', skills: ['Pediatrics', 'Crisis Support', 'Kindness', 'Management', 'Advocacy'],
    loveLanguage: ['✨ Brave Badges', '✨ Tiny Smiles', '✨ Family Peace', '✨ Recovery Wins', '✨ Unit Harmony'],
    swipeRightIf: ['You love children'], funFact: 'I have a 95% success rate in stopping tears with my sticker collection.',
    tags: ['healthcare', 'leadership']
  }
];
