'use client';

import { loginBackgroundImageUrl } from '../config/loginBackground';
import EventView from '../components/EventView/EventView';

export default function EventPage() {
  return (
    <main className="relative flex min-h-screen items-start justify-center overflow-hidden px-4 py-8">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${loginBackgroundImageUrl.replace(/'/g, '%27')}')`,
        }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-[#0a0614]/70" aria-hidden />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40"
        aria-hidden
      />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-5xl py-4 sm:py-8">
        <EventView />
      </div>
    </main>
  );
}
