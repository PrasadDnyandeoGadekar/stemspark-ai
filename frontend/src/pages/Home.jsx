import { ArrowRight, BookOpen, BrainCircuit, Check, ChevronRight, Compass, Play, Sparkles, Target, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Features from '../components/Features';

const learningSteps = [
  {
    number: '01',
    icon: Compass,
    title: 'Find your next topic',
    description: 'Explore hand-picked lessons across science, technology, engineering and mathematics.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'Learn with a tutor',
    description: 'Ask questions in plain language and work through tricky ideas at your own pace.',
  },
  {
    number: '03',
    icon: Target,
    title: 'Practice until it clicks',
    description: 'Create a focused AI quiz, check your answers and decide what to learn next.',
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page overflow-hidden bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-950">
      <section className="home-hero relative isolate">
        <div aria-hidden="true" className="home-orb home-orb-one" />
        <div aria-hidden="true" className="home-orb home-orb-two" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.04fr_.96fr] lg:gap-14 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="home-enter relative z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-indigo-700 shadow-sm backdrop-blur sm:text-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              A brighter way to learn STEM
            </div>
            <h1 className="mx-auto mt-6 max-w-3xl text-balance text-[2.65rem] font-black leading-[1.04] tracking-tight text-slate-950 sm:text-6xl lg:mx-0 lg:text-7xl">
              Big questions.
              <span className="home-gradient-text block">Brilliant discoveries.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
              Build real understanding with trusted free lessons, a patient AI tutor and practice made for the way you learn.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-start">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="home-primary-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300 sm:text-base"
              >
                Explore free courses <ArrowRight className="h-5 w-5" />
              </button>
              <Link
                to="/tutor"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:text-base"
              >
                <BrainCircuit className="h-5 w-5" /> Meet your AI tutor
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 sm:text-sm lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Free learning resources</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" /> Learn at your own pace</span>
            </div>
          </div>

          <div className="home-enter home-enter-delay relative mx-auto w-full max-w-xl lg:max-w-none" aria-label="STEMSpark learning tools preview">
            <div className="home-preview-glow absolute inset-4 rounded-[2rem] blur-2xl" aria-hidden="true" />
            <div className="home-preview relative rounded-[1.75rem] border border-white/80 bg-white/90 p-3 shadow-2xl shadow-indigo-900/10 backdrop-blur sm:rounded-[2rem] sm:p-5">
              <div className="rounded-2xl bg-slate-950 p-5 text-white sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200"><Sparkles className="h-5 w-5" /></span>
                    <span><span className="block text-xs font-bold text-indigo-200">YOUR LEARNING SPACE</span><span className="mt-0.5 block text-sm font-extrabold">Curiosity starts here</span></span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-300">LEARN · ASK · PRACTICE</span>
                </div>
                <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.06] p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200"><BookOpen className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-sky-200">EXPLORE A NEW IDEA</p>
                      <p className="mt-1 text-base font-extrabold sm:text-lg">Why does the Moon have phases?</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">Start with a clear explanation, then follow your questions.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="h-1.5 flex-1 rounded-full bg-indigo-400" />
                    <span className="h-1.5 flex-1 rounded-full bg-indigo-400/50" />
                    <span className="h-1.5 flex-1 rounded-full bg-white/10" />
                    <span className="ml-1 text-[10px] font-semibold text-slate-400">A learning path, not a race</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
                    <div className="flex items-center gap-2 text-violet-200"><BrainCircuit className="h-4 w-4" /><span className="text-xs font-bold">AI TUTOR</span></div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">Ask any question. Explore the answer together.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
                    <div className="flex items-center gap-2 text-amber-200"><Trophy className="h-4 w-4" /><span className="text-xs font-bold">AI PRACTICE</span></div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">Try a quiz and learn from every answer.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4 sm:px-3">
                <p className="text-xs font-semibold text-slate-500">One idea at a time adds up.</p>
                <Link to="/quiz" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-50">
                  Try a practice quiz <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="home-float-card absolute -bottom-5 -left-2 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:flex lg:-left-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
              <span><span className="block text-xs font-extrabold text-slate-900">Your next lesson</span><span className="mt-0.5 block text-[11px] text-slate-500">Picked by your curiosity</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-12 lg:px-8">
          {learningSteps.map(({ number, icon: Icon, title, description }, index) => (
            <article key={number} className="home-step-card flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:block sm:border-transparent sm:bg-transparent sm:p-3 sm:shadow-none sm:hover:bg-white sm:hover:shadow-lg" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex shrink-0 items-center gap-3 sm:mb-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Icon className="h-5 w-5" /></span>
                <span className="text-xs font-black tracking-widest text-indigo-400 sm:hidden">{number}</span>
              </div>
              <div>
                <p className="hidden text-xs font-black tracking-widest text-indigo-400 sm:block">{number} / 03</p>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-900 sm:mt-2 sm:text-lg">{title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Features />

      <section className="home-closing relative isolate overflow-hidden bg-indigo-700">
        <div aria-hidden="true" className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 sm:py-16 lg:flex-row lg:px-8 lg:text-left">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-200">Your next discovery is waiting</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Ready to learn something new?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">Choose a course, ask a question or practice a topic. Start wherever you are.</p>
          </div>
          <Link to="/explore" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-extrabold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-white/40">
            Start exploring <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
