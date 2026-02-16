
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Briefcase, Heart, X, Check, ArrowRight, RefreshCw, Star, MapPin, Search, Lightbulb, UserCircle, Download } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { jobs, JobProfile, ProgramType } from './jobs';

// --- Types & State ---

interface UserProfile {
  name: string;
  program: ProgramType;
  passions: [string, string];
  happiness: [string, string];
  strengths: [string, string];
  avatarUrl: string;
}

interface SurveyData {
    funRating: number;
    recommend: boolean | null;
    foundInterest: boolean | null;
    unknownJob: boolean | null;
    surpriseLevel: 'Not at all' | 'A little' | 'Totally shocked me' | '';
    futureFeeling: string;
    discoveryAnswer: string;
    realisationAnswer: string;
    perceptionAnswer: string;
    email: string;
    timestamp: string;
    userProfile: UserProfile;
    matchedJobs: string[];
}

type Screen = 'onboarding' | 'setup' | 'swiping' | 'results' | 'survey' | 'email' | 'success';

// --- Constants ---
const PROGRAMS: ProgramType[] = ['Business', 'Hospitality & Tourism', 'Health & Care'];
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop'; // Generic professional workspace

// --- Workaround for Framer Motion Type Errors ---
const MotionDiv = motion.div as any;

