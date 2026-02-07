import { AlertCircle, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface TrialIndicatorProps {
  trialEndDate?: Date | string | null;
  isTrialActive?: boolean;
  onUpgrade?: () => void;
}

export default function TrialIndicator({
  trialEndDate,
  isTrialActive = false,
  onUpgrade,
}: TrialIndicatorProps) {
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!trialEndDate || !isTrialActive) return;

    const calculateDays = () => {
      const endDate = new Date(trialEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        setDaysRemaining(0);
        setPercentage(0);
        setIsExpired(true);
      } else {
        setDaysRemaining(diffDays);
        // Calcular percentual (15 dias = 100%)
        const percent = Math.max(0, (diffDays / 15) * 100);
        setPercentage(percent);
        setIsExpired(false);
      }
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // Atualizar a cada hora

    return () => clearInterval(interval);
  }, [trialEndDate, isTrialActive]);

  if (!isTrialActive || !trialEndDate) {
    return null;
  }

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <CardTitle className="text-red-900 dark:text-red-100">Período de Teste Expirado</CardTitle>
                <CardDescription className="text-red-700 dark:text-red-300">
                  Escolha um plano para continuar usando o Atendo
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={onUpgrade} className="w-full bg-red-600 hover:bg-red-700">
            Escolher Plano Agora
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isWarning = daysRemaining <= 3;
  const bgColor = isWarning ? "bg-amber-50 dark:bg-amber-950" : "bg-blue-50 dark:bg-blue-950";
  const borderColor = isWarning ? "border-amber-200 dark:border-amber-800" : "border-blue-200 dark:border-blue-800";
  const iconColor = isWarning ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400";
  const titleColor = isWarning ? "text-amber-900 dark:text-amber-100" : "text-blue-900 dark:text-blue-100";
  const descColor = isWarning ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300";

  return (
    <Card className={`border-2 ${borderColor} ${bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${iconColor}`} />
            <div>
              <CardTitle className={titleColor}>Período de Teste Premium</CardTitle>
              <CardDescription className={descColor}>
                {daysRemaining === 1
                  ? "Último dia de acesso premium"
                  : `${daysRemaining} dias restantes`}
              </CardDescription>
            </div>
          </div>
          {isWarning && (
            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progresso</span>
            <span className="text-muted-foreground">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-white/50 dark:bg-black/20 p-2">
            <div className="text-muted-foreground text-xs">Dias Restantes</div>
            <div className="font-bold text-lg">{daysRemaining}</div>
          </div>
          <div className="rounded-lg bg-white/50 dark:bg-black/20 p-2">
            <div className="text-muted-foreground text-xs">Acesso</div>
            <div className="font-bold text-sm">Premium</div>
          </div>
        </div>

        {daysRemaining <= 7 && (
          <Button
            onClick={onUpgrade}
            variant="default"
            className="w-full"
          >
            Escolher Plano Agora
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
