import { useGetStats, useListBots, useConnectBot, useDisconnectBot, getGetStatsQueryKey, getListBotsQueryKey } from "@workspace/api-client-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Activity, Power, PowerOff, Settings2, Cpu, Globe, Server } from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useGetStats({ query: { queryKey: getGetStatsQueryKey(), refetchInterval: 5000 } });
  const { data: bots, isLoading: botsLoading } = useListBots({ query: { queryKey: getListBotsQueryKey(), refetchInterval: 2000 } });
  
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "autonomous": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "connecting": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 animate-pulse";
      case "error": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getStatusText = (status: string) => {
    return t(`dashboard.status.${status}` as any) || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-foreground">{t('dashboard.title')}</h1>
        <Link href="/bots/new">
          <Button className="font-mono rounded-none bg-primary text-primary-foreground hover:bg-primary/80">
            [+] {t('nav.newBot')}
          </Button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.stats.total'), value: stats?.totalBots, icon: Server },
          { label: t('dashboard.stats.online'), value: stats?.onlineBots, icon: Globe },
          { label: t('dashboard.stats.autonomous'), value: stats?.autonomousBots, icon: Activity },
          { label: t('dashboard.stats.aiEnabled'), value: stats?.botsWithAi, icon: Cpu },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-mono text-muted-foreground">{stat.label}</p>
                <h3 className="text-3xl font-mono font-bold mt-2">
                  {statsLoading ? "-" : stat.value || 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bots List */}
      <div>
        <h2 className="text-lg font-mono font-bold mb-4 text-muted-foreground border-b border-border/50 pb-2">
          {t('dashboard.botList')}
        </h2>
        
        {botsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded bg-secondary animate-pulse" />
            ))}
          </div>
        ) : !bots || bots.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded bg-card/20">
            <p className="text-muted-foreground font-mono">{t('dashboard.noBots')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bots.map((bot) => (
              <Card key={bot.id} className="border-border/50 bg-card hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="font-mono text-xl">{bot.name}</CardTitle>
                    <Badge variant="outline" className={`font-mono ${getStatusColor(bot.status)}`}>
                      {getStatusText(bot.status)}
                    </Badge>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mt-1">
                    {bot.serverHost}:{bot.serverPort} ({bot.version})
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm font-mono mt-4 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Cpu className={`w-4 h-4 ${bot.useAi ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={bot.useAi ? 'text-foreground' : 'text-muted-foreground'}>
                        {bot.aiMode.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/bot/${bot.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full font-mono rounded-none h-10 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Settings2 className="w-4 h-4 mr-2" /> CONFIG
                      </Button>
                    </Link>
                    
                    {bot.status === 'offline' || bot.status === 'error' ? (
                      <Button 
                        onClick={() => connectBot.mutate({ id: bot.id })}
                        disabled={connectBot.isPending}
                        className="bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-none w-12 px-0 h-10"
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => disconnectBot.mutate({ id: bot.id })}
                        disabled={disconnectBot.isPending}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-none w-12 px-0 h-10"
                      >
                        <PowerOff className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
