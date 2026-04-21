interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: string;
  min: number;
  max: number;
  status: "normal" | "warning" | "danger";
  trend: number[];
}
import { Card, CardContent } from "@/components/ui/card";
import { Thermometer, Droplets, Leaf, CloudRain } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  Thermometer,
  Droplets,
  Leaf,
  CloudRain,
};

const statusColor = {
  normal: "text-primary",
  warning: "text-warning",
  danger: "text-destructive",
};

const chartColor = {
  normal: "hsl(162, 100%, 42%)",
  warning: "hsl(32, 95%, 55%)",
  danger: "hsl(0, 72%, 55%)",
};

export function SensorCard({ sensor }: { sensor: SensorData }) {
  const Icon = iconMap[sensor.icon] || Thermometer;
  const trendData = sensor.trend.map((v, i) => ({ i, v }));
  const percentage = ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;

  return (
    <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-secondary ${statusColor[sensor.status]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">{sensor.name}</span>
          </div>
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id={`grad-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor[sensor.status]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColor[sensor.status]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={chartColor[sensor.status]}
                  strokeWidth={1.5}
                  fill={`url(#grad-${sensor.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className={`sensor-value ${statusColor[sensor.status]}`}>
            {sensor.value.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}
          </span>
          <span className="sensor-unit">{sensor.unit}</span>
        </div>

        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: chartColor[sensor.status],
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground font-mono">{sensor.min}</span>
          <span className="text-xs text-muted-foreground font-mono">{sensor.max}</span>
        </div>
      </CardContent>
    </Card>
  );
}
