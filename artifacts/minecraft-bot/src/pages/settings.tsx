import { useTranslation } from "@/hooks/useTranslation";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
  const { t, lang } = useTranslation();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState({
    globalPassword: "",
    defaultProxy: "",
    defaultAiMode: "ollama",
    defaultModelName: "",
    language: "ru"
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        globalPassword: settings.globalPassword || "",
        defaultProxy: settings.defaultProxy || "",
        defaultAiMode: settings.defaultAiMode || "ollama",
        defaultModelName: settings.defaultModelName || "",
        language: settings.language || "ru"
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      { data: formData as any },
      {
        onSuccess: () => {
          toast({ title: t('settings.success'), className: "border-primary bg-background" });
        },
        onError: () => {
          toast({ title: t('settings.error'), variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center font-mono animate-pulse text-primary">{t('common.loading')}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground font-mono text-sm">{t('settings.description')}</p>
      </div>

      <Card className="border-border/50 bg-card rounded-md">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <CardTitle className="font-mono flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary"/> Global Config</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase">{t('settings.language')}</Label>
            <Select 
              value={formData.language} 
              onValueChange={(val) => setFormData(f => ({ ...f, language: val }))}
            >
              <SelectTrigger className="font-mono bg-background border-border/50 rounded-none focus:ring-primary w-full md:w-1/2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono rounded-none">
                <SelectItem value="ru">Русский (RU)</SelectItem>
                <SelectItem value="en">English (EN)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase">{t('settings.globalPassword')}</Label>
            <Input 
              type="password" 
              value={formData.globalPassword}
              onChange={(e) => setFormData(f => ({ ...f, globalPassword: e.target.value }))}
              className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" 
            />
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-xs uppercase">{t('settings.defaultProxy')}</Label>
            <Input 
              value={formData.defaultProxy}
              onChange={(e) => setFormData(f => ({ ...f, defaultProxy: e.target.value }))}
              placeholder="socks5://user:pass@host:port"
              className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase">{t('settings.defaultAiMode')}</Label>
              <Select 
                value={formData.defaultAiMode} 
                onValueChange={(val) => setFormData(f => ({ ...f, defaultAiMode: val }))}
              >
                <SelectTrigger className="font-mono bg-background border-border/50 rounded-none focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="font-mono rounded-none">
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  <SelectItem value="api">API (Cloud)</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-mono text-xs uppercase">{t('settings.defaultModel')}</Label>
              <Input 
                value={formData.defaultModelName}
                onChange={(e) => setFormData(f => ({ ...f, defaultModelName: e.target.value }))}
                placeholder="llama3"
                className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} disabled={updateSettings.isPending} className="font-mono uppercase tracking-wider rounded-none bg-primary text-primary-foreground hover:bg-primary/80">
              {updateSettings.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('settings.save')}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
