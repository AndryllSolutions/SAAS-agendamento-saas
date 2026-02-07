import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Slider } from "./ui/slider";
import { TrendingUp, DollarSign, Zap } from "lucide-react";

export default function ROICalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [profitMargin, setProfitMargin] = useState(20);
  const [priceIncrease, setPriceIncrease] = useState(15);

  // Cálculos
  const currentProfit = (monthlyRevenue * profitMargin) / 100;
  const revenueWithIncrease = monthlyRevenue * (1 + priceIncrease / 100);
  const newProfit = (revenueWithIncrease * profitMargin) / 100;
  const additionalProfit = newProfit - currentProfit;
  const annualAdditionalProfit = additionalProfit * 12;
  const roiPercentage = ((additionalProfit / currentProfit) * 100).toFixed(1);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-none shadow-soft">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-lg">
          <CardTitle className="text-3xl flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Calculadora de ROI
          </CardTitle>
          <CardDescription className="text-base">
            Veja quanto você pode ganhar a mais com precificação inteligente
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-8">
              {/* Faturamento Mensal */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-gray-900">
                    Faturamento Mensal
                  </label>
                  <span className="text-2xl font-bold text-primary">
                    R$ {monthlyRevenue.toLocaleString("pt-BR")}
                  </span>
                </div>
                <Slider
                  value={[monthlyRevenue]}
                  onValueChange={(value) => setMonthlyRevenue(value[0])}
                  min={1000}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>R$ 1.000</span>
                  <span>R$ 100.000</span>
                </div>
              </div>

              {/* Margem de Lucro */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-gray-900">
                    Margem de Lucro Atual
                  </label>
                  <span className="text-2xl font-bold text-secondary">
                    {profitMargin}%
                  </span>
                </div>
                <Slider
                  value={[profitMargin]}
                  onValueChange={(value) => setProfitMargin(value[0])}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Aumento de Preço */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-semibold text-gray-900">
                    Aumento de Preço com Atendo
                  </label>
                  <span className="text-2xl font-bold text-green-600">
                    +{priceIncrease}%
                  </span>
                </div>
                <Slider
                  value={[priceIncrease]}
                  onValueChange={(value) => setPriceIncrease(value[0])}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* Current Profit */}
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <p className="text-sm text-gray-600 font-medium">Lucro Mensal Atual</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {currentProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* New Profit */}
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-600 font-medium">Lucro Mensal com Atendo</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  R$ {newProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Additional Profit */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-600 font-medium">Lucro Adicional Mensal</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  R$ {additionalProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* Annual Additional Profit */}
              <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-purple-600 font-medium">Lucro Adicional Anual</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  R$ {annualAdditionalProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </div>

              {/* ROI Percentage */}
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-primary/30">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="text-sm text-primary font-medium">Aumento de Lucro</p>
                </div>
                <p className="text-3xl font-bold text-primary">
                  +{roiPercentage}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Seu lucro aumentaria em {roiPercentage}% com a precificação correta
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-l-4 border-blue-500">
            <h4 className="font-bold text-gray-900 mb-2">Resumo do Impacto:</h4>
            <p className="text-gray-700">
              Com um aumento de <strong>{priceIncrease}%</strong> nos preços através da precificação inteligente do Atendo, 
              você teria um lucro adicional de <strong>R$ {additionalProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} por mês</strong>, 
              totalizando <strong>R$ {annualAdditionalProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} por ano</strong>. 
              Isso representa um crescimento de <strong>{roiPercentage}%</strong> no seu lucro!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
