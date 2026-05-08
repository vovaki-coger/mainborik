import { useTranslation } from "@/hooks/useTranslation";
import { useListModels, useGetOllamaStatus, usePullModel, useDeleteModel, getListModelsQueryKey, getGetOllamaStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Cpu, Download, Trash2, CheckCircle2, ServerOff, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Models() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: models, isLoading: modelsLoading } = useListModels({ query: { queryKey: getListModelsQueryKey(), refetchInterval: 5000 } });
  const { data: ollamaStatus } = useGetOllamaStatus({ query: { queryKey: getGetOllamaStatusQueryKey(), refetchInterval: 5000 } });
  
  const pullModel = usePullModel();
  const deleteModel = useDeleteModel();

  const handlePull = (name: string) => {
    pullModel.mutate(
      { name },
      {
        onSuccess: () => {
          toast({ title: t('models.success'), className: "border-primary bg-background" });
          queryClient.invalidateQueries({ queryKey: [`/api/ollama/models`] });
        },
        onError: () => {
          toast({ title: t('models.error'), variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (name: string) => {
    if (!confirm("Are you sure?")) return;
    deleteModel.mutate(
      { name },
      {
        onSuccess: () => {
          toast({ title: t('models.success'), className: "border-primary bg-background" });
          queryClient.invalidateQueries({ queryKey: [`/api/ollama/models`] });
        },
        onError: () => {
          toast({ title: t('models.error'), variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground">{t('models.title')}</h1>
          <p className="text-muted-foreground font-mono text-sm">{t('models.description')}</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm border border-border/50 p-2 bg-card/50 rounded-md">
          {ollamaStatus?.running ? (
            <><CheckCircle2 className="w-4 h-4 text-green-500" /> <span className="text-green-400">{t('models.status.running')} (v{ollamaStatus.version})</span></>
          ) : (
            <><ServerOff className="w-4 h-4 text-red-500" /> <span className="text-red-400">{t('models.status.offline')}</span></>
          )}
        </div>
      </div>

      {modelsLoading ? (
        <div className="p-8 text-center font-mono animate-pulse text-primary">{t('common.loading')}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models?.map((model) => (
            <Card key={model.name} className="border-border/50 bg-card rounded-md flex flex-col">
              <CardHeader className="pb-3 border-b border-border/50 bg-card/50">
                <div className="flex justify-between items-start">
                  <CardTitle className="font-mono text-lg flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    {model.displayName}
                  </CardTitle>
                  <Badge variant="outline" className={`font-mono ${
                    model.status === 'available' ? 'border-green-500 text-green-400' :
                    model.status === 'downloading' ? 'border-yellow-500 text-yellow-400 animate-pulse' :
                    'border-zinc-700 text-zinc-500'
                  }`}>
                    {t(`models.status.${model.status}` as any) || model.status}
                  </Badge>
                </div>
                <CardDescription className="font-mono text-xs mt-1 text-muted-foreground">
                  {model.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4 font-mono text-xs">
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span className="text-muted-foreground">{t('models.size')}</span>
                    <span>{model.size || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/30 pb-1">
                    <span className="text-muted-foreground">{t('models.ramRequired')}</span>
                    <span>{model.ramRequired || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('models.vramRequired')}</span>
                    <span>{model.vramRequired || "Unknown"}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-auto">
                  {model.status === 'not_downloaded' || model.status === 'downloading' ? (
                    <Button 
                      onClick={() => handlePull(model.name)}
                      disabled={model.status === 'downloading' || !ollamaStatus?.running}
                      className="w-full font-mono rounded-none bg-primary text-primary-foreground hover:bg-primary/80"
                    >
                      {model.status === 'downloading' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      {t('models.download')}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleDelete(model.name)}
                      variant="outline"
                      className="w-full font-mono rounded-none border-red-900 text-red-500 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('models.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
