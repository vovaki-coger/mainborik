import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { 
  useGetBot, getGetBotQueryKey,
  useUpdateBot, 
  useConnectBot, 
  useDisconnectBot,
  useBotAction,
  useGetBotMessages,
  useSendBotMessage,
  useChatOffline,
  useListModels
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Drumstick, Shield, Zap, Send, Power, PowerOff, ShieldAlert, PauseCircle, MapPin, StopCircle, Type, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function BotControl() {
  const { id } = useParams<{ id: string }>();
  const botId = parseInt(id || "0", 10);
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bot, isLoading: botLoading } = useGetBot(botId, { 
    query: { enabled: !!botId, refetchInterval: 2000 } 
  });
  
  const { data: messages } = useGetBotMessages(botId, { limit: 50 }, { 
    query: { enabled: !!botId, refetchInterval: 3000 } 
  });

  const { data: models } = useListModels();

  const updateBot = useUpdateBot();
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();
  const botAction = useBotAction();
  const sendMsg = useSendBotMessage();
  const offlineChat = useChatOffline();

  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local state for AI Settings to debounce saves
  const [sysPrompt, setSysPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  
  const initialized = useRef(false);

  useEffect(() => {
    if (bot && !initialized.current) {
      setSysPrompt(bot.systemPrompt || "");
      setApiKey(bot.apiKey || "");
      initialized.current = true;
    }
  }, [bot]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUpdateSetting = (field: string, value: any) => {
    updateBot.mutate(
      { id: botId, data: { [field]: value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
        }
      }
    );
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (bot?.status === 'online' || bot?.status === 'autonomous') {
      sendMsg.mutate({ data: { content: chatInput, useAi: bot.useAi } });
    } else {
      // Offline chat mode
      offlineChat.mutate(
        { data: { message: chatInput, modelName: bot?.modelName || "llama3", systemPrompt: sysPrompt, aiMode: bot?.aiMode, apiKey } },
        {
          onSuccess: () => {
            // Need to simulate a chat message locally since we can't save offline messages to DB easily from here
            // In a real scenario, the backend would log this
            queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}/messages`] });
          }
        }
      );
    }
    setChatInput("");
  };

  const handleAction = (actionType: "stop" | "stop_movement" | "survivor_mode" | "rename", value?: string) => {
    botAction.mutate(
      { id: botId, data: { action: actionType, value } },
      {
        onSuccess: () => {
          toast({ title: t('bot.actions.success'), className: "border-primary bg-background" });
        },
        onError: () => {
          toast({ title: t('bot.actions.error'), variant: "destructive" });
        }
      }
    );
  };

  if (botLoading || !bot) return <div className="p-8 text-center font-mono animate-pulse text-primary">{t('common.loading')}</div>;

  const inventoryItems = bot.inventory ? JSON.parse(bot.inventory) : [];

  return (
    <div className="flex flex-col h-full gap-4 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-md">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-3">
            {bot.name}
            <Badge variant="outline" className={`font-mono ${
              bot.status === 'online' ? 'border-green-500 text-green-400' :
              bot.status === 'autonomous' ? 'border-purple-500 text-purple-400' :
              bot.status === 'connecting' ? 'border-yellow-500 text-yellow-400 animate-pulse' :
              'border-red-500 text-red-400'
            }`}>
              {t(`dashboard.status.${bot.status}` as any)}
            </Badge>
          </h1>
          <div className="text-sm font-mono text-muted-foreground mt-1 flex items-center gap-4">
            <span>{bot.serverHost}:{bot.serverPort}</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {bot.version}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {bot.status === 'offline' || bot.status === 'error' ? (
            <Button onClick={() => connectBot.mutate({ id: botId })} disabled={connectBot.isPending} className="font-mono bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-none border border-green-600/50">
              <Power className="w-4 h-4 mr-2" /> {t('bot.connect')}
            </Button>
          ) : (
            <Button onClick={() => disconnectBot.mutate({ id: botId })} disabled={disconnectBot.isPending} className="font-mono bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-none border border-red-600/50">
              <PowerOff className="w-4 h-4 mr-2" /> {t('bot.disconnect')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* LEFT: AI Settings */}
        <Card className="lg:col-span-3 border-border/50 bg-card rounded-md flex flex-col overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-card/50 py-3">
            <CardTitle className="font-mono text-sm uppercase tracking-wider text-primary">{t('bot.settings')}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-2">
              <Label className="font-mono text-xs text-muted-foreground">{t('bot.aiMode')}</Label>
              <Select value={bot.aiMode} onValueChange={(val) => handleUpdateSetting('aiMode', val)}>
                <SelectTrigger className="font-mono bg-background border-border/50 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  <SelectItem value="api">API (Cloud)</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bot.aiMode !== 'disabled' && (
              <>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">{t('bot.model')}</Label>
                  <Select value={bot.modelName || ""} onValueChange={(val) => handleUpdateSetting('modelName', val)}>
                    <SelectTrigger className="font-mono bg-background border-border/50 rounded-none">
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent className="font-mono">
                      {models?.map(m => (
                        <SelectItem key={m.name} value={m.name}>{m.displayName}</SelectItem>
                      ))}
                      <SelectItem value="gpt-4">GPT-4 (API)</SelectItem>
                      <SelectItem value="claude-3">Claude 3 (API)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bot.aiMode === 'api' && (
                  <div className="space-y-2">
                    <Label className="font-mono text-xs text-muted-foreground">{t('bot.apiKey')}</Label>
                    <Input 
                      type="password"
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)}
                      onBlur={() => handleUpdateSetting('apiKey', apiKey)}
                      className="font-mono bg-background border-border/50 rounded-none"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between border border-border/50 p-3 bg-background/50">
                  <Label className="font-mono text-xs cursor-pointer">{t('bot.autoReply')}</Label>
                  <Switch 
                    checked={bot.autoReply} 
                    onCheckedChange={(val) => handleUpdateSetting('autoReply', val)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col min-h-[200px]">
                  <Label className="font-mono text-xs text-muted-foreground">{t('bot.systemPrompt')}</Label>
                  <Textarea 
                    value={sysPrompt} 
                    onChange={(e) => setSysPrompt(e.target.value)}
                    onBlur={() => handleUpdateSetting('systemPrompt', sysPrompt)}
                    className="font-mono text-xs bg-background border-border/50 rounded-none flex-1 resize-none font-mono focus-visible:ring-primary"
                    placeholder="You are a helpful Minecraft assistant..."
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* CENTER: Monitor */}
        <Card className="lg:col-span-5 border-border/50 bg-card rounded-md flex flex-col overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-card/50 py-3">
            <CardTitle className="font-mono text-sm uppercase tracking-wider text-primary">{t('bot.monitor')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            
            <div className="p-4 grid grid-cols-2 gap-4 bg-background/50 border-b border-border/50">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-red-400 flex items-center gap-1"><Heart className="w-3 h-3"/> {t('bot.health')}</span>
                  <span>{bot.hp || 0}/20</span>
                </div>
                <div className="h-2 bg-zinc-900 overflow-hidden">
                  <motion.div className="h-full bg-red-500" initial={{ width: 0 }} animate={{ width: `${((bot.hp || 0) / 20) * 100}%` }} transition={{ type: "spring", stiffness: 100 }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-orange-400 flex items-center gap-1"><Drumstick className="w-3 h-3"/> {t('bot.hunger')}</span>
                  <span>{bot.hunger || 0}/20</span>
                </div>
                <div className="h-2 bg-zinc-900 overflow-hidden">
                  <motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: `${((bot.hunger || 0) / 20) * 100}%` }} transition={{ type: "spring", stiffness: 100 }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-green-400 flex items-center gap-1"><Zap className="w-3 h-3"/> {t('bot.xp')}</span>
                  <span>Lvl {bot.xp || 0}</span>
                </div>
                <div className="h-2 bg-zinc-900 overflow-hidden">
                  <motion.div className="h-full bg-green-500" initial={{ width: 0 }} animate={{ width: `${((bot.xp || 0) % 1) * 100}%` }} transition={{ type: "spring", stiffness: 100 }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-blue-400 flex items-center gap-1"><Shield className="w-3 h-3"/> {t('bot.armor')}</span>
                  <span>{bot.armor || 0}/20</span>
                </div>
                <div className="h-2 bg-zinc-900 overflow-hidden">
                  <motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${((bot.armor || 0) / 20) * 100}%` }} transition={{ type: "spring", stiffness: 100 }} />
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-border/50 flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3 h-3 text-primary" />
                XYZ: <span className="text-foreground">{bot.posX?.toFixed(1) || "?"} / {bot.posY?.toFixed(1) || "?"} / {bot.posZ?.toFixed(1) || "?"}</span>
              </div>
              <div className="text-muted-foreground">
                {t('bot.biome')}: <span className="text-primary">{bot.biome || "Unknown"}</span>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="font-mono text-xs text-muted-foreground mb-3">{t('bot.inventory')}</h3>
              {inventoryItems.length > 0 ? (
                <div className="grid grid-cols-9 gap-1 max-w-full">
                  {inventoryItems.map((item: any, i: number) => (
                    <div key={i} className="aspect-square bg-zinc-900 border border-zinc-800 flex items-center justify-center relative group" title={item.name}>
                      <span className="text-[10px] text-zinc-400 font-mono truncate px-1">{item.name.substring(0, 4)}</span>
                      {item.count > 1 && <span className="absolute bottom-0 right-0 text-[9px] font-mono bg-black/80 px-1 text-white">{item.count}</span>}
                    </div>
                  ))}
                  {/* Empty slots to make up 36 (9x4) */}
                  {Array.from({ length: Math.max(0, 36 - inventoryItems.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-zinc-900/50 border border-zinc-800/50" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-mono text-zinc-600 border border-dashed border-zinc-800">
                  {t('bot.emptyInventory')}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="p-2 border-t border-border/50 bg-background grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Button onClick={() => handleAction('stop')} variant="outline" className="font-mono text-xs rounded-none border-red-900 text-red-500 hover:bg-red-900/20">
                <StopCircle className="w-3 h-3 mr-1" /> {t('bot.actions.stop')}
              </Button>
              <Button onClick={() => handleAction('stop_movement')} variant="outline" className="font-mono text-xs rounded-none border-yellow-900 text-yellow-500 hover:bg-yellow-900/20">
                <PauseCircle className="w-3 h-3 mr-1" /> {t('bot.actions.stopMove')}
              </Button>
              <Button onClick={() => handleAction('survivor_mode')} variant="outline" className="font-mono text-xs rounded-none border-blue-900 text-blue-500 hover:bg-blue-900/20">
                <ShieldAlert className="w-3 h-3 mr-1" /> {t('bot.actions.survivor')}
              </Button>
              <Button onClick={() => {
                const newName = prompt(t('bot.actions.rename'));
                if (newName) handleUpdateSetting('name', newName);
              }} variant="outline" className="font-mono text-xs rounded-none border-zinc-800">
                <Type className="w-3 h-3 mr-1" /> {t('bot.actions.rename')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Chat */}
        <Card className="lg:col-span-4 border-border/50 bg-card rounded-md flex flex-col overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-card/50 py-3">
            <CardTitle className="font-mono text-sm uppercase tracking-wider text-primary">{t('bot.chat')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950 font-mono text-sm">
              <AnimatePresence initial={false}>
                {messages?.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'}`}
                  >
                    {msg.type === 'system' ? (
                      <span className="text-zinc-500 text-xs italic">{msg.content}</span>
                    ) : (
                      <div className="flex gap-2">
                        <span className={`shrink-0 ${
                          msg.type === 'ai' ? 'text-primary' : 
                          msg.type === 'bot' ? 'text-green-400' : 
                          msg.sender === 'User' ? 'text-blue-400' : 'text-zinc-400'
                        }`}>
                          &lt;{msg.sender}&gt;
                        </span>
                        <span className="text-zinc-300 break-words">{msg.content}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendChat} className="p-3 bg-background border-t border-border/50 flex gap-2">
              <Input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={bot.status === 'offline' ? "Chat with AI offline..." : "Send to server..."}
                className="font-mono rounded-none border-zinc-700 bg-zinc-900 focus-visible:ring-primary"
              />
              <Button type="submit" disabled={!chatInput.trim() || sendMsg.isPending || offlineChat.isPending} className="rounded-none font-mono bg-primary text-primary-foreground hover:bg-primary/80">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
