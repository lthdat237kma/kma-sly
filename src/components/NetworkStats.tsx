import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowUpDown, Timer, Database } from "lucide-react";
import { useDevices } from "@/hooks/useIoTData";

export function NetworkStats() {
  const devices = useDevices();

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const totalCount = devices.length;
  const avgRssi = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.rssi ?? -120), 0) / devices.length)
    : -120;
  const avgBattery = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + (d.battery ?? 0), 0) / devices.length)
    : 0;

  const stats = [
    { label: "Thiết bị online", value: `${onlineCount}/${totalCount}`, icon: ArrowUpDown, color: "text-primary" },
    { label: "RSSI trung bình", value: `${avgRssi} dBm`, icon: Zap, color: "text-warning" },
    { label: "Tần số", value: "868 MHz", icon: Timer, color: "text-primary" },
    { label: "Pin trung bình", value: `${avgBattery}%`, icon: Database, color: "text-chart-2" },
  ];

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
