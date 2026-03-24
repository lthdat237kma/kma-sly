import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowUpDown, Timer, Database } from "lucide-react";

const stats = [
  { label: "Gói tin/giờ", value: "1,247", icon: ArrowUpDown, color: "text-primary" },
  { label: "Uptime", value: "99.7%", icon: Timer, color: "text-primary" },
  { label: "Tần số", value: "868 MHz", icon: Zap, color: "text-warning" },
  { label: "Dữ liệu", value: "2.4 GB", icon: Database, color: "text-chart-2" },
];

export function NetworkStats() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Thống kê mạng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <span className="font-mono text-lg font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