// --- Helper Components ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-6 py-4 rounded-xl font-bold transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 shadow-lg tracking-wide";
  const variants = {
    // Primary: Vibrant Yellow with Navy Text
    primary: "bg-arden-yellow text-arden-navy hover:bg-yellow-400 border-2 border-arden-yellow",
    // Secondary: Transparent with Yellow Border
    secondary: "bg-transparent text-arden-yellow border-2 border-arden-yellow hover:bg-arden-yellow/10",
    // Outline: White border
    outline: "bg-transparent text-white border-2 border-white hover:bg-white/10"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const InputGroup = ({ label, value, onChange, placeholder }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-bold mb-1 text-arden-teal ml-1 uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl bg-arden-navy border-2 border-arden-bluegrey/20 text-white placeholder-gray-500 focus:outline-none focus:border-arden-yellow focus:ring-1 focus:ring-arden-yellow transition-colors"
    />
  </div>
);

// --- Admin Helper ---
const downloadCSV = () => {
    const data = localStorage.getItem('arden_survey_data');
    if (!data) {
        alert("No survey data found yet.");
        return;
    }
    const parsed: SurveyData[] = JSON.parse(data);
    
    // Create CSV Header
    const headers = [
        "Date", "Name", "Program", "Matched Jobs", "Email",
        "Fun Rating", "Recommend", "Found Interest", "Unknown Job", "Surprise Level", "Feeling",
        "Discovery (Skill)", "Realisation (Surprise Job)", "Perception Change"
    ];

    // Map rows
    const rows = parsed.map(row => [
        row.timestamp,
        `"${row.userProfile.name}"`,
        row.userProfile.program,
        `"${row.matchedJobs.join(', ')}"`,
        row.email,
        row.funRating,
        row.recommend ? 'Yes' : 'No',
        row.foundInterest ? 'Yes' : 'No',
        row.unknownJob ? 'Yes' : 'No',
        row.surpriseLevel,
        row.futureFeeling,
        `"${row.discoveryAnswer.replace(/"/g, '""')}"`,
        `"${row.realisationAnswer.replace(/"/g, '""')}"`,
        `"${row.perceptionAnswer.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "arden_match_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- Screen 1: Onboarding / Intro ---
const IntroScreen = ({ onStart }: { onStart: () => void }) => (
  <MotionDiv 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
  >
    {/* Admin Download Button (Hidden/Subtle) */}
    <button onClick={downloadCSV} className="absolute top-4 left-4 p-2 text-arden-bluegrey/30 hover:text-white z-50">
        <Download size={16} />
    </button>

    {/* Background Shapes */}
    <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-arden-teal/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
    <div className="absolute bottom-[-20%] left-[-20%] w-80 h-80 bg-arden-yellow/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

    <div className="w-28 h-28 bg-arden-yellow rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,182,0,0.5)] animate-bounce-slow relative z-10">
      <Heart className="w-14 h-14 text-arden-navy" fill="currentColor" />
    </div>
    
    <h1 className="text-5xl font-extrabold mb-4 text-white relative z-10">
      Arden<span className="text-arden-yellow">Match</span>
    </h1>
    
    <p className="text-lg text-arden-bluegrey mb-10 max-w-xs font-medium relative z-10">
      Swipe your way to your dream future. Find the career that loves you back.
    </p>
    
    <div className="relative z-10 w-full max-w-xs">
        <Button onClick={onStart} className="w-full text-lg">
            Find My Match <ArrowRight size={24} />
        </Button>
    </div>
  </MotionDiv>
);

// --- Component: Avatar Selection ---
const AvatarSelection = ({ program, selectedAvatar, onSelect }: { program: ProgramType, selectedAvatar: string, onSelect: (url: string) => void }) => {
    
    const avatarOptions = useMemo(() => {
        let clothing = 'shirtCrewNeck';
        let clothingColor = '262e33';
        
        // Define costume logic
        if (program === 'Business') {
            clothing = 'blazerAndShirt';
            clothingColor = '002046'; // Navy
        } else if (program === 'Health & Care') {
            clothing = 'overall'; // Scrubs look
            clothingColor = '47c3d3'; // Teal
        } else if (program === 'Hospitality & Tourism') {
            clothing = 'collarAndSweater';
            clothingColor = 'ffb600'; // Arden Yellow / Vibrant
        }

        const seeds = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Jamie', 'Morgan', 'Drew'];
        
        return seeds.map(seed => {
            // Add randomness to accessories/hair for variety
            // Force happy expression with mouth=smile and friendly eyebrows
            return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}-${program}&backgroundColor=b6e3f4&clothing=${clothing}&clothingColor=${clothingColor}&mouth=smile&eyebrows=default,raisedExcited`;
        });
    }, [program]);

    return (
        <div className="mb-6">
            <label className="block text-sm font-bold mb-3 text-arden-teal ml-1 uppercase tracking-wider flex items-center gap-2">
                <UserCircle size={16} /> Choose Your Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map((url, idx) => (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSelect(url)}
                        className={`relative rounded-full overflow-hidden border-4 transition-all aspect-square ${selectedAvatar === url ? 'border-arden-yellow scale-110 shadow-[0_0_15px_rgba(255,182,0,0.5)]' : 'border-transparent hover:border-white/50 opacity-80 hover:opacity-100'}`}
                    >
                        <img src={url} alt="avatar option" className="w-full h-full object-cover bg-white" />
                        {selectedAvatar === url && (
                            <div className="absolute inset-0 bg-arden-navy/20 flex items-center justify-center">
                                <Check size={20} className="text-white drop-shadow-md" strokeWidth={4} />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// --- Screen 2: Profile Setup ---
const SetupScreen = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    program: PROGRAMS[0],
    passion1: '',
    passion2: '',
    happy1: '',
    happy2: '',
    strength1: '',
    strength2: ''
  });

  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  // Reset avatar choice when program changes to ensure costume matches
  useEffect(() => {
    setSelectedAvatar('');
  }, [formData.program]);

  const isFormValid = Object.values(formData).every(val => (val as string).trim().length > 0) && selectedAvatar !== '';
  
  const handleSubmit = () => {
    if (!isFormValid) return;
    setIsGenerated(true);
    // Simulate a small delay for "generating" feel
    setTimeout(() => {
      onComplete({
        name: formData.name,
        program: formData.program,
        passions: [formData.passion1, formData.passion2],
        happiness: [formData.happy1, formData.happy2],
        strengths: [formData.strength1, formData.strength2],
        avatarUrl: selectedAvatar
      });
    }, 1500);
  };

  if (isGenerated) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-arden-navy">
        <MotionDiv 
          initial={{ scale: 0 }} animate={{ scale: 1 }} 
          className="relative"
        >
          <img src={selectedAvatar} alt="Avatar" className="w-40 h-40 rounded-full border-4 border-arden-yellow shadow-[0_0_40px_rgba(255,182,0,0.3)] bg-white mb-6" />
          <MotionDiv 
            initial={{ scale: 0 }} animate={{ scale: 1 }} delay={0.3}
            className="absolute -bottom-2 -right-2 bg-arden-teal p-2 rounded-full border-4 border-arden-navy"
          >
            <Check size={24} className="text-white" />
          </MotionDiv>
        </MotionDiv>
        <h2 className="text-3xl font-bold mb-2 text-white">Looking good,<br/><span className="text-arden-yellow">{formData.name}!</span></h2>
        <p className="text-arden-bluegrey mb-8 text-lg">Your profile is ready for the festival.</p>
        <div className="flex gap-3">
            <span className="w-3 h-3 bg-arden-teal rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-arden-yellow rounded-full animate-bounce delay-75"></span>
            <span className="w-3 h-3 bg-arden-teal rounded-full animate-bounce delay-150"></span>
        </div>
      </div>
    );
  }

  return (
    <MotionDiv 
      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="h-full overflow-y-auto px-6 py-8 no-scrollbar bg-white"
    >
      <h2 className="text-3xl font-extrabold mb-6 text-arden-navy">Create Your <span className="text-arden-teal">Profile</span></h2>
      
      <div className="space-y-6">
        {/* Section 1: Basics */}
        <div className="space-y-4">
            <InputGroup label="What's your name?" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="e.g. Alex" />
            
            <div className="mb-2">
            <label className="block text-sm font-bold mb-1 text-arden-teal ml-1 uppercase tracking-wider">What do you study?</label>
            <div className="relative">
                <select 
                    value={formData.program} 
                    onChange={(e) => setFormData({...formData, program: e.target.value as ProgramType})}
                    className="w-full px-4 py-3 rounded-xl bg-arden-navy border-2 border-arden-bluegrey/20 text-white focus:outline-none focus:border-arden-yellow appearance-none"
                >
                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-arden-yellow">
                    <ArrowRight size={20} className="rotate-90" />
                </div>
            </div>
            </div>
        </div>

        {/* Section 2: Avatar Selection */}
        <AvatarSelection 
            program={formData.program} 
            selectedAvatar={selectedAvatar} 
            onSelect={setSelectedAvatar} 
        />

        {/* Section 3: Attributes */}
        <div className="space-y-4">
            <h3 className="font-bold text-arden-navy uppercase tracking-wider text-sm border-b border-gray-200 pb-2">About You</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Passion #1" value={formData.passion1} onChange={(v: string) => setFormData({...formData, passion1: v})} placeholder="Travel" />
                <InputGroup label="Passion #2" value={formData.passion2} onChange={(v: string) => setFormData({...formData, passion2: v})} placeholder="Gaming" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Happiness Trigger #1" value={formData.happy1} onChange={(v: string) => setFormData({...formData, happy1: v})} placeholder="Sunsets" />
                <InputGroup label="Happiness Trigger #2" value={formData.happy2} onChange={(v: string) => setFormData({...formData, happy2: v})} placeholder="Pizza" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputGroup label="My Strength #1" value={formData.strength1} onChange={(v: string) => setFormData({...formData, strength1: v})} placeholder="Creativity" />
                <InputGroup label="My Strength #2" value={formData.strength2} onChange={(v: string) => setFormData({...formData, strength2: v})} placeholder="Listening" />
            </div>
        </div>

        <div className="pt-2 pb-12">
          <Button onClick={handleSubmit} disabled={!isFormValid} className="w-full shadow-xl">
            Confirm Profile & Start Match
          </Button>
        </div>
      </div>
    </MotionDiv>
  );
};

