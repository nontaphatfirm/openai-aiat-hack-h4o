import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Build your passport",
    description: "Capture baseline health, wearable signals, and daily context in one place.",
  },
  {
    number: "02",
    title: "Receive a daily plan",
    description: "Turn your health signals into meals, routines, and recovery guidance.",
  },
  {
    number: "03",
    title: "Find local support",
    description: "Match with providers and markets that fit your goals and preferences.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-full bg-white px-4 pb-8 pt-6">
      <section
        className="relative overflow-hidden rounded-3xl px-5 py-7 text-white shadow-sm"
        style={{
          backgroundImage:
            "url('https://www.bistromd.com/cdn/shop/articles/what-is-clean-eating-plan-for-weight-loss-tips-more.png?v=1672782092')",
          backgroundSize: "cover",
          backgroundPosition: "30% center",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative">
          <p className="mb-4 w-max rounded-full bg-teal-400/20 px-3 py-1 text-xs font-bold text-teal-200">
            AI Nutrition Advisor
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Your healing journey, built from your body data.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-200">
            OmniWell-TH combines your health passport, daily wearable signals, environment,
            and check-ins to create practical food-as-medicine guidance.
          </p>
          <Link
            href="/passport"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-teal-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-teal-400"
          >
            Start Your Passport
          </Link>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {steps.map((step) => (
          <div key={step.number} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-sm font-black text-teal-700">
              {step.number}
            </div>
            <h2 className="text-lg font-extrabold text-slate-950">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="text-lg font-extrabold text-emerald-950">Today&apos;s snapshot</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white p-4">
            <p className="font-semibold text-slate-500">Sleep</p>
            <p className="mt-1 text-xl font-extrabold text-slate-950">7.4h</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="font-semibold text-slate-500">PM 2.5</p>
            <p className="mt-1 text-xl font-extrabold text-slate-950">18</p>
          </div>
        </div>
      </section>
    </main>
  );
}
