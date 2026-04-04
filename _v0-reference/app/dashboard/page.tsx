import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { Dashboard } from "@/components/dashboard"

export default async function DashboardPage() {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <main className="relative min-h-screen flex items-start justify-center px-4 py-8 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background.jpg')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#0a0614]/75" />
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl pt-12">
          <Dashboard />
        </div>
      </main>
    </NextIntlClientProvider>
  )
}
