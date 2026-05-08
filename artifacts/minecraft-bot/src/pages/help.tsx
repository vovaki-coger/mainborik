import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Terminal } from "lucide-react";

export default function Help() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-mono font-bold text-foreground">{t('help.title')}</h1>
      </div>

      <Card className="border-border/50 bg-card rounded-md">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <CardTitle className="font-mono text-lg flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" /> {t('help.ollama')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-muted-foreground font-mono text-sm">{t('help.ollamaDesc')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <a href="https://ollama.com/download/windows" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 border border-border/50 rounded-none bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors font-mono text-sm">
              <ExternalLink className="w-4 h-4" /> {t('help.windows')}
            </a>
            <a href="https://ollama.com/download/mac" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 border border-border/50 rounded-none bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors font-mono text-sm">
              <ExternalLink className="w-4 h-4" /> {t('help.mac')}
            </a>
            <a href="https://ollama.com/download/linux" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 border border-border/50 rounded-none bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors font-mono text-sm">
              <ExternalLink className="w-4 h-4" /> {t('help.linux')}
            </a>
          </div>
          
          <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-none mt-4">
            <code className="text-primary font-mono text-sm">curl -fsSL https://ollama.com/install.sh | sh</code>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card rounded-md">
        <CardHeader className="border-b border-border/50 bg-card/50">
          <CardTitle className="font-mono text-lg">{t('help.faq')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-border/50">
              <AccordionTrigger className="font-mono hover:text-primary hover:no-underline">{t('help.q1')}</AccordionTrigger>
              <AccordionContent className="font-mono text-muted-foreground">
                {t('help.a1')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-border/50 border-b-0">
              <AccordionTrigger className="font-mono hover:text-primary hover:no-underline">{t('help.q2')}</AccordionTrigger>
              <AccordionContent className="font-mono text-muted-foreground">
                {t('help.a2')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

    </div>
  );
}
