import { ArrowLeft, ArrowRight, Check, Copy, HelpCircle, Info, Lightbulb, Target, Zap, ChevronLeft, ChevronRight, Lock, Sparkles, BookOpen, Clock, Calendar, Star, AlertTriangle, ListChecks, Quote, X, RotateCcw } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { Badge, Button, Card, Skeleton } from '../components/UI';
import { useTopic, useSubjects } from '../hooks/useData';
import { useAuth } from '../contexts/AuthContext';
import { cn, convertDriveUrlToDirectStream } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

export function TopicPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { topic: fetchedTopic, loading } = useTopic(slug || '');
  const { subjects } = useSubjects();
  const { user, profile, isAdmin, isPremium, openAuthModal, toggleTopicCompletion } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const topic: any = fetchedTopic;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-32 mb-10" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-6 w-full mb-16" />
        <div className="space-y-12">
          <Skeleton className="h-80 w-full rounded-[2.5rem]" />
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
          <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!loading && !topic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-6 rounded-3xl bg-slate-50 p-6 text-slate-400 border border-slate-100 shadow-inner">
          <BookOpen className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-black text-violet-950 mb-3">Topic Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-xs font-medium">The topic you are looking for might have been moved or doesn't exist.</p>
        <Link to="/dashboard">
          <Button size="lg" className="px-10 h-14 text-base shadow-xl shadow-violet-200/50">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const subject = subjects.find(s => s.slug === topic.subjectSlug);
  const isLocked = topic.status === 'premium' && !isPremium && !isAdmin;
  const hasPdfAccess = isPremium || isAdmin || subject?.pdfAccessType === 'free' || profile?.ownedPdfs?.includes(subject?.slug || '');

  const isCompleted = profile?.completedTopics?.includes(topic.id);

  const handleToggleCompletion = async () => {
    if (!topic?.id) return;
    setIsCompleting(true);
    try {
      await toggleTopicCompletion(topic.id);
      toast.success(isCompleted ? 'Marked as incomplete' : 'Marked as completed!');
    } catch (error) {
      toast.error('Failed to update progress');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFE]">
      <div className="container-narrow py-12 pb-40">
        <nav className="mb-12">
          <Link to={subject ? `/subject/${subject.slug}` : '/dashboard'} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-violet-600 transition-all hover:-translate-x-1 group">
            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Back to {subject?.title || 'Dashboard'}
          </Link>
        </nav>

        <header className="mb-16">
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <Badge variant={topic.status}>{topic.status}</Badge>
            {subject && (
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                <BookOpen className="h-3.5 w-3.5" />
                {subject.title}
              </div>
            )}
          </div>
          <h1 className="text-5xl font-black text-violet-950 leading-[1.1] sm:text-6xl tracking-tight mb-8 text-balance">{topic.title}</h1>
          <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mb-10 text-balance">{topic.teaser || "High-yield revision topic focused on core concepts and UPSC patterns."}</p>
          
          <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-violet-50 border border-violet-100 shadow-sm">
              <Star className="h-4 w-4 text-violet-600" />
              <span className="text-xs font-bold text-violet-900 uppercase tracking-wider">{topic.examRelevance || 'High Relevance'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{topic.estimatedTime || '5 mins'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Updated: {topic.lastUpdated || 'Recently'}</span>
            </div>
          </div>
        </header>

        <div className="space-y-12 relative">
          {isLocked && (
            <div className="absolute inset-x-0 top-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-[2.5rem] p-12 text-center border-2 border-violet-200 shadow-2xl shadow-violet-200/50 py-32">
              <div className="mb-8 rounded-3xl bg-violet-100 p-6 text-violet-600 shadow-inner border border-violet-200 animate-bounce">
                <Lock className="h-12 w-12" />
              </div>
              <h2 className="text-4xl font-black text-violet-950 mb-4 tracking-tight">Premium Topic Locked</h2>
              <p className="text-slate-600 text-lg font-medium mb-10 max-w-md leading-relaxed">
                This high-yield topic is reserved for premium members. Upgrade now to unlock all 200+ topics and advanced elimination logic.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <Link to="/premium" className="flex-1">
                  <Button className="w-full h-16 text-lg font-black shadow-xl shadow-violet-200 rounded-2xl">
                    Unlock Now
                  </Button>
                </Link>
                {!user && (
                  <Button variant="outline" onClick={openAuthModal} className="flex-1 h-16 text-lg font-black border-2 rounded-2xl">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className={cn("space-y-12 transition-all duration-500", isLocked && "blur-md pointer-events-none select-none opacity-40")}>
            {/* Structured Sections */}
            <ContentSection 
              title="Why this matters" 
              icon={Info} 
              content={topic.whyThisMatters || topic.whyUpscAsksThis} 
              color="blue" 
              isMarkdown 
            />
            
            <ContentSection 
              title="Core Concept" 
              icon={Zap} 
              content={topic.coreConcept || topic.coreRecall} 
              color="violet" 
              isMarkdown 
            />

            <ContentSection 
              title="UPSC Gold Point" 
              icon={Star} 
              content={topic.upscGoldPoint || topic.pyqPattern} 
              color="orange" 
              isHighlight
              isMarkdown 
            />

            <ContentSection 
              title="Deep Understanding" 
              icon={Lightbulb} 
              content={topic.deepUnderstanding || topic.deepLink} 
              color="amber" 
              isMarkdown 
            />

            <ContentSection 
              title="Linked Facts / Dimensions" 
              icon={ListChecks} 
              content={topic.linkedFacts} 
              color="indigo" 
              isMarkdown 
            />

            <ContentSection 
              title="Trap Zone" 
              icon={AlertTriangle} 
              content={topic.trapZone} 
              color="orange" 
              isHighlight
              isMarkdown 
            />

            <ContentSection 
              title="Memory Trick" 
              icon={Sparkles} 
              content={topic.memoryTrick} 
              color="green" 
              isMarkdown 
              canCopy
            />

            <ContentSection 
              title="Prelims Snapshot" 
              icon={Target} 
              content={topic.prelimsSnapshot || topic.quickEliminationLogic} 
              color="blue" 
              isMarkdown 
            />

            <TopicQuizSection 
              content={topic.mcqs || (topic.miniMcqQuestion ? `${topic.miniMcqQuestion}\n\n**Answer:** ${topic.miniMcqAnswer}` : null)} 
              topicSlug={topic.slug}
            />

            <ContentSection 
              title="One-Line Revision" 
              icon={Quote} 
              content={topic.oneLineRevision} 
              color="violet" 
              isMarkdown 
              canCopy
            />

            <ContentSection 
              title="Linked Topics" 
              icon={ArrowRight} 
              content={topic.linkedTopics} 
              color="slate" 
              isMarkdown 
            />

            {topic.infographicUrl && (
              <div className="pt-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-black text-violet-950 tracking-tight">Topic Infographic</h2>
                </div>
                
                {topic.infographicStatus === 'free' || isPremium || isAdmin ? (
                  <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 bg-white">
                    <img 
                      src={convertDriveUrlToDirectStream(topic.infographicUrl) || topic.infographicUrl} 
                      alt={`${topic.title} Infographic`} 
                      className="w-full h-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                      <a 
                        href={convertDriveUrlToDirectStream(topic.infographicUrl) || topic.infographicUrl} 
                        download={`${topic.slug}-infographic.jpg`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
                      >
                        <BookOpen className="h-4 w-4" />
                        Save Infographic
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-[2rem] bg-violet-950 p-10 text-center text-white shadow-2xl shadow-violet-200/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-800/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                    <div className="mb-6 inline-flex rounded-3xl bg-white/10 p-5 backdrop-blur-md border border-white/10 shadow-inner">
                      <Lock className="h-10 w-10 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 tracking-tight">Premium Infographic Locked</h3>
                    <p className="text-violet-200 font-medium max-w-md mx-auto mb-8">Upgrade to Premium to view and download high-quality visual summaries for this topic.</p>
                    <Link to="/premium">
                      <Button variant="secondary" size="lg" className="px-10 h-14 text-base shadow-xl shadow-orange-500/20">
                        Unlock Premium
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {topic.pdfUrl && hasPdfAccess && (
              <div className="pt-8 space-y-3">
                <a 
                  href={topic.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full p-6 rounded-[2rem] bg-violet-600 text-white font-black text-xl shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-[0.98]"
                >
                  <BookOpen className="h-6 w-6" />
                  Download Topic PDF
                </a>
                {topic.pdfPassword && (
                  <div className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-violet-50 border border-violet-100 text-violet-700 shadow-sm animate-in fade-in slide-in-from-top-1 duration-500">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Password:</span>
                    <span className="text-lg font-black font-mono">{topic.pdfPassword}</span>
                  </div>
                )}
              </div>
            )}

            {topic.pdfUrl && !hasPdfAccess && (
              <div className="pt-8">
                <Link to={`/pdf-store?select=${subject?.slug}`}>
                  <Button variant="outline" icon={Lock} className="w-full h-16 text-lg font-black border-amber-200 text-amber-700 bg-amber-50/30 hover:bg-amber-50 rounded-[2rem]">
                    Unlock Topic PDF
                  </Button>
                </Link>
              </div>
            )}

            {isPremium && (
              <div className="pt-8 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={handleToggleCompletion}
                  disabled={isCompleting}
                  className={cn(
                    "w-full sm:w-auto h-16 px-10 text-lg font-black rounded-[2rem] shadow-xl transition-all",
                    isCompleted 
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-emerald-100/50" 
                      : "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-200"
                  )}
                >
                  {isCompleting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-6 w-6" />
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-6 w-6 opacity-50" />
                      Mark as Completed
                    </span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentSection({ title, icon: Icon, content, color, isHighlight, isMarkdown, canCopy }: any) {
  const [copied, setCopied] = useState(false);
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  
  if (!content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => {
      if (isMounted.current) setCopied(false);
    }, 2000);
  };

  const colors: any = {
    violet: 'bg-violet-50 text-violet-600 border-violet-100 shadow-violet-100/20',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/20',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/20',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/20',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20',
    green: 'bg-green-50 text-green-600 border-green-100 shadow-green-100/20',
    slate: 'bg-slate-50 text-slate-600 border-slate-100 shadow-slate-100/20',
  };

  return (
    <div className={cn(
      'brutalist-card p-6 sm:p-10 transition-all duration-300',
      isHighlight && 'border-orange-500 bg-orange-50/20'
    )}>
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className={cn('rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border', colors[color])}>
            <Icon className="h-5 w-5 sm:h-7 sm:h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-violet-950 tracking-tight">{title}</h2>
        </div>
        {(canCopy || copied) && (
          <button
            onClick={handleCopy}
            className="rounded-xl p-2 sm:p-3 text-slate-300 transition-all hover:bg-slate-50 hover:text-violet-600 active:scale-90 border border-transparent hover:border-slate-100"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-5 w-5 sm:h-6 sm:h-6 text-emerald-500" /> : <Copy className="h-5 w-5 sm:h-6 sm:h-6" />}
          </button>
        )}
      </div>
      <div className="prose prose-violet max-w-none text-slate-600 font-medium leading-relaxed text-base sm:text-lg">
        {isMarkdown ? (
          <div className="markdown-body">
            <ReactMarkdown 
              remarkPlugins={[remarkBreaks, remarkMath, remarkGfm]} 
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-line">{content}</p>
        )}
      </div>
    </div>
  );
}

interface ParsedMcq {
  question: string;
  options: { label: string; text: string }[];
  correctOption: string;
  explanation: string;
}

function parseMcqs(rawText: string): ParsedMcq[] {
  if (!rawText || typeof rawText !== 'string') return [];
  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  const questions: ParsedMcq[] = [];
  let currentQLines: string[] = [];
  let currentOptions: { label: string; text: string }[] = [];
  let currentCorrect = '';
  let currentExplanation = '';
  let inAnswer = false;

  const flush = () => {
    if (currentOptions.length === 0 && currentQLines.length >= 5 && ['1', '2', '3', '4'].includes(currentCorrect)) {
      const numMap: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
      const extracted: { label: string; text: string }[] = [];
      const remainingQ: string[] = [];
      for (const l of currentQLines) {
        const m = l.trim().match(/^([1-4])[\.\)]\s+(.+)$/);
        if (m) {
          extracted.push({ label: numMap[m[1]], text: m[2].trim() });
        } else {
          remainingQ.push(l);
        }
      }
      if (extracted.length >= 2) {
        currentOptions = extracted;
        currentQLines = remainingQ;
        currentCorrect = numMap[currentCorrect] || currentCorrect;
      }
    }
    if (currentQLines.length > 0 && currentOptions.length >= 2 && currentCorrect) {
      const cleanedQLines = [...currentQLines];
      cleanedQLines[0] = cleanedQLines[0].replace(/^(\s*(?:\*\*)?)(?:Q\d*[\.\:\)\s]\s*|Question\s*\d*[\.\:\)\s]\s*|\d+[\.\)]\s*)/i, '$1');
      questions.push({
        question: cleanedQLines.join('\n').trim(),
        options: currentOptions,
        correctOption: currentCorrect.toUpperCase(),
        explanation: currentExplanation.trim(),
      });
    }
    currentQLines = [];
    currentOptions = [];
    currentCorrect = '';
    currentExplanation = '';
    inAnswer = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const unquoted = trimmed.replace(/^>\s*/, '').trim();
    if (!unquoted) {
      if (inAnswer) {
        flush();
      } else if (currentQLines.length > 0 && currentOptions.length === 0) {
        currentQLines.push('');
      }
      continue;
    }

    const isNewQuestionHeader =
      /^(?:\*\*)?(?:Q\d*[\.\:\)\s]|Question\s*\d*|\d+[\.\)]\s*\*\*|\*\*\d+[\.\)])/i.test(unquoted) &&
      (inAnswer || currentOptions.length >= 4);
    if (isNewQuestionHeader && (inAnswer || (currentOptions.length >= 2 && currentCorrect))) {
      flush();
    }

    const ansMatch = unquoted.match(
      /^(?:[-*]\s*)?(?:\*\*)?(?:Answer|Ans|Correct\s*Answer)\s*:?\s*(?:\*\*)?\s*:?\s*\(?([A-Da-d1-4])\)?[\.\)\:]?(?:\*\*)?\s*(.*)$/i
    );
    if (ansMatch && (currentOptions.length >= 2 || currentQLines.length >= 4)) {
      currentCorrect = ansMatch[1].toUpperCase();
      let exp = ansMatch[2] || '';
      exp = exp.replace(/^\.\s*/, '').replace(/^\*\*+\s*/, '').replace(/\s*\*\*+$/, '').trim();
      if (exp.startsWith('(') && exp.endsWith(')')) {
        exp = exp.slice(1, -1).trim();
      }
      currentExplanation = exp;
      inAnswer = true;
      continue;
    }

    if (inAnswer) {
      const contMatch = unquoted.match(
        /^(?:[-*]\s*)?(?:\*\*|\*)?(?:Explanation|Reason|Note)\s*:?\s*(?:\*\*|\*)?\s*:?\s*(.*)$/i
      );
      let expLine = contMatch ? contMatch[1] : unquoted;
      if (expLine.startsWith('(') && expLine.endsWith(')') && !currentExplanation) {
        expLine = expLine.slice(1, -1).trim();
      }
      currentExplanation += (currentExplanation ? '\n' : '') + expLine;
      continue;
    }

    const strippedOptionsPrefix = unquoted.replace(/^(?:\*\*)?Options\s*:?\s*(?:\*\*)?\s*/i, '');
    if (/^(?:\*\*)?(?:\([Aa]\)|[Aa][\.\)])\s*.+(?:\s+|;\s*)(?:\([Bb]\)|[Bb][\.\)])\s*/i.test(strippedOptionsPrefix)) {
      const inlineMatches = [
        ...strippedOptionsPrefix.matchAll(
          /(?:^|[\s;]+)(?:\*\*)?(?:\(([A-Da-d])\)|([A-Da-d])[\.\)])(?:\*\*)?\s*(.+?)(?=(?:[\s;]+(?:\*\*)?(?:\([A-Da-d]\)|[A-Da-d][\.\)]))|$)/gi
        ),
      ];
      if (inlineMatches.length >= 2) {
        inlineMatches.forEach((m) => {
          const letter = (m[1] || m[2]).toUpperCase();
          const text = m[3].replace(/;\s*$/, '').replace(/\*\*$/, '').trim();
          currentOptions.push({ label: letter, text });
        });
        continue;
      }
    }

    const optMatch = unquoted.match(/^(?:[-*]\s*)?(?:\*\*)?(?:\(([A-Da-d])\)|([A-Da-d])[\.\)\:])\s*(?:\*\*)?\s*(.+)$/);
    if (optMatch && (currentOptions.length > 0 || currentQLines.length > 0)) {
      const optLetter = (optMatch[1] || optMatch[2]).toUpperCase();
      const expectedLetters = ['A', 'B', 'C', 'D'];
      if (expectedLetters.includes(optLetter)) {
        currentOptions.push({
          label: optLetter,
          text: optMatch[3].replace(/\*\*$/, '').trim(),
        });
        continue;
      }
    }

    currentQLines.push(line);
  }
  flush();
  return questions;
}

function TopicQuizSection({ content, topicSlug }: { content: string | null; topicSlug?: string }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    setSelectedAnswers({});
  }, [topicSlug, content]);

  const questions = useMemo(() => (content ? parseMcqs(content) : []), [content]);

  if (!content) return null;

  // Fallback to standard markdown if custom freeform content has no parseable options
  if (questions.length === 0) {
    return (
      <ContentSection
        title="MCQs"
        icon={HelpCircle}
        content={content}
        color="indigo"
        isMarkdown
      />
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctOption ? 1 : 0);
  }, 0);

  const handleSelectOption = (qIndex: number, optionLabel: string) => {
    if (selectedAnswers[qIndex]) return; // Lock choice once answered until reset
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionLabel }));
  };

  const handleResetQuestion = (qIndex: number) => {
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[qIndex];
      return next;
    });
  };

  const handleResetAll = () => {
    setSelectedAnswers({});
  };

  return (
    <div className="brutalist-card p-6 sm:p-10 transition-all duration-300">
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/20">
            <HelpCircle className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-violet-950 tracking-tight">
              Practice Quiz (MCQs)
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5 tabular-nums">
              Select an option to check your answer and view explanation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-700 tabular-nums">
            Score: <span className="text-indigo-600">{correctCount}</span> / {questions.length}
          </div>
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Quiz
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qIdx) => {
          const userChoice = selectedAnswers[qIdx];
          const isAnswered = Boolean(userChoice);
          const isCorrect = userChoice === q.correctOption;

          return (
            <div
              key={qIdx}
              className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50/40 p-5 sm:p-7 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-100/80 text-indigo-800 text-xs font-black uppercase tracking-wider shrink-0 tabular-nums">
                  Question {qIdx + 1} of {questions.length}
                </span>
                {isAnswered && (
                  <button
                    type="button"
                    onClick={() => handleResetQuestion(qIdx)}
                    className="text-xs font-bold text-slate-400 hover:text-violet-600 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>

              <div className="prose prose-violet max-w-none text-slate-800 font-semibold leading-relaxed text-base sm:text-lg mb-6">
                <div className="markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks, remarkMath, remarkGfm]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {q.question}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="grid gap-3">
                {q.options.map((opt) => {
                  const isThisSelected = userChoice === opt.label;
                  const isThisCorrect = q.correctOption === opt.label;

                  let optionStyle =
                    "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700";
                  let badgeStyle =
                    "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600";

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500";
                      badgeStyle = "bg-emerald-600 text-white border-emerald-600";
                    } else if (isThisSelected && !isThisCorrect) {
                      optionStyle =
                        "border-rose-400 bg-rose-50/80 text-rose-950 ring-1 ring-rose-400";
                      badgeStyle = "bg-rose-600 text-white border-rose-600";
                    } else {
                      optionStyle = "border-slate-200 bg-white/60 text-slate-400 opacity-75";
                      badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
                    }
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(qIdx, opt.label)}
                      className={cn(
                        "group w-full text-left p-4 rounded-2xl border-2 transition-all duration-150 flex items-start gap-3.5",
                        !isAnswered && "cursor-pointer active:scale-[0.99]",
                        isAnswered && "cursor-default",
                        optionStyle
                      )}
                    >
                      <span
                        className={cn(
                          "h-8 w-8 rounded-xl border text-xs font-black flex items-center justify-center shrink-0 transition-colors mt-0.5",
                          badgeStyle
                        )}
                      >
                        {isAnswered && isThisCorrect ? (
                          <Check className="h-4 w-4" />
                        ) : isAnswered && isThisSelected && !isThisCorrect ? (
                          <X className="h-4 w-4" />
                        ) : (
                          opt.label
                        )}
                      </span>

                      <div className="flex-1 text-sm sm:text-base font-bold leading-snug pt-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath, remarkGfm]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            p: ({ children }) => <span>{children}</span>,
                          }}
                        >
                          {opt.text}
                        </ReactMarkdown>
                      </div>

                      {isAnswered && isThisCorrect && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0 self-center">
                          Correct Answer
                        </span>
                      )}
                      {isAnswered && isThisSelected && !isThisCorrect && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg shrink-0 self-center">
                          Your Choice
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  className={cn(
                    "mt-5 rounded-2xl p-5 border animate-in fade-in slide-in-from-top-1 duration-200",
                    isCorrect
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-indigo-50/70 border-indigo-200 text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider",
                        isCorrect ? "text-emerald-700" : "text-rose-600"
                      )}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="h-4 w-4" /> Correct! Option {q.correctOption}
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" /> Incorrect — Correct Answer is Option {q.correctOption}
                        </>
                      )}
                    </span>
                  </div>
                  {q.explanation && (
                    <div className="prose prose-sm sm:prose-base max-w-none text-slate-700 font-medium leading-relaxed mt-2 pt-2 border-t border-slate-200/70">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block mb-1">
                        Explanation
                      </span>
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks, remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {q.explanation}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount === questions.length && questions.length > 0 && (
        <div className="mt-8 p-6 rounded-3xl bg-violet-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-violet-300">
              Topic Quiz Completed
            </p>
            <h3 className="text-xl sm:text-2xl font-black mt-1 tabular-nums">
              You scored {correctCount} out of {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
            </h3>
          </div>
          <Button
            variant="secondary"
            onClick={handleResetAll}
            className="whitespace-nowrap px-6 h-12 text-sm font-black"
          >
            Retake Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