// --- Component: Swipe Card ---
const SwipeCard: React.FC<{ job: JobProfile, onSwipe: (dir: 'left' | 'right') => void, style: any }> = ({ job, onSwipe, style }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Feedback overlay opacity - Adjusted to show up sooner and stronger
    const likeOpacity = useTransform(x, [20, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);

    // Image Fallback Handling
    const [imageSrc, setImageSrc] = useState(job.image || FALLBACK_IMAGE);
    
    const handleImageError = () => {
        setImageSrc(FALLBACK_IMAGE);
    };
  
    const handleDragEnd = (event: any, info: any) => {
      if (info.offset.x > 100) {
        onSwipe('right');
      } else if (info.offset.x < -100) {
        onSwipe('left');
      }
    };
  
    return (
      <MotionDiv
        style={{ x, rotate, opacity, ...style }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        className="absolute top-0 left-0 w-full h-[620px] bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-800 cursor-grab active:cursor-grabbing origin-bottom border border-arden-bluegrey"
        whileTap={{ scale: 1.02 }}
      >
        {/* Feedback Overlays - Updated with Higher Z-Index and BG */}
        <MotionDiv style={{ opacity: likeOpacity }} className="absolute top-12 left-8 z-[100] p-4 rounded-full border-8 border-arden-teal bg-white shadow-2xl transform -rotate-12 pointer-events-none">
            <Heart size={80} className="text-arden-teal fill-arden-teal" />
        </MotionDiv>
        <MotionDiv style={{ opacity: nopeOpacity }} className="absolute top-12 right-8 z-[100] p-4 rounded-full border-8 border-red-500 bg-white shadow-2xl transform rotate-12 pointer-events-none">
            <X size={80} className="text-red-500" strokeWidth={5} />
        </MotionDiv>

        {/* Header Image Area (35%) */}
        <div className="h-[35%] w-full relative bg-arden-navy/10">
            <img 
                src={imageSrc} 
                alt={job.title} 
                onError={handleImageError}
                className="w-full h-full object-cover pointer-events-none" 
            />
            <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-arden-navy via-arden-navy/80 to-transparent flex items-end p-5">
                <div className="w-full">
                    <h2 className="text-2xl font-bold text-white leading-tight mb-1">{job.title}</h2>
                    <p className="text-arden-yellow font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Briefcase size={14} /> {job.age}
                    </p>
                </div>
            </div>
        </div>

        {/* Content Area (65%) - Scrollable */}
        <div 
            ref={scrollRef}
            className="h-[65%] overflow-y-auto px-5 pb-6 bg-white space-y-5 no-scrollbar"
            onPointerDown={(e) => e.stopPropagation()} // Allow scrolling without dragging
        >
             {/* Location Badge */}
             <div className="flex flex-wrap gap-2 mt-4">
                 <div className="inline-flex items-center gap-1 bg-arden-bluegrey px-3 py-1 rounded-full text-xs font-bold text-arden-navy uppercase tracking-wide">
                    <MapPin size={12} /> {job.location}
                 </div>
                 {job.tags.slice(0,2).map(t => (
                    <div key={t} className="inline-flex items-center gap-1 border border-arden-teal/50 px-3 py-1 rounded-full text-xs font-bold text-arden-teal uppercase tracking-wide">
                        #{t}
                    </div>
                 ))}
             </div>

             {/* Bio */}
             <div className="space-y-1">
                 <h3 className="text-xs font-bold uppercase text-arden-grey tracking-wider">About Me</h3>
                 <p className="text-sm text-arden-navy leading-relaxed font-medium">{job.bio}</p>
             </div>

             {/* Looking For */}
             <div className="space-y-1">
                 <h3 className="text-xs font-bold uppercase text-arden-grey tracking-wider flex items-center gap-1">
                    <Search size={12} /> Looking For
                 </h3>
                 <p className="text-sm text-arden-navy leading-relaxed">{job.lookingFor}</p>
             </div>
             
            {/* Skills Needed - Added Section */}
            <div className="space-y-2">
                 <h3 className="text-xs font-bold uppercase text-arden-grey tracking-wider flex items-center gap-1">
                    {/* Dna icon replaced by simple text/emoji as Dna is not imported or needed */}
                    🧬 Skills Needed
                 </h3>
                 <div className="flex flex-wrap gap-2">
                     {job.skills && job.skills.map((skill, idx) => (
                         <span key={idx} className="bg-arden-navy/5 text-arden-navy text-xs font-bold px-3 py-1.5 rounded-lg border border-arden-navy/10">
                            {skill}
                         </span>
                     ))}
                 </div>
            </div>

             {/* Love Language */}
             <div className="bg-arden-bluegrey/30 rounded-xl p-4 border border-arden-bluegrey">
                <div className="text-xs font-bold text-arden-teal uppercase mb-2 flex items-center gap-1">
                    <Heart size={12} fill="currentColor" /> My Love Language
                </div>
                <ul className="space-y-2">
                    {job.loveLanguage.map((item, idx) => (
                        <li key={idx} className="text-xs font-bold text-arden-navy flex items-start gap-2">
                            <span className="text-arden-yellow text-lg leading-none">•</span> {item}
                        </li>
                    ))}
                </ul>
             </div>

             {/* Swipe Right If */}
             <div className="space-y-2">
                 <h3 className="text-xs font-bold uppercase text-arden-grey tracking-wider">Swipe Right If...</h3>
                 <ul className="space-y-2">
                    {job.swipeRightIf.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-arden-navy font-medium">
                            <Check size={16} className="text-arden-teal mt-0.5 flex-shrink-0" strokeWidth={3} />
                            <span>{item}</span>
                        </li>
                    ))}
                 </ul>
             </div>

             {/* Fun Fact */}
             <div className="bg-arden-yellow/10 rounded-xl p-3 border-l-4 border-arden-yellow mt-2">
                 <div className="text-xs font-bold text-arden-navy/70 uppercase mb-1 flex items-center gap-1">
                     <Lightbulb size={12} fill="currentColor" className="text-arden-yellow" /> Fun Fact
                 </div>
                 <p className="text-xs text-arden-navy italic">"{job.funFact}"</p>
             </div>

             {/* Spacer for bottom padding */}
             <div className="h-4"></div>
        </div>
      </MotionDiv>
    );
};

