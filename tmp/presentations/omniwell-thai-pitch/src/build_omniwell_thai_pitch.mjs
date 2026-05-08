import fs from "node:fs";
import path from "node:path";
import {
  Presentation,
  PresentationFile,
  row,
  column,
  grid,
  layers,
  panel,
  text,
  shape,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
  auto,
} from "@oai/artifact-tool";

const W = 1920;
const H = 1080;
const workspace = path.resolve(".");
const outDir = path.join(workspace, "output");
const scratchDir = path.join(workspace, "scratch");
const previewDir = path.join(scratchDir, "previews");
const layoutDir = path.join(scratchDir, "layouts");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });
fs.mkdirSync(layoutDir, { recursive: true });

const C = {
  ink: "#12211D",
  night: "#071E1C",
  deep: "#0E3832",
  green: "#0F8C68",
  leaf: "#7FD18B",
  mint: "#DDF7E8",
  gold: "#F0BE49",
  saffron: "#F06C3E",
  blue: "#4CA7C5",
  cream: "#FFF5DF",
  paper: "#F8F1E1",
  white: "#FFFFFF",
  muted: "#6F7C73",
};

const display = "Aptos Display";
const body = "Aptos";

const presentation = Presentation.create({
  slideSize: { width: W, height: H },
});

function style(size, color = C.ink, opts = {}) {
  return {
    fontFace: opts.fontFace ?? body,
    fontSize: size,
    color,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
  };
}

function t(value, options = {}) {
  return text(value, {
    name: options.name,
    width: options.width ?? fill,
    height: options.height ?? hug,
    columnSpan: options.columnSpan,
    rowSpan: options.rowSpan,
    style: style(options.size ?? 30, options.color ?? C.ink, {
      bold: options.bold,
      italic: options.italic,
      fontFace: options.fontFace,
    }),
  });
}

function footer(slideNo, label = "OmniWell Thai | Hackathon Pitch") {
  return row(
    {
      name: `footer-${slideNo}`,
      width: fill,
      height: hug,
      align: "center",
      justify: "between",
    },
    [
      t(label, { name: `footer-label-${slideNo}`, width: wrap(760), size: 18, color: C.muted }),
      t(String(slideNo).padStart(2, "0"), {
        name: `footer-number-${slideNo}`,
        width: fixed(56),
        size: 18,
        color: C.muted,
        bold: true,
      }),
    ],
  );
}

function dot(name, color, size = 18) {
  return shape({ name, geometry: "ellipse", width: fixed(size), height: fixed(size), fill: color });
}

function pill(label, color, idx, width = 260) {
  return panel(
    {
      name: `pill-${idx}`,
      width: fixed(width),
      height: hug,
      padding: { x: 20, y: 12 },
      fill: color,
      borderRadius: "rounded-full",
    },
    t(label, { name: `pill-text-${idx}`, width: fill, size: 20, color: C.white, bold: true }),
  );
}

