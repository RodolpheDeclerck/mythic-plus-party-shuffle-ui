import { getTranslations } from "next-intl/server"
import { EventCodeForm } from "@/components/event-code-form"

export default async function HomePage() {
  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[#0a0614]/60" />
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50" />

      {/* Language Switcher now in GlobalHeader */}

      <div className="relative w-full max-w-md">
        {/* Card with cyan/purple void gradient border */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/70 via-purple-600/50 to-violet-800/60 shadow-2xl shadow-cyan-500/20">
          <div className="rounded-2xl bg-[#0a0614]/95 backdrop-blur-md p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              {/* Eyebrow */}
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
                {t("eyebrow")}
              </p>
              {/* Title */}
              <h1 className="text-2xl font-bold tracking-tight text-balance">
                <span className="bg-gradient-to-r from-cyan-300 via-white to-purple-400 bg-clip-text text-transparent">
                  {tCommon("appName")}
                </span>
              </h1>
              {/* Subtitle */}
              <p className="mt-2 text-sm text-gray-400">
                {t("subtitle")}
              </p>
            </div>

            <EventCodeForm />
          </div>
        </div>
      </div>
    </main>
  )
}
