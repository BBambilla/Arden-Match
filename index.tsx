
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Briefcase, Heart, X, Check, ArrowRight, RefreshCw, Star, MapPin, Search, Download, Sparkles, ExternalLink, ClipboardCheck, GraduationCap, MessageSquare, Loader2, Lightbulb, Link as LinkIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { jobs, JobProfile, ProgramType, specialPositions, ArchetypeType, ARCHETYPE_DEFAULTS, getAvatar, PROFESSIONAL_SEEDS, JOB_CLOUDINARY_POOL } from './jobs';

// --- Configuration ---
/**
 * IMPORTANT: To sync data, you must deploy a Google Apps Script as a "Web App".
 * 1. Open Google Sheet -> Extensions -> Apps Script.
 * 2. Paste the 'doPost' script (see docs/sync_setup.md).
 * 3. Click Deploy -> New Deployment -> Web App.
 * 4. Set 'Who has access' to 'Anyone'.
 * 5. COPY the 'Web App URL' (ends in /exec) and paste it below.
 */
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzUltI1DYskM9_Mwq3FR9LTtLTYQem9j8cfuV4YzTqgSr53Y90PBTfyR2KJq0DNDNNu/exec'; 

// --- Shared Constants ---
const RESOURCES = [
  { title: "Arden Futures", desc: "Your central careers platform for resources, job opportunities, and support.", link: "https://futures.arden.ac.uk/unauth", icon: <Briefcase size={16} /> },
  { title: "CareerSet", desc: "Instantly optimize your CV and cover letter for ATS standards.", link: "https://careerset.com/arden", icon: <ClipboardCheck size={16} /> },
  { title: "Graduates First", desc: "Practice psychometric tests used by top employers.", link: "https://www.graduatesfirst.com/university-career-services/arden", icon: <GraduationCap size={16} /> },
  { title: "Occumi", desc: "Articulate your unique transferable skills based on experiences.", link: "https://www.occumi.co.uk/sign-up/", icon: <Star size={16} /> },
  { title: "Shortlist.Me", desc: "AI-driven video interview practice to boost confidence.", link: "https://go.shortlister.com/marketplace/ardenuni", icon: <MessageSquare size={16} /> },
];

// --- Types ---
interface UserProfile {
  name: string;
  program: ProgramType;
  passions: [string, string];
  happiness: string;
  strength: string;
  avatarUrl: string;
}

type Screen = 'onboarding' | 'setup' | 'discovering' | 'swiping' | 'summary' | 'survey' | 'results';

const PROGRAMS: ProgramType[] = ['Business', 'Hospitality & Tourism', 'Health & Care', 'Others'];
const MotionDiv = motion.div as any;

// --- Helper Functions ---
const syncToGoogleSheet = async (user: UserProfile, matches: JobProfile[], survey: any) => {
  if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL.includes('https://script.google.com/macros/s/AKfycbzUltI1DYskM9_Mwq3FR9LTtLTYQem9j8cfuV4YzTqgSr53Y90PBTfyR2KJq0DNDNNu/exec') || !GOOGLE_SHEET_URL.startsWith('https://script.google.com/macros/s/AKfycbzUltI1DYskM9_Mwq3FR9LTtLTYQem9j8cfuV4YzTqgSr53Y90PBTfyR2KJq0DNDNNu/exec')) {
    console.warn("Sync skipped: GOOGLE_SHEET_URL is not configured.");
    return;
  }
  const payload = {
    name: user.name,
    program: user.program,
    passions: user.passions,
    strength: user.strength,
    happiness: user.happiness,
    matches: matches.map(m => ({ title: m.title, archetype: m.archetype })),
    survey: survey
  };
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Sync failed:", err);
  }
};

const getArchetypeForTitle = (title: string): ArchetypeType => {
  const t = title.toLowerCase();
  if (t.includes('chef') || t.includes('analyst')) return 'The Alchemist';
  if (t.includes('eco') || t.includes('sustainable')) return 'The Eco-Warrior';
  if (t.includes('ai') || t.includes('tech') || t.includes('robot')) return 'The Tech Wizard';
  if (t.includes('guest') || t.includes('experience')) return 'The Experience Architect';
  if (t.includes('privacy') || t.includes('cyber') || t.includes('guard')) return 'The Guardian';
  if (t.includes('data') || t.includes('web')) return 'The Data Poet';
  if (t.includes('director') || t.includes('manager')) return 'The Strategist';
  if (t.includes('medical') || t.includes('coach') || t.includes('retreat')) return 'The Caregiver';
  return 'The Specialist';
};