// --- Screen 3: Swiping ---
const SwipingScreen = ({ user, onMatchComplete }: { user: UserProfile, onMatchComplete: (matches: JobProfile[]) => void }) => {
  const [deck, setDeck] = useState<JobProfile[]>([]);
  const [matches, setMatches] = useState<JobProfile[]>([]);
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [seenHistory, setSeenHistory] = useState<string[]>([]); // Track seen IDs

  // Initialize deck based on program ONLY first
  useEffect(() => {
    // 1. Get core jobs strictly for the program (plus 'Any' if applicable)
    // This ensures NO wildcards initially.
    const coreJobs = jobs.filter(j => j.program === user.program || j.program === 'Any');
    
    // 2. Shuffle
    const initialDeck = coreJobs.sort(() => 0.5 - Math.random());
    setDeck(initialDeck);
  }, [user.program]);

  // Check for finish condition
  useEffect(() => {
    if (matches.length >= 5) {
      onMatchComplete(matches);
    }
  }, [matches, onMatchComplete]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (deck.length === 0) return;
    
    const currentCard = deck[deck.length - 1];
    setLastDirection(direction);
    setSeenHistory(prev => [...prev, currentCard.id]);
    
    // Remove current card
    const newDeck = deck.slice(0, -1);
    setDeck(newDeck);

    if (direction === 'right') {
      setMatches([...matches, currentCard]);
    }

    // Refill logic: Only if deck is empty and we haven't finished matching
    if (newDeck.length === 0 && matches.length < 5) { // < 5 check is approximate as state updates async, but safe
       
       // Calculate what we have seen so far (including current card)
       const allSeen = new Set([...seenHistory, currentCard.id]);
       
       // PRIORITY 1: Find remaining jobs in the SAME program
       let available = jobs.filter(j => 
           (j.program === user.program || j.program === 'Any') && 
           !allSeen.has(j.id)
       );
       
       // PRIORITY 2: Only if current program is exhausted, allow other sectors (Wildcards)
       if (available.length === 0) {
           console.log("Sector exhausted, unlocking wildcards.");
           available = jobs.filter(j => 
               j.program !== user.program && 
               j.program !== 'Any' && 
               !allSeen.has(j.id)
           );
       }
       
       // PRIORITY 3: If everything is exhausted, recycle cards not matched (safety net)
       if (available.length === 0) {
            available = jobs.filter(j => !matches.find(m => m.id === j.id) && j.id !== currentCard.id);
       }

       if (available.length > 0) {
           const refill = available.sort(() => 0.5 - Math.random());
           // Small delay for UX transition
           setTimeout(() => setDeck(refill), 500); 
       }
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-arden-navy">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center z-10 bg-arden-navy/90 backdrop-blur-sm sticky top-0">
            <div className="flex items-center gap-3">
                <img src={user.avatarUrl} className="w-10 h-10 rounded-full bg-white border-2 border-arden-yellow" alt="avatar" />
                <div>
                    <div className="text-[10px] font-bold text-arden-teal uppercase tracking-widest">Your Matches</div>
                    <div className="flex gap-1.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i < matches.length ? 'w-6 bg-arden-yellow shadow-[0_0_8px_rgba(255,182,0,0.6)]' : 'w-2 bg-white/20'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Card Stack */}
        <div className="flex-1 relative flex items-center justify-center w-full max-w-md mx-auto perspective-1000 mt-[-20px] z-0">
             <AnimatePresence>
                {deck.map((job, index) => {
                    // Only render top 2 cards for performance
                    if (index < deck.length - 2) return null;
                    const isTop = index === deck.length - 1;
                    return (
                        <SwipeCard 
                            key={job.id} 
                            job={job} 
                            onSwipe={handleSwipe}
                            style={{ 
                                scale: isTop ? 1 : 0.95, 
                                y: isTop ? 0 : 10,
                                zIndex: index 
                            }} 
                        />
                    );
                })}
             </AnimatePresence>
             
             {deck.length === 0 && (
                 <div className="text-center p-8 animate-pulse text-arden-bluegrey">
                     <p className="text-xl font-bold">Reshuffling the deck...</p>
                 </div>
             )}
        </div>

        {/* Controls - Updated for Visibility & Clickability (z-100) */}
        <div className="h-28 px-8 pb-8 flex items-center justify-center gap-10 z-[100]">
             <button 
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-white border-4 border-red-500 flex items-center justify-center text-red-500 shadow-xl active:scale-90 transition-transform hover:scale-105 hover:bg-red-50 cursor-pointer"
             >
                 <X size={36} strokeWidth={4} />
             </button>
             <button 
                onClick={() => handleSwipe('right')}
                className="w-20 h-20 rounded-full bg-arden-yellow border-4 border-white flex items-center justify-center text-arden-navy shadow-[0_0_30px_rgba(255,182,0,0.6)] active:scale-90 transition-transform hover:scale-105 hover:bg-yellow-400 cursor-pointer"
             >
                 <Heart size={44} fill="currentColor" />
             </button>
        </div>
    </div>
  );
};

// --- Screen 4: Results ---
const ResultsScreen = ({ user, matches, onNext }: { user: UserProfile, matches: JobProfile[], onNext: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{title: string, analysis: string, trait: string} | null>(null);

    useEffect(() => {
        const generatePersona = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                const systemInstruction = `You are a lively, witty career psychologist at a university festival. Your audience is Gen Z students. Tone: Exciting, personalized, like a "Spotify Wrapped" for careers.`;
                
                const prompt = `
                    User Profile:
                    Name: ${user.name}
                    Program: ${user.program}
                    Passions: ${user.passions.join(', ')}
                    Strengths: ${user.strengths.join(', ')}
                    Happiness Triggers: ${user.happiness.join(', ')}

                    Matched Jobs (The user swiped right on these):
                    ${matches.map(m => `- ${m.title} (Tags: ${m.tags.join(', ')})`).join('\n')}

                    Task:
                    1. Create a fun "Persona Title" (e.g., "Compassionate Adrenaline Junkie", "The Corporate Rockstar").
                    2. Write a 2-sentence witty psychoanalysis of why they fit these roles. **IMPORTANT: You MUST explicitly mention how their specific Passions ("${user.passions.join(', ')}") or Strengths connect to these jobs. Explain why their Happiness Trigger ("${user.happiness.join(', ')}") makes them a perfect match for this career lifestyle.**
                    3. Identify 1 key personality trait (e.g., "Empathy", "Ambition", "Creativity").

                    Return valid JSON only: { "title": "...", "analysis": "...", "trait": "..." }
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: 'application/json',
                        systemInstruction: systemInstruction
                    }
                });

                const text = response.text;
                if (text) {
                    setResult(JSON.parse(text));
                }
            } catch (e) {
                console.error(e);
                // Fallback result in case of API failure (offline mode MVP safety)
                setResult({
                    title: "The Future Icon",
                    analysis: "You have impeccable taste and a drive that can't be stopped. The world is your oyster!",
                    trait: "Ambition"
                });
            } finally {
                setLoading(false);
            }
        };

        generatePersona();
    }, [user, matches]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-arden-navy">
                <div className="w-24 h-24 border-4 border-arden-bluegrey/20 border-t-arden-yellow rounded-full animate-spin"></div>
                <h2 className="text-3xl font-bold animate-pulse text-white">Analyzing your vibe...</h2>
                <p className="text-arden-teal text-lg">Crunching the career numbers</p>
            </div>
        );
    }

    return (
        <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="h-full overflow-y-auto px-6 py-8 no-scrollbar bg-arden-navy flex flex-col"
        >
            {/* Header Result Card */}
            <div className="bg-gradient-to-br from-arden-teal to-blue-600 rounded-3xl p-8 shadow-2xl border-4 border-arden-yellow/50 mb-8 text-center relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                
                <img src={user.avatarUrl} className="w-28 h-28 rounded-full border-4 border-white mx-auto mb-4 bg-white shadow-xl" alt="avatar" />
                
                <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-2">Your Career Persona</h3>
                <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
                    {result?.title}
                </h1>
                
                <p className="text-white text-md font-medium leading-relaxed mb-6 opacity-95">
                    "{result?.analysis}"
                </p>

                <div className="inline-block bg-white text-arden-navy px-6 py-2 rounded-full font-bold shadow-lg">
                    {result?.trait}
                </div>
            </div>

            {/* Matches Summary */}
            <div className="mb-8 flex-shrink-0">
                <h3 className="text-xs font-bold text-arden-bluegrey uppercase mb-4 px-1 tracking-wider">You Matched With</h3>
                <div className="flex -space-x-4 overflow-hidden px-2 py-2">
                    {matches.map((m, i) => (
                         <img key={i} src={m.image} className="inline-block h-14 w-14 rounded-full ring-4 ring-arden-navy object-cover shadow-lg" alt={m.title} />
                    ))}
                    <div className="h-14 w-14 rounded-full bg-arden-yellow ring-4 ring-arden-navy flex items-center justify-center text-xs font-bold text-arden-navy shadow-lg z-10">
                        +Matches
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                 <Button onClick={onNext} className="w-full shadow-xl">
                    Unlock Full Report <ArrowRight size={20} />
                 </Button>
            </div>
        </MotionDiv>
    );
};

// --- Screen 5: Survey ---
const SurveyScreen = ({ onComplete }: { onComplete: (data: Partial<SurveyData>) => void }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<Partial<SurveyData>>({
        funRating: 0,
        recommend: null,
        foundInterest: null,
        unknownJob: null,
        surpriseLevel: '',
        futureFeeling: '',
        discoveryAnswer: '',
        realisationAnswer: '',
        perceptionAnswer: ''
    });

    const updateData = (key: keyof SurveyData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const isStep1Valid = data.funRating! > 0 && data.recommend !== null;
    const isStep2Valid = data.foundInterest !== null;
    const isStep3Valid = data.unknownJob !== null && data.surpriseLevel !== '';
    const isStep4Valid = data.futureFeeling !== '';
    const isStep5Valid = data.discoveryAnswer && data.realisationAnswer && data.perceptionAnswer;

    return (
        <MotionDiv 
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
            className="h-full overflow-y-auto px-6 py-8 bg-white text-arden-navy"
        >
             <div className="mb-6">
                 <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs font-bold bg-arden-navy text-white px-2 py-1 rounded">Step {step}/5</span>
                     <h2 className="text-xl font-bold">Quick Feedback</h2>
                 </div>
                 <div className="w-full h-2 bg-gray-200 rounded-full">
                     <div className="h-full bg-arden-teal rounded-full transition-all duration-300" style={{ width: `${(step/5)*100}%` }}></div>
                 </div>
             </div>

             {step === 1 && (
                 <div className="space-y-8">
                     <div>
                         <label className="block text-lg font-bold mb-4">How fun was this experience?</label>
                         <div className="flex justify-between px-2">
                             {[1,2,3,4,5].map(n => (
                                 <button key={n} onClick={() => updateData('funRating', n)} className="focus:outline-none transition-transform hover:scale-110">
                                     <Star size={32} className={`${n <= (data.funRating || 0) ? 'fill-arden-yellow text-arden-yellow' : 'text-gray-300'}`} />
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div>
                         <label className="block text-lg font-bold mb-4">Would you recommend ArdenMatch to a friend?</label>
                         <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => updateData('recommend', true)} className={`p-4 rounded-xl border-2 font-bold ${data.recommend === true ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>Yes 👍</button>
                             <button onClick={() => updateData('recommend', false)} className={`p-4 rounded-xl border-2 font-bold ${data.recommend === false ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>No 👎</button>
                         </div>
                     </div>
                     <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full mt-8">Next</Button>
                 </div>
             )}

             {step === 2 && (
                 <div className="space-y-8">
                     <div>
                         <label className="block text-lg font-bold mb-4">Did you find at least one match that actually interests you?</label>
                         <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => updateData('foundInterest', true)} className={`p-4 rounded-xl border-2 font-bold ${data.foundInterest === true ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>Yes</button>
                             <button onClick={() => updateData('foundInterest', false)} className={`p-4 rounded-xl border-2 font-bold ${data.foundInterest === false ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>No</button>
                         </div>
                     </div>
                     <Button onClick={() => setStep(3)} disabled={!isStep2Valid} className="w-full mt-8">Next</Button>
                 </div>
             )}

             {step === 3 && (
                 <div className="space-y-8">
                     <div>
                         <label className="block text-lg font-bold mb-4">Did you match with a job title you didn't know existed?</label>
                         <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => updateData('unknownJob', true)} className={`p-4 rounded-xl border-2 font-bold ${data.unknownJob === true ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>Yes</button>
                             <button onClick={() => updateData('unknownJob', false)} className={`p-4 rounded-xl border-2 font-bold ${data.unknownJob === false ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>No</button>
                         </div>
                     </div>
                     <div>
                         <label className="block text-lg font-bold mb-4">Did the results surprise you?</label>
                         <div className="space-y-3">
                             {['Not at all', 'A little', 'Totally shocked me'].map(opt => (
                                 <button key={opt} onClick={() => updateData('surpriseLevel', opt)} className={`w-full p-4 rounded-xl border-2 font-bold text-left ${data.surpriseLevel === opt ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}>{opt}</button>
                             ))}
                         </div>
                     </div>
                     <Button onClick={() => setStep(4)} disabled={!isStep3Valid} className="w-full mt-8">Next</Button>
                 </div>
             )}

             {step === 4 && (
                 <div className="space-y-8">
                     <div>
                         <label className="block text-lg font-bold mb-6">How do you feel about your career future right now?</label>
                         <div className="grid grid-cols-2 gap-4">
                             {[
                                 { l: 'Excited', e: '🤩' },
                                 { l: 'Confident', e: '💪' },
                                 { l: 'Curious', e: '🤔' },
                                 { l: 'Overwhelmed', e: '😵‍💫' }
                             ].map(opt => (
                                 <button 
                                    key={opt.l} 
                                    onClick={() => updateData('futureFeeling', opt.l)} 
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${data.futureFeeling === opt.l ? 'border-arden-teal bg-arden-teal/10' : 'border-gray-200'}`}
                                 >
                                     <span className="text-3xl">{opt.e}</span>
                                     <span className="font-bold text-sm">{opt.l}</span>
                                 </button>
                             ))}
                         </div>
                     </div>
                     <Button onClick={() => setStep(5)} disabled={!isStep4Valid} className="w-full mt-8">Next</Button>
                 </div>
             )}

             {step === 5 && (
                 <div className="space-y-6">
                     <div>
                         <label className="block text-sm font-bold mb-2">You swiped right on a few roles. What was the one specific skill or word that made you say 'YES'?</label>
                         <textarea value={data.discoveryAnswer} onChange={(e) => updateData('discoveryAnswer', e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-arden-teal outline-none" rows={2} />
                     </div>
                     <div>
                         <label className="block text-sm font-bold mb-2">Did you match with a job that surprised you? If so, why did you think it wouldn't fit you initially?</label>
                         <textarea value={data.realisationAnswer} onChange={(e) => updateData('realisationAnswer', e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-arden-teal outline-none" rows={2} />
                     </div>
                     <div>
                         <label className="block text-sm font-bold mb-2">In one sentence, how has this app changed how you view your future career options?</label>
                         <textarea value={data.perceptionAnswer} onChange={(e) => updateData('perceptionAnswer', e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-arden-teal outline-none" rows={2} />
                     </div>
                     <Button onClick={() => onComplete(data)} disabled={!isStep5Valid} className="w-full mt-4">Finish Survey</Button>
                 </div>
             )}
        </MotionDiv>
    );
};

// --- Screen 6: Email Capture & Success ---
const EmailScreen = ({ surveyData, user, matches }: { surveyData: Partial<SurveyData>, user: UserProfile, matches: JobProfile[] }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleFinalSubmit = () => {
        if (!email.includes('@')) {
            alert("Please enter a valid email address.");
            return;
        }

        const fullData: SurveyData = {
            ...surveyData as SurveyData,
            email: email,
            timestamp: new Date().toISOString(),
            userProfile: user,
            matchedJobs: matches.map(m => m.title)
        };

        // Save to LocalStorage
        const existing = JSON.parse(localStorage.getItem('arden_survey_data') || '[]');
        existing.push(fullData);
        localStorage.setItem('arden_survey_data', JSON.stringify(existing));

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-white text-arden-navy">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check size={48} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold">You're All Set!</h2>
                <p className="text-gray-600">Your match report has been saved. Check out the Arden Futures Hub to take the next step.</p>
                
                 <div className="w-full space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-arden-offwhite rounded-2xl border border-gray-100 text-left">
                        <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shrink-0"><Search size={20} /></div>
                        <div>
                            <h4 className="font-bold text-sm text-arden-navy">Occumi Skills Assessment</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">Map your passion to professional skills.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 bg-arden-offwhite rounded-2xl border border-gray-100 text-left">
                        <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 shrink-0"><RefreshCw size={20} /></div>
                        <div>
                            <h4 className="font-bold text-sm text-arden-navy">Shortlist.Me</h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">Practice virtual interviews.</p>
                        </div>
                    </div>
                </div>

                <a 
                    href="https://futures.arden.ac.uk" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center w-full py-4 bg-arden-navy text-white font-bold rounded-xl text-center shadow-lg hover:bg-slate-800 transition-colors gap-2"
                >
                    Go to Arden Futures Hub <ArrowRight size={18} />
                </a>
                
                <button onClick={() => window.location.reload()} className="text-sm font-bold text-gray-400">Back to Start</button>
            </div>
        );
    }

    return (
         <div className="h-full flex flex-col items-center justify-center p-8 bg-arden-navy">
             <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center">
                 <div className="w-16 h-16 bg-arden-yellow rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                     <Download size={24} className="text-arden-navy" />
                 </div>
                 <h2 className="text-2xl font-extrabold text-arden-navy mb-2">Get Your Report</h2>
                 <p className="text-gray-500 mb-6 text-sm">Enter your email to receive your full Career Persona and Next Steps guide.</p>
                 
                 <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@arden.ac.uk"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 mb-4 focus:border-arden-teal outline-none text-arden-navy"
                 />
                 
                 <Button onClick={handleFinalSubmit} className="w-full shadow-xl">
                     Send Report & Finish
                 </Button>
                 
                 <button onClick={() => setSubmitted(true)} className="mt-4 text-xs text-gray-400 underline">Skip email & show links</button>
             </div>
         </div>
    );
};

// --- Main App Component ---

const App = () => {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<JobProfile[]>([]);
  const [surveyData, setSurveyData] = useState<Partial<SurveyData>>({});

  const handleStart = () => setScreen('setup');
  
  const handleSetupComplete = (profile: UserProfile) => {
    setUser(profile);
    setScreen('swiping');
  };

  const handleMatchingComplete = (matchedJobs: JobProfile[]) => {
    setMatches(matchedJobs);
    setScreen('results');
  };

  const handleSurveyComplete = (data: Partial<SurveyData>) => {
      setSurveyData(data);
      setScreen('email');
  };

  return (
    <div className="w-full h-screen bg-arden-navy overflow-hidden font-sans text-white relative">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      
      <div className="w-full h-full max-w-md mx-auto relative flex flex-col shadow-2xl">
        <AnimatePresence mode="wait">
          {screen === 'onboarding' && (
            <MotionDiv key="intro" className="h-full" exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <IntroScreen onStart={handleStart} />
            </MotionDiv>
          )}
          {screen === 'setup' && (
             <MotionDiv key="setup" className="h-full" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <SetupScreen onComplete={handleSetupComplete} />
             </MotionDiv>
          )}
          {screen === 'swiping' && user && (
             <MotionDiv key="swiping" className="h-full" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                <SwipingScreen user={user} onMatchComplete={handleMatchingComplete} />
             </MotionDiv>
          )}
          {screen === 'results' && user && (
             <MotionDiv key="results" className="h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <ResultsScreen user={user} matches={matches} onNext={() => setScreen('survey')} />
             </MotionDiv>
          )}
          {screen === 'survey' && (
              <MotionDiv key="survey" className="h-full" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                  <SurveyScreen onComplete={handleSurveyComplete} />
              </MotionDiv>
          )}
          {screen === 'email' && user && (
              <MotionDiv key="email" className="h-full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <EmailScreen surveyData={surveyData} user={user} matches={matches} />
              </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
