import { Radio, Wifi, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            LoRa<span className="text-primary">WAN</span> Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Hệ thống giám sát cảm biến IoT thời gian thực
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
          <Wifi className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Gateway Online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            {time.toLocaleTimeString("vi-VN")}
          </span>
        </div>
      </div>
    </header>
  );
}
