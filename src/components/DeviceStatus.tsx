import { DeviceInfo } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Battery, Signal, Wifi } from "lucide-react";

const statusLabel = {
  online: "Trực tuyến",
  offline: "Ngoại tuyến",
  warning: "Cảnh báo",
};

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
              <div className="flex items-center gap-1" title={`RSSI: ${device.rssi} dBm`}>
                <RssiBar rssi={device.rssi} />
              </div>

              <div className="flex items-center gap-1" title={`Pin: ${device.battery}%`}>
                <Battery className={`w-3.5 h-3.5 ${device.battery < 25 ? "text-destructive" : "text-muted-foreground"}`} />
                <span className="font-mono text-[11px]">{device.battery}%</span>
              </div>

              <div className="hidden sm:flex items-center gap-1" title={`SF${device.spreadingFactor}`}>
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
