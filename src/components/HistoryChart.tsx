import { HistoryPoint } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity } from "lucide-react";

const chartLines = [
  { key: "temperature", name: "Nhiệt độ (°C)", color: "hsl(162, 100%, 42%)" },
  { key: "humidity", name: "Độ ẩm (%)", color: "hsl(200, 80%, 55%)" },
  { key: "airQuality", name: "AQI", color: "hsl(32, 95%, 55%)" },
];

export function HistoryChart({ data }: { data: HistoryPoint[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Lịch sử 24 giờ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 18%)" />
              <XAxis
                dataKey="time"
                stroke="hsl(200, 10%, 55%)"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
                interval={3}
              />
              <YAxis
                stroke="hsl(200, 10%, 55%)"
                fontSize={11}
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(210, 18%, 10%)",
                  border: "1px solid hsl(210, 15%, 18%)",
                  borderRadius: "8px",
                  fontFamily: "JetBrains Mono",
                  fontSize: "12px",
                  color: "hsl(200, 20%, 90%)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", fontFamily: "Inter" }}
              />
              {chartLines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: line.color }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
