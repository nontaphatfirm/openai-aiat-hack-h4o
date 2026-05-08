import { ArrowLeft, Bookmark, MessageCircle, Send, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredThreads } from "../communityData";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const comments = [
  {
    author: "Ben",
    initials: "BE",
    body: "Greek yogurt with banana is my fastest option. I prep toppings once and just assemble in the morning.",
    time: "8 min ago",
  },
  {
    author: "Lin",
    initials: "LI",
    body: "I like the idea of tracking sleep and digestion together. Timing changes are easier than changing every meal.",
    time: "22 min ago",
  },
  {
    author: "Som",
    initials: "SO",
    body: "Would love provider notes on when symptoms should move from self-tracking to a clinic visit.",
    time: "41 min ago",
  },
];

export default async function CommunityPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = featuredThreads.find((thread) => thread.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-6">
      <Link
        href="/community"
        className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Community
      </Link>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black text-white">
              {post.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-extrabold text-slate-950">{post.author}</p>
                <span className="text-xs font-bold text-slate-400">{post.role}</span>
              </div>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">{post.time}</p>
            </div>
            <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black text-teal-700">
              {post.tag}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold leading-8 tracking-tight text-slate-950">
            {post.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{post.body}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{post.detail}</p>
        </div>

        <Image
          src={post.image}
          alt={post.imageAlt}
          width={960}
          height={600}
          className="aspect-[16/10] w-full object-cover"
        />

        <div className="flex items-center gap-2 border-t border-slate-100 p-5 text-xs font-black text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.replies} replies
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5">
            <Bookmark className="h-3.5 w-3.5" />
            {post.saves} saves
          </span>
        </div>
      </article>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-950">Join the discussion</h2>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="min-w-0 flex-1 text-sm font-semibold text-slate-400">
            Share a thoughtful reply...
          </span>
          <Send className="h-4 w-4 shrink-0 text-teal-700" />
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <h2 className="text-lg font-extrabold text-slate-950">Replies</h2>
        {comments.map((comment) => (
          <article key={comment.author} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-xs font-black text-teal-700">
                {comment.initials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-slate-950">{comment.author}</p>
                  <span className="text-xs font-bold text-slate-400">{comment.time}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">{comment.body}</p>
              </div>
            </div>
          </article>
        ))}
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
