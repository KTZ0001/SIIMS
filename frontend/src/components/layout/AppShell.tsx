import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

/**
 * The macOS-style window frame the demo lives inside. Chrome stays fixed; only
 * the main region scrolls.
 */
export function AppShell() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      <div className="glass-panel w-full max-w-[1500px] h-[94vh] rounded-xl overflow-hidden flex flex-col relative">
        <div className="h-9 w-full flex items-center px-4 shrink-0 border-b border-white/5 bg-black/40">
          <div className="flex gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto bg-black/20">
              <div className="mx-auto max-w-[1180px] p-6 md:p-8 space-y-7">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 blur-[120px] pointer-events-none rounded-full z-[-1]" />
      <div className="fixed top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full z-[-1]" />
    </div>
  );
}
