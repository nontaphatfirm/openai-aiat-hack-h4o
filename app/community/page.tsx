import {
  Bookmark,
  HeartHandshake,
  MessageCircle,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { featuredThreads, liveRooms, topicFilters } from "./communityData";

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

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-950">Trending threads</h2>
          <span className="text-xs font-black text-teal-700">Mock feed</span>
        </div>
        <div className="space-y-3">
          {featuredThreads.map((thread) => (
            <Link
              key={thread.slug}
              href={`/community/${thread.slug}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            >
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
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100">
                <Image
                  src={thread.image}
                  alt={thread.imageAlt}
                  width={960}
                  height={600}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-black text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {thread.replies}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
                  <Bookmark className="h-3.5 w-3.5" />
                  {thread.saves}
                </span>
                <span className="ml-auto text-teal-700">View post</span>
              </div>
            </Link>
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
