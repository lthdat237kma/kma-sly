import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Waves, Settings, ToggleLeft } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Settings,
};

interface ActuatorItem {
  id: string;
  name: string;
  icon: string;
  isOn: boolean;
  mode: "manual" | "auto";
  autoCondition?: string;
}

interface ActuatorControlProps {
  actuators: ActuatorItem[];
  onToggle: (id: string, isOn: boolean) => Promise<void>;
  onModeChange: (id: string, mode: string) => Promise<void>;
}

export function ActuatorControl({ actuators, onToggle, onModeChange }: ActuatorControlProps) {
  const handleToggle = async (id: string, currentState: boolean) => {
    const actuator = actuators.find((a) => a.id === id);
    const newState = !currentState;
    try {
      await onToggle(id, newState);
      toast.success(`${actuator?.name} đã ${newState ? "BẬT" : "TẮT"}`);
    } catch {
      toast.error("Lỗi khi điều khiển thiết bị");
    }
  };

  const handleModeToggle = async (id: string, currentMode: string) => {
    const newMode = currentMode === "manual" ? "auto" : "manual";
    const actuator = actuators.find((a) => a.id === id);
    try {
      await onModeChange(id, newMode);
      toast.info(`${actuator?.name} → ${newMode === "auto" ? "Tự động" : "Thủ công"}`);
    } catch {
      toast.error("Lỗi khi thay đổi chế độ");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actuators.map((actuator) => {
        const Icon = iconMap[actuator.icon] || ToggleLeft;
        return (
          <Card
            key={actuator.id}
            className={`border-border/50 transition-all duration-300 ${
              actuator.isOn ? "border-primary/40 glow-primary" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2.5 rounded-lg transition-colors ${
                      actuator.isOn ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{actuator.name}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{actuator.id.toUpperCase()}</span>
                  </div>
                </div>
                <Badge
                  variant={actuator.isOn ? "default" : "secondary"}
                  className={`text-xs font-mono ${actuator.isOn ? "bg-primary/20 text-primary border-primary/30" : ""}`}
                >
                  {actuator.isOn ? "ON" : "OFF"}
                </Badge>
              </div>

              <div
                className={`h-1 rounded-full mb-4 transition-all duration-500 ${actuator.isOn ? "bg-primary" : "bg-secondary"}`}
                style={{ boxShadow: actuator.isOn ? "0 0 12px hsl(162, 100%, 42%, 0.4)" : "none" }}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nguồn</span>
                  <Switch
                    checked={actuator.isOn}
                    onCheckedChange={() => handleToggle(actuator.id, actuator.isOn)}
                    disabled={actuator.mode === "auto"}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chế độ</span>
                  <button
                    onClick={() => handleModeToggle(actuator.id, actuator.mode)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      actuator.mode === "auto"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {actuator.mode === "auto" ? "Tự động" : "Thủ công"}
                  </button>
                </div>
                {actuator.mode === "auto" && actuator.autoCondition && (
                  <p className="text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md">
                    ⚡ {actuator.autoCondition}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
