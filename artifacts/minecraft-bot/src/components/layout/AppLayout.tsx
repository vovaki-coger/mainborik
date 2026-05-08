import { Link, useLocation } from "wouter";
import { Terminal, LayoutDashboard, PlusSquare, Cpu, Settings, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUpdateSettings, useGetSettings } from "@workspace/api-client-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t, lang } = useTranslation();
  const { data: settings } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const toggleLanguage = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    if (settings) {
      updateSettings.mutate({ data: { ...settings, language: newLang } });
    } else {
      updateSettings.mutate({ data: { language: newLang } });
    }
  };

  const navItems = [
    { href: "/", label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: "/bots/new", label: t('nav.newBot'), icon: PlusSquare },
    { href: "/models", label: t('nav.models'), icon: Cpu },
    { href: "/settings", label: t('nav.settings'), icon: Settings },
    { href: "/help", label: t('nav.help'), icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row dark">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Terminal className="text-primary w-6 h-6" />
          <h1 className="font-mono font-bold text-lg tracking-wider text-primary">MC_BOT_MGR</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md font-mono text-sm transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex justify-between items-center">
          <div className="text-xs font-mono text-muted-foreground">SYSTEM: ONLINE</div>
          <button 
            onClick={toggleLanguage}
            className="text-xs font-mono px-2 py-1 bg-secondary rounded text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
