import { ShadowText } from "@/components/podie/kokonut--shadow-text/components/kokonutui/shadow-text";

export default function LumenGoldenHourForecast() {
  return (
    <main className="min-h-screen bg-[#eeeae1] px-5 py-6 text-zinc-950 sm:px-10 sm:py-10">
      <section className="mx-auto flex min-h-[720px] max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-zinc-900/10 bg-[#f8f5ef] shadow-[0_24px_80px_rgba(72,58,38,0.12)]">
        <header className="flex items-center justify-between border-b border-zinc-900/10 px-6 py-5 sm:px-10">
          <a href="#forecast" className="font-semibold tracking-[-0.03em]">lumen<span className="text-amber-600">/</span>field</a>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live sky data
          </div>
        </header>

        <div className="grid flex-1 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="flex flex-col justify-between px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div>
              <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-amber-700">Marin Headlands · 37.827° N</p>
              <h1 className="max-w-4xl text-balance font-semibold text-[clamp(3.5rem,9vw,8.5rem)] leading-[0.88] tracking-[-0.075em] text-zinc-900">
                <ShadowText as="span" clock={false} interactive reach={1.45}>
                  Find the light before it finds you.
                </ShadowText>
              </h1>
              <p className="mt-9 max-w-md text-base leading-7 text-zinc-600 sm:text-lg">
                Lumen turns local sky conditions into precise field notes for photographers, filmmakers, and anyone chasing one honest minute of light.
              </p>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <a href="#forecast" className="inline-flex h-12 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-amber-700">
                See tonight’s window
              </a>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Move across the headline</span>
            </div>
          </div>

          <aside id="forecast" className="flex flex-col justify-between border-t border-zinc-900/10 bg-[#e4ded2] px-6 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:py-12">
            <div>
              <div className="flex items-start justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Tonight’s field note</p>
                <span className="rounded-full border border-zinc-900/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">Clear</span>
              </div>
              <p className="mt-16 text-7xl font-medium tracking-[-0.08em] text-zinc-900">19:42</p>
              <p className="mt-2 text-sm text-zinc-600">Peak warm light · 42 minutes</p>
            </div>

            <div className="mt-16 space-y-5 border-t border-zinc-900/15 pt-6 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Cloud cover</span><span className="font-medium">8%</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Light direction</span><span className="font-medium">248° WSW</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Best position</span><span className="font-medium">Battery Spencer</span></div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}