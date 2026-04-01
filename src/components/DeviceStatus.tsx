interface DeviceInfo {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "warning";
  rssi: number;
  snr: number;
  battery: number;
  lastSeen: string;
  spreadingFactor: number;
  mcu: "ESP32" | "STM32";
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Battery, Signal, Cpu } from "lucide-react";

function RssiBar({ rssi }: { rssi: number }) {
  const strength = Math.max(0, Math.min(4, Math.floor((rssi + 120) / 15)));
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-colors ${
            i < strength ? "bg-primary" : "bg-secondary"
          }`}
          style={{ height: `${((i + 1) / 4) * 100}%` }}
        />
      ))}
    </div>
  );
}

const mcuColor = {
  ESP32: "text-chart-2",
  STM32: "text-chart-4",
};

export function DeviceStatus({ devices }: { devices: DeviceInfo[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          Thiết bị LoRa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className={`status-dot ${
              device.status === "online" ? "status-online" :
              device.status === "warning" ? "status-warning" : "status-offline"
            }`} />

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{device.name}</div>
              <div className="text-xs text-muted-foreground truncate">{device.location}</div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1" title={device.mcu}>
                <Cpu className={`w-3.5 h-3.5 ${mcuColor[device.mcu]}`} />
                <span className="font-mono text-[11px] hidden sm:inline">{device.mcu}</span>
              </div>
              <RssiBar rssi={device.rssi} />
              <div className="flex items-center gap-1">
                <Battery className={`w-3.5 h-3.5 ${device.battery < 25 ? "text-destructive" : "text-muted-foreground"}`} />
                <span className="font-mono text-[11px]">{device.battery}%</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <Signal className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">SF{device.spreadingFactor}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
