'use client';

import { loginBackgroundImageUrl } from '../config/loginBackground';
import Dashboard from '../components/Dashboard/Dashboard';

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-12 pt-8">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${loginBackgroundImageUrl.replace(/'/g, '%27')}')`,
        }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-[#0a0614]/75" aria-hidden />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-t from-[#0a0614] via-transparent to-[#0a0614]/40"
        aria-hidden
      />
      <div
        className="fixed inset-0 z-0 bg-gradient-to-r from-[#0a0614]/50 via-transparent to-[#0a0614]/50"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl pt-10 sm:pt-12">
        <Dashboard />
      </div>
    </main>
  );
}
