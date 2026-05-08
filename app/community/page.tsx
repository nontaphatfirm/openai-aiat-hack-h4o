import {
  Bookmark,
  HeartHandshake,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

const topicFilters = ["All", "Nutrition", "Sleep", "Stress", "Gut health", "Recovery"];

const featuredThreads = [
  {
    author: "Nara",
    role: "Nutrition coach",
    initials: "NA",
    title: "How do you keep protein high when breakfast has to be fast?",
    body:
      "I am collecting practical ideas for people who have early work shifts. Bonus if it avoids peanuts and shellfish.",
    tag: "Nutrition",
    replies: 18,
    saves: 42,
    time: "12 min ago",
  },
  {
    author: "Maya",
    role: "Member",
    initials: "MY",
    title: "Small win: my sleep score improved after changing dinner time",
    body:
      "Moved dinner 90 minutes earlier for 5 days. Less reflux, fewer late snacks, and better morning energy.",
    tag: "Sleep",
    replies: 9,
    saves: 27,
    time: "38 min ago",
  },
  {
    author: "Dr. Arun",
    role: "Provider",
    initials: "DA",
    title: "What symptom signals should trigger a clinic visit?",
    body:
      "Sharing a simple checklist for when fatigue, pain, mood, or digestive symptoms need professional review.",
    tag: "Provider Q&A",
    replies: 31,
    saves: 66,
    time: "1 hr ago",
  },
];

const liveRooms = [
  { title: "Gut-friendly meals", members: 128, accent: "bg-emerald-50 text-emerald-700" },
  { title: "Stress reset circle", members: 84, accent: "bg-sky-50 text-sky-700" },
  { title: "Recovery check-in", members: 53, accent: "bg-amber-50 text-amber-700" },
];

export default function CommunityPage() {
  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-400/15 px-3 py-1 text-xs font-black text-teal-100">
          <UsersRound className="h-3.5 w-3.5" />
          Community
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Talk, share, and learn with people on the same wellness path.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          A mock space for evidence-aware discussions, daily wins, provider answers, and peer support.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-lg font-black">2.4k</p>
            <p className="text-[11px] font-bold text-slate-300">Members</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-lg font-black">86</p>
            <p className="text-[11px] font-bold text-slate-300">Threads</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-3">
            <p className="text-lg font-black">14</p>
            <p className="text-[11px] font-bold text-slate-300">Experts</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="text-sm font-semibold text-slate-400">Search discussions, symptoms, foods...</span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {topicFilters.map((topic, index) => (
            <button
              key={topic}
              type="button"
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                index === 0
                  ? "bg-teal-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-700"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-teal-950">Start a useful discussion</h2>
            <p className="mt-1 text-sm leading-6 text-teal-800/80">
              Ask for practical experience, share what worked, or invite provider input.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-full bg-teal-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-teal-700">
            New Post
          </button>
          <Link
            href="/ask"
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-sm font-extrabold text-teal-700 transition hover:bg-teal-100"
          >
            Ask AI
          </Link>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-950">Trending threads</h2>
          <span className="text-xs font-black text-teal-700">Mock feed</span>
        </div>
        <div className="space-y-3">
          {featuredThreads.map((thread) => (
            <article key={thread.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black text-white">
                  {thread.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-extrabold text-slate-950">{thread.author}</p>
                    <span className="text-xs font-bold text-slate-400">{thread.role}</span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-400">{thread.time}</p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700">
                  {thread.tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-extrabold leading-6 text-slate-950">{thread.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{thread.body}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-black text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {thread.replies}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <Bookmark className="h-3.5 w-3.5" />
                  {thread.saves}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <HeartHandshake className="h-5 w-5 text-teal-700" />
          Live rooms
        </h2>
        <div className="mt-4 space-y-2">
          {liveRooms.map((room) => (
            <button
              key={room.title}
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-teal-200 hover:bg-white"
            >
              <span className="text-sm font-extrabold text-slate-900">{room.title}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${room.accent}`}>
                {room.members} online
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-amber-950">
          <ShieldCheck className="h-5 w-5 text-amber-700" />
          Community safety note
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-900/80">
          Posts are for shared learning and support. Medical decisions should still be reviewed
          with a qualified professional.
        </p>
      </section>
    </main>
  );
}