function addSlide({ notes, children, background = C.paper }) {
  const slide = presentation.slides.add();
  slide.compose(
    layers({ name: "slide-stage", width: fill, height: fill }, [
      shape({ name: "background", width: fill, height: fill, fill: background }),
      ...children,
    ]),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
  slide.speakerNotes.setText(notes);
  return slide;
}

function titleStack(slideNo, eyebrow, title, subtitle, dark = false) {
  return column(
    { name: `title-stack-${slideNo}`, width: fill, height: hug, gap: 18 },
    [
      t(eyebrow, {
        name: `eyebrow-${slideNo}`,
        width: wrap(900),
        size: 20,
        color: dark ? C.gold : C.green,
        bold: true,
      }),
      t(title, {
        name: `slide-title-${slideNo}`,
        width: wrap(1360),
        size: 62,
        color: dark ? C.white : C.ink,
        bold: true,
        fontFace: display,
      }),
      subtitle
        ? t(subtitle, {
            name: `slide-subtitle-${slideNo}`,
            width: wrap(1160),
            size: 28,
            color: dark ? C.mint : C.deep,
          })
        : rule({ name: `title-rule-${slideNo}`, width: fixed(260), stroke: dark ? C.gold : C.saffron, weight: 5 }),
    ].filter(Boolean),
  );
}

function standardSlide(slideNo, eyebrow, title, subtitle, bodyChildren, opts = {}) {
  addSlide({
    background: opts.dark ? C.night : opts.background ?? C.paper,
    notes: opts.notes,
    children: [
      grid(
        {
          name: `root-${slideNo}`,
          width: fill,
          height: fill,
          columns: [fr(1)],
          rows: [auto, fr(1), auto],
          rowGap: 38,
          padding: { x: 86, y: 62 },
        },
        [
          titleStack(slideNo, eyebrow, title, subtitle, opts.dark),
          bodyChildren,
          footer(slideNo, opts.footerLabel),
        ],
      ),
    ],
  });
}

function openList(items, color = C.ink) {
  return column(
    { name: "open-list", width: fill, height: hug, gap: 24 },
    items.map((item, i) =>
      row({ name: `open-list-row-${i}`, width: fill, height: hug, gap: 18, align: "start" }, [
        dot(`open-list-dot-${i}`, item.color ?? C.saffron, 20),
        column({ name: `open-list-copy-${i}`, width: fill, height: hug, gap: 6 }, [
          t(item.label, { name: `open-list-label-${i}`, width: fill, size: item.labelSize ?? 32, color, bold: true }),
          t(item.copy, { name: `open-list-copy-text-${i}`, width: wrap(item.copyWidth ?? 760), size: 24, color: item.copyColor ?? C.deep }),
        ]),
      ]),
    ),
  );
}

addSlide({
  background: C.night,
  notes:
    "[0:00-0:25] Today, wellness advice is everywhere. In a post-AGI world, intelligence is no longer scarce; relevance is. OmniWell Thai brings relevance to the exact moment health decisions happen: the meal. We combine AGI software, a Smart Spoon that measures food directly, and Thailand's healing culture to make personal wellness feel local, trusted, and actionable. The promise is simple: advice that meets Thai people where they already eat, recover, and heal.",
  children: [
    layers({ name: "cover-art", width: fill, height: fill }, [
      shape({ name: "cover-gold-field", width: fixed(520), height: fill, fill: C.gold }),
      grid(
        {
          name: "cover-root",
          width: fill,
          height: fill,
          columns: [fr(1.05), fr(0.95)],
          columnGap: 64,
          padding: { x: 94, y: 76 },
        },
        [
          column({ name: "cover-type", width: fill, height: fill, gap: 24, justify: "center" }, [
            t("OMNIWELL THAI", { name: "cover-kicker", width: wrap(700), size: 24, color: C.gold, bold: true }),
            t("Post-AGI wellness, measured at the spoon.", {
              name: "cover-title",
              width: wrap(980),
              size: 88,
              color: C.white,
              bold: true,
              fontFace: display,
            }),
            rule({ name: "cover-rule", width: fixed(260), stroke: C.saffron, weight: 7 }),
            t("A five-minute hackathon pitch for hyper-personalized nutrition and Thai healing.", {
              name: "cover-subtitle",
              width: wrap(820),
              size: 30,
              color: C.mint,
            }),
          ]),
          layers({ name: "cover-spoon-field", width: fill, height: fill }, [
            shape({ name: "cover-orbit", geometry: "ellipse", width: fixed(600), height: fixed(600), fill: "#123F39" }),
            shape({ name: "cover-spoon-bowl", geometry: "ellipse", width: fixed(230), height: fixed(320), fill: C.white }),
            shape({ name: "cover-spoon-handle", width: fixed(72), height: fixed(470), fill: C.white }),
            column({ name: "cover-signal-stack", width: fill, height: fill, gap: 20, justify: "end", align: "end", padding: { y: 80 } }, [
              pill("AGI nutrition", C.green, "cover-a", 280),
              pill("Smart Spoon", C.saffron, "cover-b", 280),
              pill("Thai healing", C.blue, "cover-c", 280),
            ]),
          ]),
        ],
      ),
    ]),
  ],
});

standardSlide(
  2,
  "HOOK | THE POST-AGI PARADOX",
  "More intelligence does not automatically mean better health.",
  "As AI becomes abundant, people drown in advice. The winning product turns context into one clear next action.",
  grid(
    { name: "paradox-grid", width: fill, height: fill, columns: [fr(0.9), fr(1.1)], columnGap: 80, alignItems: "center" },
    [
      column({ name: "paradox-left", width: fill, height: hug, gap: 22 }, [
        t("Advice is cheap.", { name: "paradox-a", width: fill, size: 64, color: C.saffron, bold: true, fontFace: display }),
        t("Precision is rare.", { name: "paradox-b", width: fill, size: 64, color: C.green, bold: true, fontFace: display }),
        t("Trust is cultural.", { name: "paradox-c", width: fill, size: 64, color: C.blue, bold: true, fontFace: display }),
      ]),
      openList([
        { label: "Software sees intent", copy: "Allergies, meds, goals, sleep, stress, and activity." },
        { label: "Hardware sees the meal", copy: "Macros, weight, sodium signals, and behavior in real time." },
        { label: "Community keeps it human", copy: "Thai healing practices make the plan feel familiar, not clinical." },
      ]),
    ],
  ),
  {
    notes:
      "[0:25-0:52] The paradox is simple. AGI can generate a thousand meal plans, but a Thai user does not need a thousand plans. They need one safe choice at lunch, one warning before too much sodium, and one path that fits family, neighborhood food, stress, air quality, and habits. OmniWell Thai is built for that last mile. That is the competitive gap.",
  },
);

standardSlide(
  3,
  "PROBLEM | WELLNESS BREAKS AT THE MEAL",
  "Thailand does not need generic wellness. It needs context-aware healing.",
  "Modern health data is scattered across apps, wearables, weather, pollution, clinics, and memory.",
  grid(
    { name: "problem-grid", width: fill, height: fill, columns: [fr(1), fr(1), fr(1)], columnGap: 42, alignItems: "center" },
    [
      column({ name: "problem-1", width: fill, height: hug, gap: 14 }, [
        t("Food is local", { name: "problem-head-1", size: 38, color: C.green, bold: true }),
        t("Recommendations fail when they ignore Thai ingredients, street food, family meals, and budget reality.", { name: "problem-body-1", size: 24, color: C.deep }),
      ]),
      column({ name: "problem-2", width: fill, height: hug, gap: 14 }, [
        t("Risk is dynamic", { name: "problem-head-2", size: 36, color: C.saffron, bold: true }),
        t("Sleep, stress, exercise load, PM2.5, UV, medication, and allergies change the right choice every day.", { name: "problem-body-2", size: 23, color: C.deep }),
      ]),
      column({ name: "problem-3", width: fill, height: hug, gap: 14 }, [
        t("Behavior is embodied", { name: "problem-head-3", size: 36, color: C.blue, bold: true }),
        t("Health decisions happen in the hand, the spoon, the table, and the community around the person.", { name: "problem-body-3", size: 23, color: C.deep }),
      ]),
    ],
  ),
  {
    notes:
      "[0:52-1:18] Most wellness products stop at dashboards. Thailand's opportunity is different. Health decisions are deeply local: what is available at the market, what the family is eating, whether the air is bad today, whether the user slept poorly, and whether a monk talk, massage, or group walk is the right support. Generic nutrition misses that, so the product must be as Thai as the food.",
  },
);

standardSlide(
  4,
  "SOLUTION | THE TRIAD",
  "OmniWell Thai joins the three things wellness usually separates.",
  "A measured meal, an AGI reasoning layer, and a healing ecosystem that people already recognize.",
  grid(
    { name: "triad-grid", width: fill, height: fill, columns: [fr(0.95), fr(1.05)], columnGap: 76, alignItems: "center" },
    [
      column({ name: "triad-mark", width: fill, height: fill, gap: 24, justify: "center" }, [
        t("ONE\nNEXT\nACTION", { name: "triad-core-text", width: wrap(620), size: 78, color: C.green, bold: true, fontFace: display }),
        rule({ name: "triad-mark-rule", width: fixed(260), stroke: C.saffron, weight: 7 }),
        t("Measured meal -> AGI recommendation -> Thai healing action", {
          name: "triad-mark-copy",
          width: wrap(620),
          size: 29,
          color: C.deep,
          bold: true,
        }),
      ]),
      column({ name: "triad-list", width: fill, height: hug, gap: 30 }, [
        row({ name: "triad-a", width: fill, height: hug, gap: 18, align: "center" }, [dot("triad-dot-a", C.saffron, 28), t("Hardware: Smart Spoon measures the meal.", { name: "triad-text-a", size: 34, bold: true })]),
        row({ name: "triad-b", width: fill, height: hug, gap: 18, align: "center" }, [dot("triad-dot-b", C.green, 28), t("Software: AGI reasons across the person and environment.", { name: "triad-text-b", size: 34, bold: true })]),
        row({ name: "triad-c", width: fill, height: hug, gap: 18, align: "center" }, [dot("triad-dot-c", C.blue, 28), t("Community: Thai healing turns advice into adherence.", { name: "triad-text-c", size: 34, bold: true })]),
      ]),
    ],
  ),
  {
    notes:
      "[1:18-1:44] Our answer is a triad. Hardware captures the truth of the meal. AGI turns chaotic data into safe, personal recommendations. Community turns the recommendation into a lifestyle: massage, acupuncture, community fitness, meditation, sound therapy, and healing tourism. The product is not another chatbot; it is a wellness loop. Each side reinforces the others.",
  },
);

standardSlide(
  5,
  "HARDWARE | WHY SOFTWARE ALONE IS NOT ENOUGH",
  "The Smart Spoon makes nutrition measurable at bite-level resolution.",
  "It is the bridge between what the plan says and what the user actually eats.",
  grid(
    { name: "hardware-grid", width: fill, height: fill, columns: [fr(1.05), fr(0.95)], columnGap: 74, alignItems: "center" },
    [
      layers({ name: "spoon-diagram", width: fill, height: fill }, [
        shape({ name: "spoon-shadow", geometry: "ellipse", width: fixed(650), height: fixed(210), fill: "#E4D7B8" }),
        shape({ name: "spoon-bowl", geometry: "ellipse", width: fixed(300), height: fixed(390), fill: C.white }),
        shape({ name: "spoon-handle", width: fixed(82), height: fixed(510), fill: C.white }),
        shape({ name: "spoon-sensor", geometry: "ellipse", width: fixed(70), height: fixed(70), fill: C.green }),
      ]),
      openList([
        { label: "NIR", copy: "Estimates macro composition patterns at the meal surface.", color: C.green },
        { label: "Load cell", copy: "Measures weight and portion behavior as the user eats.", color: C.gold },
        { label: "EIS", copy: "Detects sodium-ion signals for salt-sensitive guidance.", color: C.saffron },
        { label: "Haptics", copy: "Gives private, immediate feedback without interrupting the table.", color: C.blue },
      ]),
    ],
  ),
  {
    notes:
      "[1:44-2:14] Software can ask what you ate, but people forget, guess, or underreport. The Smart Spoon closes that gap. NIR helps estimate macro patterns. The load cell measures weight and portion. EIS gives a sodium signal, critical for many chronic risk profiles. Haptics make the feedback immediate and respectful. It turns passive tracking into active coaching.",
  },
);

standardSlide(
  6,
  "ENGINE | AGI SYNTHESIZES CHAOS",
  "OmniWell turns scattered signals into meal-level precision.",
  "Static profile, dynamic body state, and environment become one recommendation the user can act on now.",
  column(
    { name: "engine-body", width: fill, height: fill, gap: 34, justify: "center" },
    [
      row({ name: "engine-inputs", width: fill, height: hug, gap: 24, justify: "between" }, [
        pill("Static profile", C.deep, "engine-1", 330),
        pill("Dynamic body", C.green, "engine-2", 330),
        pill("Environment", C.blue, "engine-3", 330),
        pill("Meal signal", C.saffron, "engine-4", 330),
      ]),
      rule({ name: "engine-rule", width: fill, stroke: C.gold, weight: 5 }),
      row({ name: "engine-output", width: fill, height: hug, gap: 30, align: "center" }, [
        t("AGI reasoning layer", { name: "engine-core", width: wrap(560), size: 54, color: C.green, bold: true, fontFace: display }),
        t("recommends the safest local ingredient, portion, timing, and healing support.", {
          name: "engine-output-text",
          width: wrap(860),
          size: 34,
          color: C.ink,
          bold: true,
        }),
      ]),
    ],
  ),
  {
    notes:
      "[2:14-2:40] The engine is where AGI matters. We are not predicting wellness from one variable. We combine static profile like allergies and medication, dynamic profile like sleep, stress, and PAI, environment like PM2.5 and UV, plus the actual meal signal from the spoon. The output is precise: eat this, reduce that, add this recovery practice. Every meal updates the model and makes tomorrow's advice sharper.",
  },
);

standardSlide(
  7,
  "EXPERIENCE | FROM DATA TO DINNER",
  "The recommendation must feel like Thailand, not a imported diet plan.",
  "Local, accessible ingredients make the science usable.",
  grid(
    { name: "experience-grid", width: fill, height: fill, columns: [fr(0.92), fr(1.08)], columnGap: 72, alignItems: "center" },
    [
      column({ name: "example-left", width: fill, height: hug, gap: 20 }, [
        t("Tonight's nudge", { name: "example-kicker", width: fill, size: 24, color: C.green, bold: true }),
        t("Choose gaeng liang,\nbrown rice,\nand grilled fish.", {
          name: "example-title",
          width: wrap(760),
          size: 58,
          color: C.ink,
          bold: true,
          fontFace: display,
        }),
      ]),
      column({ name: "example-right", width: fill, height: hug, gap: 24 }, [
        row({ name: "example-row-1", width: fill, height: hug, gap: 18 }, [dot("example-dot-1", C.green, 22), t("Because sleep was low and PM2.5 is high.", { name: "example-text-1", size: 31, color: C.deep, bold: true })]),
        row({ name: "example-row-2", width: fill, height: hug, gap: 18 }, [dot("example-dot-2", C.saffron, 22), t("Reduce sodium; the spoon will tap before the threshold.", { name: "example-text-2", size: 31, color: C.deep, bold: true })]),
        row({ name: "example-row-3", width: fill, height: hug, gap: 18 }, [dot("example-dot-3", C.blue, 22), t("Pair with breathwork or sound therapy after dinner.", { name: "example-text-3", size: 31, color: C.deep, bold: true })]),
      ]),
    ],
  ),
  {
    notes:
      "[2:40-3:06] Imagine the user opens dinner guidance. Instead of a generic salad, OmniWell suggests gaeng liang, brown rice, and grilled fish because the ingredients are accessible. If sleep was low and PM2.5 is high, it shifts toward anti-inflammatory choices. If sodium risk rises, the spoon taps before the user crosses the threshold. Personalization becomes visible without forcing the user to become a nutrition scientist.",
  },
);

standardSlide(
  8,
  "SOUL | THAI HEALING IS THE DEFENSIBLE LAYER",
  "Nutrition is the entry point. Healing is the ecosystem.",
  "Body, mind, and destination experiences give Thailand a cultural advantage in post-AGI wellness.",
  grid(
    { name: "soul-grid", width: fill, height: fill, columns: [fr(1), fr(1), fr(1)], columnGap: 46, alignItems: "center" },
    [
      column({ name: "soul-body", width: fill, height: hug, gap: 18 }, [
        t("BODY", { name: "soul-body-head", size: 42, color: C.saffron, bold: true, fontFace: display }),
        t("Thai massage\nAcupuncture\nCommunity fitness", { name: "soul-body-copy", size: 30, color: C.ink, bold: true }),
      ]),
      column({ name: "soul-mind", width: fill, height: hug, gap: 18 }, [
        t("MIND", { name: "soul-mind-head", size: 42, color: C.green, bold: true, fontFace: display }),
        t("Sound therapy\nGuided meditation\nDharma listening", { name: "soul-mind-copy", size: 30, color: C.ink, bold: true }),
      ]),
      column({ name: "soul-place", width: fill, height: hug, gap: 18 }, [
        t("PLACE", { name: "soul-place-head", size: 42, color: C.blue, bold: true, fontFace: display }),
        t("Healing tourism\nRetreat partners\nLocal practitioners", { name: "soul-place-copy", size: 30, color: C.ink, bold: true }),
      ]),
    ],
  ),
  {
    notes:
      "[3:06-3:33] This is the soul of the product. Thailand already has healing infrastructure: bodywork, acupuncture, community exercise, meditation, Dharma listening, retreats, and tourism. AGI can personalize the path, but Thai culture gives it trust, ritual, and continuity. That is difficult for a generic global wellness app to copy. The result is adherence with dignity.",
  },
);

standardSlide(
  9,
  "IMPACT | SCALE WITHOUT LOSING PERSONALITY",
  "The same loop can serve one meal, one family, one clinic, and 70 million Thais.",
  "We scale by keeping the recommendation small and the context rich.",
  grid(
    { name: "impact-grid", width: fill, height: fill, columns: [fr(0.82), fr(1.18)], columnGap: 80, alignItems: "center" },
    [
      column({ name: "impact-number", width: fill, height: hug, gap: 12 }, [
        t("70M", { name: "impact-70m", width: fill, size: 128, color: C.green, bold: true, fontFace: display }),
        t("Thai lives within reach", { name: "impact-caption", width: fill, size: 31, color: C.deep, bold: true }),
        t("Prompt assumption for pitch sizing.", { name: "impact-source", width: fill, size: 17, color: C.muted }),
      ]),
      column({ name: "impact-loop", width: fill, height: hug, gap: 22 }, [
        row({ name: "impact-a", width: fill, height: hug, gap: 18 }, [dot("impact-dot-a", C.saffron, 24), t("Meal feedback improves personal recommendations.", { name: "impact-text-a", size: 32, bold: true })]),
        row({ name: "impact-b", width: fill, height: hug, gap: 18 }, [dot("impact-dot-b", C.green, 24), t("Aggregated insights support families, coaches, and care teams.", { name: "impact-text-b", size: 32, bold: true })]),
        row({ name: "impact-c", width: fill, height: hug, gap: 18 }, [dot("impact-dot-c", C.blue, 24), t("Healing partners create a nationwide wellness network.", { name: "impact-text-c", size: 32, bold: true })]),
      ]),
    ],
  ),
  {
    notes:
      "[3:33-3:58] The impact is national but the interaction is intimate. Start with one meal. That builds a personal feedback loop. Then families, coaches, clinics, and wellness partners can support the same person with consent and context. For a country-scale market, around 70 million Thais, the system stays personal because the recommendation stays small. That is how scale avoids becoming generic.",
  },
);

standardSlide(
  10,
  "WHY NOW | POST-AGI MAKES THE LOOP POSSIBLE",
  "Three shifts are converging at the same time.",
  "AGI can reason across messy context; sensors can measure behavior; Thailand can own healing as a platform.",
  column(
    { name: "why-now-body", width: fill, height: fill, gap: 42, justify: "center" },
    [
      row({ name: "why-row-1", width: fill, height: hug, gap: 30, align: "center" }, [
        t("01", { name: "why-num-1", width: fixed(90), size: 44, color: C.saffron, bold: true, fontFace: display }),
        t("AGI shifts from advice generation to context orchestration.", { name: "why-text-1", width: fill, size: 35, bold: true }),
      ]),
      row({ name: "why-row-2", width: fill, height: hug, gap: 30, align: "center" }, [
        t("02", { name: "why-num-2", width: fixed(90), size: 44, color: C.green, bold: true, fontFace: display }),
        t("Low-friction sensors bring truth into daily eating.", { name: "why-text-2", width: fill, size: 35, bold: true }),
      ]),
      row({ name: "why-row-3", width: fill, height: hug, gap: 30, align: "center" }, [
        t("03", { name: "why-num-3", width: fixed(90), size: 44, color: C.blue, bold: true, fontFace: display }),
        t("Thai healing gives the product a local trust network from day one.", { name: "why-text-3", width: fill, size: 35, bold: true }),
      ]),
    ],
  ),
  {
    notes:
      "[3:58-4:24] Why now? Because the pieces finally fit. AGI can orchestrate messy context instead of giving generic answers. Sensors can make food intake measurable without making the user log every bite. And Thailand can turn healing from an offline cultural strength into a digital-plus-physical platform. This timing makes OmniWell feel inevitable.",
  },
);

standardSlide(
  11,
  "ASK | WHAT WE BUILD NEXT",
  "In this hackathon, we prove the loop.",
  "Prototype the spoon signal, build the AGI recommendation graph, and demo a Thai-local meal-to-healing journey.",
  grid(
    { name: "ask-grid", width: fill, height: fill, columns: [fr(1), fr(1)], columnGap: 72, alignItems: "center" },
    [
      column({ name: "ask-left", width: fill, height: hug, gap: 22 }, [
        t("Build", { name: "ask-build", size: 64, color: C.saffron, bold: true, fontFace: display }),
        t("Measure", { name: "ask-measure", size: 64, color: C.green, bold: true, fontFace: display }),
        t("Heal", { name: "ask-heal", size: 64, color: C.blue, bold: true, fontFace: display }),
      ]),
      openList([
        { label: "Prototype", copy: "Sensor simulation and haptic decision logic for the Smart Spoon.", color: C.saffron },
        { label: "Engine", copy: "AGI prompt graph for allergies, meds, sleep, stress, PAI, PM2.5, UV, and local ingredients.", color: C.green },
        { label: "Demo", copy: "A Thai meal recommendation that flows into body, mind, and tourism healing actions.", color: C.blue },
      ]),
    ],
  ),
  {
    notes:
      "[4:24-5:00] Our hackathon ask is focused: help us prove the loop. We will simulate the Smart Spoon signals, build the AGI recommendation graph, and demo a Thai-local journey from dinner guidance to healing support. OmniWell Thai is not just personal nutrition. It is a national wellness interface: measured, intelligent, and deeply Thai. Judges should see a working loop, not a promise deck.",
  },
);

const notesMarkdown = Array.from({ length: presentation.slides.count }, (_, index) => {
  const slide = presentation.slides.getItem(index);
  return `## Slide ${index + 1}\n\n${slide.speakerNotes.text}\n`;
}).join("\n");
fs.writeFileSync(path.join(scratchDir, "presenter-notes.md"), notesMarkdown, "utf8");

for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const png = await slide.export({ format: "png", width: W, height: H });
  fs.writeFileSync(path.join(previewDir, `slide-${String(i + 1).padStart(2, "0")}.png`), Buffer.from(await png.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  fs.writeFileSync(path.join(layoutDir, `slide-${String(i + 1).padStart(2, "0")}.layout.json`), JSON.stringify(layout, null, 2), "utf8");
}

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(outDir, "output.pptx"));

console.log(
  JSON.stringify(
    {
      slides: presentation.slides.count,
      pptx: path.join(outDir, "output.pptx"),
      previews: previewDir,
      layouts: layoutDir,
      notes: path.join(scratchDir, "presenter-notes.md"),
    },
    null,
    2,
  ),
);
