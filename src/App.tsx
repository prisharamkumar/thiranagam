import React, { useState } from 'react';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { TopNav } from './components/TopNav';
import { CompanionDock } from './components/CompanionDock';
import { ThemeAtmosphereBackdrop } from './components/ThemeAtmosphereBackdrop';
import { RewardToastBurst } from './components/RewardToastBurst';
import { ProfileModal } from './components/ProfileModal';
import { HelpMeRestartModal } from './components/HelpMeRestartModal';
import { OnboardingModal } from './components/OnboardingModal';
import { StudentAvatar } from './components/StudentAvatar';
import { TodayPage } from './pages/TodayPage';
import { FocusStudioPage } from './pages/FocusStudioPage';
import { TodoPage } from './pages/TodoPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ArcadePage } from './pages/ArcadePage';
import { HabitatPage } from './pages/HabitatPage';
import { SanctumPage } from './pages/SanctumPage';
import { InsightsPage } from './pages/InsightsPage';
import { SettingsPage } from './pages/SettingsPage';

const ThiranagamShell: React.FC = () => {
  const {
    activePage,
    signedOutDemo,
    resumeDemoSession,
    profile,
    microtasks,
    resources,
    companionDockMinimized,
  } = useAppState();
  const [profileOpen, setProfileOpen] = useState(false);

  if (signedOutDemo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--sp-canvas)] text-[var(--sp-ink)] relative">
        <ThemeAtmosphereBackdrop />
        <div className="relative z-10 w-full max-w-lg rounded-3xl bg-[var(--sp-surface)] border border-[var(--sp-border)] shadow-xl p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="relative">
              <StudentAvatar avatarId={profile.avatarId} name={profile.name} size={72} />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] flex items-center justify-center shadow">
                <Compass className="w-4 h-4" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--sp-ink-muted)]">
              Thiranagam · திறனகம்
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--sp-ink)] mt-1">
              Session Paused Safely
            </h1>
            <p className="text-sm text-[var(--sp-ink-muted)] mt-2 leading-relaxed">
              Your local study space for <strong>{profile.name}</strong> is safely preserved on this
              device. Signing out in Local Demo Mode never erases your progress.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-left">
            <div className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              <span className="text-[11px] text-[var(--sp-ink-muted)] block">Tasks Saved</span>
              <span className="font-mono text-base font-semibold tabular-nums text-[var(--sp-ink)]">
                {microtasks.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              <span className="text-[11px] text-[var(--sp-ink-muted)] block">Acorns</span>
              <span className="font-mono text-base font-semibold tabular-nums text-[var(--sp-ink)]">
                {resources.acorns}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--sp-surface-muted)] border border-[var(--sp-border)]">
              <span className="text-[11px] text-[var(--sp-ink-muted)] block">Dewdrops</span>
              <span className="font-mono text-base font-semibold tabular-nums text-[var(--sp-ink)]">
                {resources.dewdrops}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--sp-accent-soft)] border border-[var(--sp-border)] text-xs text-[var(--sp-ink-muted)] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--sp-accent)] shrink-0" aria-hidden="true" />
            <span>Local Demo Mode · Cloud sign-in (Firebase Auth) arrives in Phase 4</span>
          </div>

          <button
            type="button"
            onClick={resumeDemoSession}
            className="w-full py-3 px-5 rounded-xl bg-[var(--sp-accent)] text-[var(--sp-accent-ink)] text-sm font-semibold hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <span>Resume Local Workspace</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'today':
        return <TodayPage onOpenProfile={() => setProfileOpen(true)} />;
      case 'focus':
        return <FocusStudioPage />;
      case 'todos':
        return <TodoPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'arcade':
        return <ArcadePage />;
      case 'habitat':
        return <HabitatPage />;
      case 'sanctum':
        return <SanctumPage />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <TodayPage onOpenProfile={() => setProfileOpen(true)} />;
    }
  };

  return (
    <div className="h-[100dvh] lg:h-auto lg:min-h-screen flex flex-col bg-[var(--sp-canvas)] text-[var(--sp-ink)] relative">
      <ThemeAtmosphereBackdrop />
      <TopNav onOpenProfile={() => setProfileOpen(true)} />

      <div className="relative z-10 flex-1 min-h-0 lg:min-h-fit flex flex-col lg:flex-row lg:items-stretch">
        <main
          className={`order-1 lg:order-2 flex-1 min-w-0 min-h-0 lg:min-h-fit overflow-y-auto lg:overflow-visible pb-6 ${
            companionDockMinimized ? 'lg:pb-20' : 'lg:pb-12'
          }`}
        >
          {renderPage()}
        </main>

        <CompanionDock />
      </div>

      <RewardToastBurst />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <HelpMeRestartModal />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <AppStateProvider>
      <ThiranagamShell />
    </AppStateProvider>
  );
}
