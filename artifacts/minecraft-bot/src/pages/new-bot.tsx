import { useTranslation } from "@/hooks/useTranslation";
import { useCreateBot } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Server } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  serverHost: z.string().min(1, "Server host is required"),
  serverPort: z.coerce.number().min(1).max(65535),
  version: z.string().optional(),
  aiMode: z.enum(["ollama", "api", "disabled"]),
  modelName: z.string().optional(),
  proxyHost: z.string().optional(),
  proxyPort: z.coerce.number().optional().or(z.literal("")),
  proxyType: z.string().optional(),
  proxyUser: z.string().optional(),
  autoLogin: z.boolean().default(false),
  useAi: z.boolean().default(true),
});

export default function NewBot() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createBot = useCreateBot();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serverHost: "localhost",
      serverPort: 25565,
      version: "",
      aiMode: "ollama",
      modelName: "llama3",
      autoLogin: false,
      useAi: true,
      proxyHost: "",
      proxyPort: "",
      proxyType: "socks5",
      proxyUser: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createBot.mutate(
      { data: values as any },
      {
        onSuccess: (newBot) => {
          toast({ title: t('newBot.success'), className: "border-primary bg-background" });
          setLocation(`/bot/${newBot.id}`);
        },
        onError: () => {
          toast({ title: t('newBot.error'), variant: "destructive" });
        }
      }
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-foreground">{t('newBot.title')}</h1>
        <p className="text-muted-foreground font-mono text-sm">{t('newBot.description')}</p>
      </div>

      <Card className="border-border/50 bg-card rounded-md">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <CardTitle className="font-mono flex items-center gap-2"><Server className="w-5 h-5 text-primary"/> Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">{t('newBot.name')}</FormLabel>
                      <FormControl>
                        <Input className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">{t('newBot.version')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('newBot.versionPlaceholder')} className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="serverHost"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-mono text-xs uppercase">{t('newBot.serverHost')}</FormLabel>
                      <FormControl>
                        <Input className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serverPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">{t('newBot.serverPort')}</FormLabel>
                      <FormControl>
                        <Input type="number" className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border/50 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="aiMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">{t('newBot.aiMode')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-mono bg-background border-border/50 rounded-none focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="font-mono rounded-none">
                          <SelectItem value="ollama">Ollama (Local)</SelectItem>
                          <SelectItem value="api">API (Cloud)</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase">{t('newBot.model')}</FormLabel>
                      <FormControl>
                        <Input className="font-mono bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border border-border/50 p-4 bg-background/30 space-y-4">
                <h3 className="font-mono text-xs uppercase text-muted-foreground">{t('newBot.proxySettings')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="proxyHost"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="font-mono text-[10px] uppercase">{t('newBot.proxyHost')}</FormLabel>
                        <FormControl>
                          <Input className="font-mono h-8 bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proxyPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase">{t('newBot.proxyPort')}</FormLabel>
                        <FormControl>
                          <Input type="number" className="font-mono h-8 bg-background border-border/50 rounded-none focus-visible:ring-primary" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="proxyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-[10px] uppercase">{t('newBot.proxyType')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono h-8 bg-background border-border/50 rounded-none focus:ring-primary">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="font-mono rounded-none">
                            <SelectItem value="socks5">SOCKS5</SelectItem>
                            <SelectItem value="http">HTTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/50 pt-6">
                <FormField
                  control={form.control}
                  name="autoLogin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-3 w-1/3">
                      <div className="space-y-0.5">
                        <FormLabel className="font-mono text-xs uppercase cursor-pointer">{t('newBot.autoLogin')}</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={createBot.isPending} className="font-mono uppercase tracking-wider rounded-none bg-primary text-primary-foreground hover:bg-primary/80 px-8">
                  {createBot.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('newBot.deploy')}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