// --- Shared Components ---
const ProfessionalAvatar = ({ src, className, alt = "avatar" }: { src: string, className?: string, alt?: string }) => {
  const [error, setError] = useState(false);
  const fallbackUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=professional-fallback`;
  return (
    <img 
      src={error ? fallbackUrl : src} 
      className={className} 
      alt={alt} 
      onError={() => setError(true)}
      loading="eager"
    />
  );
};

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const variants = {
    primary: "bg-arden-yellow text-arden-navy border-arden-yellow shadow-lg",
    secondary: "bg-transparent text-arden-navy border-arden-navy",
    outline: "bg-transparent text-white border-white",
    navy: "bg-arden-navy text-white border-arden-navy"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`px-8 py-5 rounded-2xl font-black transition-all transform active:scale-95 flex items-center justify-center gap-2 tracking-tight uppercase text-base border-2 ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {children}
    </button>
  );
};

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="mb-4 flex-1">
    <label className="block text-[10px] font-black mb-1.5 text-arden-teal uppercase tracking-widest ml-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-5 py-4 rounded-2xl bg-arden-navy border-2 border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-arden-yellow transition-all text-sm shadow-inner"
    />
  </div>
);

// --- Screen Components ---
const IntroScreen = ({ onStart }: { onStart: () => void }) => (
  <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-8 text-center bg-arden-navy relative overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-arden-teal/10 blur-[120px] rounded-full animate-blob" />
    <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-arden-yellow/10 blur-[120px] rounded-full animate-blob animation-delay-2000" />
    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 6 }} className="w-28 h-28 bg-arden-yellow rounded-3xl flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(255,182,0,0.3)]">
      <Heart className="w-14 h-14 text-arden-navy fill-arden-navy" />
    </motion.div>
    <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter text-white leading-none">Arden<span className="text-arden-yellow underline decoration-arden-teal underline-offset-8">Match</span></h1>
    <p className="text-arden-bluegrey font-bold mb-14 text-xl px-4 leading-snug">Discover the career that sparks joy.<br/>Personalized to your unique vibe.</p>
    <Button onClick={onStart} className="w-full max-w-xs text-lg py-6 group">Start Journey <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></Button>
  </MotionDiv>
);

const SetupScreen = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [formData, setFormData] = useState({ name: '', program: PROGRAMS[0], passion1: '', passion2: '', happy: '', strength: '' });
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const avatarOptions = useMemo(() => PROFESSIONAL_SEEDS.map(p => ({ url: p.customUrl || getAvatar(p.seed), seed: p.seed })), []);
  const isFormValid = formData.name.trim().length > 0 && selectedAvatar && formData.passion1.trim() && formData.passion2.trim() && formData.strength.trim() && formData.happy.trim();
  const handleNext = () => onComplete({ name: formData.name, program: formData.program, passions: [formData.passion1, formData.passion2], happiness: formData.happy, strength: formData.strength, avatarUrl: selectedAvatar });

  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar px-6 pt-12 pb-32 text-arden-navy">
      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <h2 className="text-xl md:text-2xl font-black text-arden-navy mb-8 leading-none tracking-tight">Tell us your<br/><span className="text-arden-teal">Vibe.</span></h2>
      </motion.div>
      <div className="space-y-6">
        <InputGroup label="Your Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="Alex" />
        <div>
          <label className="block text-[10px] font-black mb-2 text-arden-teal uppercase tracking-widest ml-1">Study Programme</label>
          <div className="relative">
            <select value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value as ProgramType})} className="w-full p-5 rounded-2xl bg-arden-navy text-white font-black appearance-none outline-none shadow-lg">
              {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-arden-teal"><RefreshCw size={18} /></div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black mb-3 text-arden-teal uppercase tracking-widest ml-1 text-center">Select Your Professional Avatar</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-1">
            {avatarOptions.map((opt) => (
               <button key={opt.seed} onClick={() => setSelectedAvatar(opt.url)} className={`aspect-square rounded-full border-4 transition-all duration-300 overflow-hidden relative ${selectedAvatar === opt.url ? 'border-arden-yellow scale-110 shadow-2xl z-10' : 'border-arden-bluegrey/20 bg-arden-bluegrey/10 hover:border-arden-teal/40'}`}>
                 <ProfessionalAvatar src={opt.url} className="w-full h-full object-cover scale-110" alt={opt.seed} />
               </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <h3 className="text-[11px] font-black text-arden-navy uppercase tracking-[0.2em] border-b-2 border-arden-bluegrey pb-2 mb-4">Vibe Check Questionnaire</h3>
          <div className="flex gap-4">
            <InputGroup label="Passion 1" value={formData.passion1} onChange={(v: string) => setFormData({...formData, passion1: v})} placeholder="Travel" />
            <InputGroup label="Passion 2" value={formData.passion2} onChange={(v: string) => setFormData({...formData, passion2: v})} placeholder="Tech" />
          </div>
          <div className="flex gap-4">
            <InputGroup label="Your Top Strength" value={formData.strength} onChange={(v: string) => setFormData({...formData, strength: v})} placeholder="Empathy" />
            <InputGroup label="What triggers happiness?" value={formData.happy} onChange={(v: string) => setFormData({...formData, happy: v})} placeholder="Growth" />
          </div>
        </div>
        <Button onClick={handleNext} disabled={!isFormValid} className="w-full mt-8 bg-arden-navy text-white border-arden-navy py-6 text-lg shadow-xl">Create Profile</Button>
      </div>
    </div>
  );
};

const SwipeCard: React.FC<{ job: JobProfile, onSwipe: (dir: 'left' | 'right') => void, style: any }> = ({ job, onSwipe, style }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const handleDragEnd = (_: any, info: any) => { 
    if (info.offset.x > 100 || info.velocity.x > 500) onSwipe('right'); 
    else if (info.offset.x < -100 || info.velocity.x < -500) onSwipe('left'); 
  };

  return (
    <MotionDiv 
      style={{ x, rotate, opacity, ...style }} 
      drag="x" 
      dragConstraints={{ left: 0, right: 0 }} 
      dragElastic={0.9} 
      onDragEnd={handleDragEnd} 
      className="absolute inset-0 w-full h-full bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,32,70,0.3)] overflow-hidden border border-arden-bluegrey/50 flex flex-col cursor-grab active:cursor-grabbing"
    >
      <div className="shrink-0 bg-gradient-to-br from-arden-bluegrey/30 to-arden-teal/10 flex flex-col items-center p-6 pt-10 relative">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-inner overflow-hidden flex items-center justify-center mb-4">
            <ProfessionalAvatar src={job.image} className="w-[110%] h-[110%] object-cover object-center" />
        </div>
        <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
          {job.isAI && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-arden-yellow text-arden-navy px-4 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 shadow-lg border border-white/20"><Sparkles size={10} /> AI</motion.div>}
          <div className="bg-arden-navy text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1.5 shadow-lg">{job.archetype}</div>
        </div>
        <div className="text-center w-full px-2">
          <h2 className="text-xl md:text-2xl font-black leading-tight mb-1 text-arden-navy drop-shadow-sm line-clamp-2">{job.title}</h2>
          <div className="text-arden-teal text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1"><MapPin size={10} /> {job.location}</div>
        </div>
      </div>
      <div className="flex-1 p-6 space-y-5 overflow-y-auto no-scrollbar bg-white" onPointerDown={e => e.stopPropagation()}>
        <div className="flex flex-wrap gap-2">{job.tags.map(t => <span key={t} className="text-[10px] font-black uppercase text-arden-teal bg-arden-teal/10 px-3 py-1.5 rounded-full">#{t}</span>)}</div>
        <div className="space-y-2">
           <h4 className="text-[10px] font-black uppercase text-arden-teal tracking-widest">Professional Mission</h4>
           <p className="text-xs font-bold text-arden-navy leading-relaxed opacity-90">{job.bio}</p>
        </div>
        {job.funFact && (
          <div className="bg-arden-yellow/10 p-4 rounded-2xl border border-arden-yellow/20 flex gap-3 items-start">
             <Lightbulb className="text-arden-yellow shrink-0" size={16} />
             <div>
                <h5 className="text-[9px] font-black uppercase text-arden-yellow mb-1">Did you know?</h5>
                <p className="text-[10px] font-bold text-arden-navy leading-tight">{job.funFact}</p>
             </div>
          </div>
        )}
        <div className="bg-arden-bluegrey/20 p-5 rounded-2xl border border-arden-bluegrey/40">
          <h4 className="text-[10px] font-black uppercase text-arden-navy mb-3 flex items-center gap-2"><Heart size={12} className="text-red-500 fill-current"/> Career Soulmate Factor</h4>
          <ul className="text-xs font-bold text-arden-navy space-y-3">{job.loveLanguage.slice(0, 5).map((l, i) => <li key={i} className="flex gap-2.5 items-start"><span>•</span> {l}</li>)}</ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase text-arden-teal tracking-widest">Skills Toolkit</h4>
          <div className="flex flex-wrap gap-2">{job.skills.map(s => <span key={s} className="bg-arden-navy text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-md">{s}</span>)}</div>
        </div>
      </div>
    </MotionDiv>
  );
};

const SwipingScreen = ({ user, initialDeck, onMatchComplete }: { user: UserProfile, initialDeck: JobProfile[], onMatchComplete: (matches: JobProfile[]) => void }) => {
  const [deck, setDeck] = useState<JobProfile[]>(initialDeck);
  const [matches, setMatches] = useState<JobProfile[]>([]);
  const [tier, setTier] = useState(1); 
  const [isRefilling, setIsRefilling] = useState(false);

  useEffect(() => { if (matches.length === 5) onMatchComplete(matches); }, [matches, onMatchComplete]);

  const handleNextTier = useCallback(() => {
    setIsRefilling(true);
    setTimeout(() => {
      if (tier === 1) {
        // Tier 2: The 70 Curated Roles (Guaranteed logic)
        const nextDeck = specialPositions.map((title, i): JobProfile => {
          const arch = getArchetypeForTitle(title);
          const def = ARCHETYPE_DEFAULTS[arch];
          return {
            id: `spec-${i}`, title, program: 'Any' as const, archetype: arch, 
            image: JOB_CLOUDINARY_POOL[i % JOB_CLOUDINARY_POOL.length],
            location: 'Career Fest Hub', bio: def.bio || 'Strategic professional role.', 
            lookingFor: 'Ambitious professionals ready to lead and innovate.',
            skills: def.skills || ['Strategy'], loveLanguage: def.loveLanguage || ['✨ Growth'], swipeRightIf: ['Impact'],
            funFact: def.funFact || 'Strategic role.', tags: ['Curated']
          };
        }).sort(() => Math.random() - 0.5);
        setDeck(nextDeck); 
        setTier(2);
      } else if (tier === 2 || tier === 3) {
        // Tier 3: The 180 Global Pool (Guaranteed never-ending logic)
        const extendedDeck: JobProfile[] = [];
        const archetypes = Object.keys(ARCHETYPE_DEFAULTS) as ArchetypeType[];
        for (let i = 0; i < 180; i++) {
          const arch = archetypes[i % archetypes.length];
          const def = ARCHETYPE_DEFAULTS[arch];
          extendedDeck.push({
            id: `global-${i}-${Math.random()}`, 
            title: `${arch.replace('The ', '')} Specialist - Variant ${i + 1}`,
            program: 'Any' as const, archetype: arch, 
            image: JOB_CLOUDINARY_POOL[i % JOB_CLOUDINARY_POOL.length],
            location: 'Global Discovery', bio: def.bio || 'High-performance career path.', 
            lookingFor: 'High-caliber talent with a drive for technical excellence.',
            skills: def.skills || ['Agility'], loveLanguage: def.loveLanguage || ['✨ Mastery'], swipeRightIf: ['Success'],
            funFact: def.funFact || 'Industry standard role.', tags: ['Discovery']
          });
        }
        setDeck(extendedDeck.sort(() => Math.random() - 0.5)); 
        setTier(3);
      }
      setIsRefilling(false);
    }, 800);
  }, [tier]);

  useEffect(() => { 
    if (deck.length === 0 && matches.length < 5 && !isRefilling) {
      handleNextTier(); 
    }
  }, [deck, matches, handleNextTier, isRefilling]);

  const handleSwipe = (dir: 'left' | 'right') => {
    if (matches.length >= 5 || isRefilling) return;
    const card = deck[deck.length - 1];
    if (!card) return;
    setDeck(prev => prev.slice(0, -1));
    if (dir === 'right') setMatches(prev => [...prev, card]);
  };

  return (
    <div className="h-full flex flex-col bg-arden-navy pt-8 relative overflow-hidden">
      <div className="px-8 flex items-center justify-between z-50">
        <motion.div layoutId="avatar" className="w-14 h-14 rounded-full bg-white border-2 border-arden-yellow shadow-lg overflow-hidden flex items-center justify-center">
            <ProfessionalAvatar src={user.avatarUrl} className="w-[110%] h-[110%] object-cover" />
        </motion.div>
        <div className="flex gap-2">
          {[0,1,2,3,4].map(i => <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i < matches.length ? 'w-10 bg-arden-yellow shadow-lg' : 'w-2.5 bg-white/20'}`} />)}
        </div>
      </div>

      <div className="flex-1 relative w-full max-w-[92%] mx-auto mt-4 mb-2 flex items-center justify-center">
        <AnimatePresence>
          {isRefilling ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
               <Loader2 className="animate-spin text-arden-yellow" size={48} />
               <p className="text-white text-xs font-black uppercase tracking-widest">Shuffling more paths...</p>
            </motion.div>
          ) : (
            deck.map((j, i) => (i >= deck.length - 2) && (
              <SwipeCard key={j.id} job={j} onSwipe={handleSwipe} style={{ scale: i === deck.length - 1 ? 1 : 0.94, y: i === deck.length - 1 ? 0 : 25, zIndex: i }} />
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="h-32 px-12 flex items-center justify-around pb-8 z-50">
        <button onClick={() => handleSwipe('left')} disabled={isRefilling} className="w-18 h-18 rounded-full bg-white border-4 border-red-500 flex items-center justify-center text-red-500 shadow-xl active:scale-90 transition-transform disabled:opacity-50"><X size={36} strokeWidth={4} /></button>
        <button onClick={() => handleSwipe('right')} disabled={isRefilling} className="w-22 h-22 rounded-full bg-arden-yellow border-4 border-white flex items-center justify-center text-arden-navy shadow-xl active:scale-90 transition-transform disabled:opacity-50"><Heart size={44} fill="currentColor" /></button>
      </div>
    </div>
  );
};

const SummaryScreen = ({ matches, onContinue }: { matches: JobProfile[], onContinue: () => void }) => {
  const aggregatedSkills = Array.from(new Set(matches.flatMap(m => m.skills)));
  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar p-6 space-y-10 pb-32 text-arden-navy">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-arden-navy leading-none">Your<br/><span className="text-arden-teal">Dream Team.</span></h2>
        <p className="text-gray-500 font-bold text-sm"> You selected 5 career soulmates today.</p>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {matches.map((m, i) => (
          <div key={i} className="min-w-[200px] bg-arden-navy rounded-3xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="h-28 bg-white rounded-2xl flex items-center justify-center p-2 overflow-hidden shadow-inner"><ProfessionalAvatar src={m.image} className="h-full w-full object-cover scale-110" /></div>
            <h4 className="text-white font-black text-xs leading-tight line-clamp-2">{m.title}</h4>
            <span className="text-[10px] font-black uppercase text-arden-teal">{m.archetype}</span>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-black text-arden-navy uppercase tracking-widest border-b-2 border-arden-bluegrey pb-2">Skills to Sharpen</h3>
        <div className="flex flex-wrap gap-2">{aggregatedSkills.slice(0, 10).map(s => <span key={s} className="bg-arden-teal text-white px-3 py-1.5 rounded-full text-[10px] font-black">{s}</span>)}</div>
      </div>
      <div className="space-y-6">
        <h3 className="text-xs font-black text-arden-navy uppercase tracking-widest border-b-2 border-arden-bluegrey pb-2">Professional Toolkit</h3>
        {RESOURCES.map((r, i) => (
          <div key={i} className="bg-arden-bluegrey/20 p-5 rounded-3xl border border-arden-bluegrey/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-arden-navy text-white rounded-xl flex items-center justify-center shrink-0">{r.icon}</div>
              <h4 className="font-black text-arden-navy text-sm">{r.title}</h4>
            </div>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">{r.desc}</p>
            <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-arden-teal font-black text-[10px] uppercase tracking-wider bg-white px-4 py-2 rounded-xl shadow-sm border border-arden-teal/20">Launch Tool <ExternalLink size={12} /></a>
          </div>
        ))}
      </div>
      <div className="pt-4"><Button onClick={onContinue} className="w-full bg-arden-navy text-white py-6 shadow-2xl">Get My Persona Report <ArrowRight size={20} /></Button></div>
    </div>
  );
};

const SurveyScreen = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [answers, setAnswers] = useState<any>({ q1: '', q2: '', q3: '', q3_other: '', q4: '', q5: '', q6: '', q6_other: '', q7: '' });
  
  const isComplete = 
    answers.q1 && 
    answers.q2 && 
    (answers.q3 === 'Others' ? answers.q3_other.trim() : answers.q3) && 
    answers.q4 && 
    answers.q5 && 
    (answers.q6 === 'Others' ? answers.q6_other.trim() : answers.q6);

  const questions = [
    { id: 'q1', text: "How many job titles were new to you today?", guide: "Reflect on whether this experience introduced you to unexpected paths.", options: ["Zero", "1-2", "3+"] },
    { id: 'q2', text: "Accuracy of AI persona?", guide: "Consider if the AI analysis felt personally relevant to your profile.", options: ["Accurate", "Mostly", "Generic"] },
    { id: 'q3', text: "Top takeaway?", guide: "Identify the most significant action or feeling you have right now.", options: ["Update CV", "Learn AI", "Confident", "Confused", "Others"] },
    { id: 'q4', text: "App experience vs standard board?", guide: "Tell us if the swipe-style interface made career searching more engaging.", options: ["Fun but less info", "Fun and informative", "Annoying"] },
    { id: 'q5', text: "Verdict for CareersFest?", guide: "Help us decide if this should become a staple at future Arden events.", options: ["YES", "Maybe", "No"] },
    { id: 'q6', text: "Feature for next update?", guide: "Vote for the one addition that would most improve your experience.", options: ["Real Links", "Save", "Chat", "Others"] }
  ];

  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar p-8 space-y-12 pb-32 text-arden-navy">
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-black text-arden-navy">CareerFest<br/><span className="text-arden-teal">Insight.</span></h2>
        <p className="text-[10px] font-bold text-gray-500 leading-snug italic opacity-80">Your honest feedback helps us shape the future of Arden's career support for you and your peers.</p>
      </div>
      {questions.map((q, idx) => (
        <div key={q.id} className="space-y-4">
          <p className="text-sm font-black text-arden-navy leading-snug"><span className="text-arden-teal">Q{idx+1}.</span> {q.text}</p>
          <p className="text-[10px] font-bold text-gray-400 -mt-3 leading-tight italic">{q.guide}</p>
          <div className="flex flex-col gap-3">
            {q.options.map(opt => (
              <button key={opt} onClick={() => setAnswers({...answers, [q.id]: opt})} className={`p-4 rounded-2xl text-left text-xs font-bold transition-all border-2 ${answers[q.id] === opt ? 'bg-arden-navy text-white border-arden-navy shadow-lg' : 'bg-arden-bluegrey/20 border-transparent text-gray-600'}`}>{opt}</button>
            ))}
          </div>
          {q.id === 'q3' && answers.q3 === 'Others' && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
                <textarea value={answers.q3_other} onChange={(e) => setAnswers({...answers, q3_other: e.target.value})} placeholder="Tell us your takeaway..." className="w-full p-4 rounded-2xl bg-arden-bluegrey/20 text-xs font-bold text-arden-navy min-h-[100px]" />
             </motion.div>
          )}
          {q.id === 'q6' && answers.q6 === 'Others' && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
                <textarea value={answers.q6_other} onChange={(e) => setAnswers({...answers, q6_other: e.target.value})} placeholder="Tell us more..." className="w-full p-4 rounded-2xl bg-arden-bluegrey/20 text-xs font-bold text-arden-navy min-h-[100px]" />
             </motion.div>
          )}
        </div>
      ))}
      <div className="space-y-4">
        <p className="text-sm font-black text-arden-navy leading-snug">Q7. Glitches or ideas?</p>
        <p className="text-[10px] font-bold text-gray-400 -mt-3 leading-tight italic">Help us fix bugs or brainstorm new ways to help students.</p>
        <textarea value={answers.q7} onChange={(e) => setAnswers({...answers, q7: e.target.value})} placeholder="Type here..." className="w-full p-5 rounded-3xl bg-arden-bluegrey/20 text-sm font-bold text-arden-navy min-h-[140px]" />
      </div>
      <div className="pt-6"><Button onClick={() => onComplete(answers)} disabled={!isComplete} className="w-full bg-arden-navy text-white py-6 shadow-xl">Finalize My Report <Sparkles size={18} /></Button></div>
    </div>
  );
};

const DiscoveryScreen = ({ user, onReady }: { user: UserProfile, onReady: (deck: JobProfile[]) => void }) => {
  useEffect(() => {
    const generateDeck = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Create 5 professional job roles for ${user.name} who is studying ${user.program}. Passions: ${user.passions.join(', ')}. Strength: ${user.strength}. Happiness trigger: ${user.happiness}. Return JSON array of objects with these keys: title, archetype, bio (must be at least 3 detailed sentences), location, lookingFor, skills (array of 5), loveLanguage (array of 5), swipeRightIf (array of 3), seed, tags (array of 1), funFact (a unique industry statistic or lighthearted fact), isAI: true. Tone: Corporate yet engaging.`;
        const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
        const jobsArray = JSON.parse(res.text || '[]');
        const aiJobs = jobsArray.map((j: any): JobProfile => ({ 
          ...j, 
          id: `ai-${Math.random()}`,
          program: user.program, 
          image: getAvatar(j.seed || j.title), 
          isAI: true,
          location: j.location || 'Innovation Hub',
          lookingFor: j.lookingFor || 'A dedicated team player.',
          swipeRightIf: j.swipeRightIf || ['Innovation']
        }));
        onReady(aiJobs);
      } catch (e) { onReady([]); } 
    };
    generateDeck();
  }, [user, onReady]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-arden-navy text-center">
      <motion.div animate={{ rotate: 360, scale: [1, 1.3, 1], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-arden-teal mb-10"><RefreshCw size={100} /></motion.div>
      <h2 className="text-xl md:text-2xl font-black text-white mb-3">Manifesting...</h2>
      <p className="text-arden-teal font-black uppercase tracking-[0.3em] text-[10px] opacity-80">Architecting Your Personal Future</p>
    </div>
  );
};

const App = () => {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [deck, setDeck] = useState<JobProfile[]>([]);
  const [matches, setMatches] = useState<JobProfile[]>([]);
  const [persona, setPersona] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePersona = async () => {
    if (!user) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `User: ${user.name}. Matches: ${matches.map(m => m.title).join(', ')}. Passions: ${user.passions.join(', ')}. JSON: {title: "Persona Title", analysis: "2-sentence linking matches to potential"}.`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt, config: { responseMimeType: 'application/json' } });
      setPersona(JSON.parse(res.text || '{}'));
    } catch (e) { setPersona({ title: 'The Executive Strategist', analysis: 'Analytical leadership.' }); }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !user) return;
    setIsDownloading(true);
    try {
      // @ts-ignore
      await window.html2pdf().set({ margin: 10, filename: `ArdenMatch_${user.name}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { format: 'a4' } }).from(reportRef.current).save();
    } catch (err) { window.print(); } finally { setIsDownloading(false); }
  };

  return (
    <div className="w-full h-screen bg-arden-navy overflow-hidden font-sans select-none touch-none">
      <div className="w-full h-full max-w-lg mx-auto relative flex flex-col shadow-2xl bg-white/5">
        <AnimatePresence mode="wait">
          {screen === 'onboarding' && <IntroScreen onStart={() => setScreen('setup')} />}
          {screen === 'setup' && <SetupScreen onComplete={(p) => { setUser(p); setScreen('discovering'); }} />}
          {screen === 'discovering' && user && <DiscoveryScreen user={user} onReady={(d) => { setDeck(d); setScreen('swiping'); }} />}
          {screen === 'swiping' && user && <SwipingScreen user={user} initialDeck={deck} onMatchComplete={(m) => { setMatches(m); setScreen('summary'); }} />}
          {screen === 'summary' && <SummaryScreen matches={matches} onContinue={() => setScreen('survey')} />}
          {screen === 'survey' && <SurveyScreen onComplete={(ans) => { if (user) syncToGoogleSheet(user, matches, ans); generatePersona(); setScreen('results'); }} />}
          {screen === 'results' && user && (
            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center bg-white overflow-y-auto no-scrollbar">
              <div ref={reportRef} className="w-full bg-white pdf-report-container text-arden-navy">
                <div className="bg-arden-navy p-8 pb-16 text-center text-white shrink-0">
                  <div className="w-28 h-28 rounded-full border-4 border-arden-yellow bg-white mx-auto mb-6 overflow-hidden"><ProfessionalAvatar src={user.avatarUrl} className="w-full h-full object-cover" /></div>
                  <h1 className="text-3xl font-black mb-1">Arden Match Report</h1>
                  <p className="text-arden-teal text-xs font-black tracking-widest">Personal Discovery</p>
                </div>
                <div className="px-8 -mt-10 space-y-8 pb-32">
                  <div className="bg-white rounded-[2rem] p-8 shadow-2xl border space-y-4">
                    <div className="flex items-center gap-3"><Star className="text-arden-yellow fill-arden-yellow" size={20} /><h3 className="text-xs font-black uppercase text-arden-teal tracking-widest">AI Persona</h3></div>
                    <h2 className="text-2xl font-black leading-none">{persona?.title || 'Leader'}</h2>
                    <p className="text-sm font-bold text-gray-500 italic border-l-4 border-arden-yellow pl-4">{persona?.analysis}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest border-b pb-2">Your Career Matches</h3>
                    <div className="grid gap-3">{matches.map((m, i) => (<div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border"><div className="w-10 h-10 rounded-xl overflow-hidden bg-white"><ProfessionalAvatar src={m.image} className="w-full h-full object-cover" /></div><div className="flex-1"><p className="text-xs font-black leading-tight">{m.title}</p><p className="text-[9px] font-black uppercase text-arden-teal">{m.archetype}</p></div><Check className="text-arden-teal" size={16} /></div>))}</div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest border-b pb-2">Your Professional Toolkit</h3>
                    <div className="space-y-3">
                      {RESOURCES.map((r, i) => (
                        <div key={i} className="bg-arden-bluegrey/10 p-4 rounded-2xl border border-arden-bluegrey/20 flex items-start gap-4">
                          <div className="w-8 h-8 bg-arden-navy text-white rounded-lg flex items-center justify-center shrink-0">
                            {r.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-arden-navy">{r.title}</h4>
                            <p className="text-[10px] font-bold text-gray-500 leading-tight mb-1">{r.desc}</p>
                            <div className="flex items-center gap-1 text-[9px] font-black text-arden-teal uppercase">
                               <LinkIcon size={10} /> {r.link.replace('https://', '')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="fixed bottom-0 left-0 w-full p-6 bg-white flex flex-col gap-3">
                <Button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full bg-arden-navy text-white py-6 shadow-2xl">{isDownloading ? <Loader2 className="animate-spin" /> : <>Download Report <Download size={22} /></>}</Button>
                <button onClick={() => window.location.reload()} className="text-arden-teal font-black text-[10px] uppercase tracking-widest text-center mt-2">New Journey</button>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
createRoot(document.getElementById('root')!).render(<App />);
