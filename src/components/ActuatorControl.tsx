import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Waves, Settings, ToggleLeft, Fan, Umbrella, Flame } from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Settings,
  Fan,
  Umbrella,
  Flame,
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
  const [localStates, setLocalStates] = useState<Record<string, boolean>>({});
  const [localModes, setLocalModes] = useState<Record<string, "manual" | "auto">>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nextStates: Record<string, boolean> = {};
    const nextModes: Record<string, "manual" | "auto"> = {};

    actuators.forEach((actuator) => {
      nextStates[actuator.id] = actuator.isOn;
      nextModes[actuator.id] = actuator.mode;
    });

    setLocalStates(nextStates);
    setLocalModes(nextModes);
  }, [actuators]);

  const handleToggle = async (id: string) => {
    const actuator = actuators.find((a) => a.id === id);
    if (!actuator) return;

    const currentState = localStates[id] ?? actuator.isOn;
    const currentMode = localModes[id] ?? actuator.mode;

    if (currentMode === "auto" || loadingIds[id]) return;

    const newState = !currentState;

    setLocalStates((prev) => ({
      ...prev,
      [id]: newState,
    }));

    setLoadingIds((prev) => ({
      ...prev,
      [id]: true,
    }));

    try {
      await onToggle(id, newState);
      toast.success(`${actuator.name} đã ${newState ? "BẬT" : "TẮT"}`);
    } catch {
      setLocalStates((prev) => ({
        ...prev,
        [id]: currentState,
      }));
      toast.error("Lỗi khi điều khiển thiết bị");
    } finally {
      setLoadingIds((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleModeToggle = async (id: string) => {
    const actuator = actuators.find((a) => a.id === id);
    if (!actuator || loadingIds[id]) return;

    const currentMode = localModes[id] ?? actuator.mode;
    const newMode: "manual" | "auto" = currentMode === "manual" ? "auto" : "manual";

    setLocalModes((prev) => ({
      ...prev,
      [id]: newMode,
    }));

    setLoadingIds((prev) => ({
      ...prev,
      [id]: true,
    }));

    try {
      await onModeChange(id, newMode);
      toast.info(`${actuator.name} → ${newMode === "auto" ? "Tự động" : "Thủ công"}`);
    } catch {
      setLocalModes((prev) => ({
        ...prev,
        [id]: currentMode,
      }));
      toast.error("Lỗi khi thay đổi chế độ");
    } finally {
      setLoadingIds((prev) => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {actuators.map((actuator) => {
        const Icon = iconMap[actuator.icon] || ToggleLeft;
        const isOn = localStates[actuator.id] ?? actuator.isOn;
        const mode = localModes[actuator.id] ?? actuator.mode;
        const isLoading = loadingIds[actuator.id] ?? false;

        return (
          <Card
            key={actuator.id}
            className={`border-border/50 transition-all duration-150 ${
              isOn ? "border-primary/40 glow-primary" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2.5 rounded-lg transition-colors duration-150 ${
                      isOn ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{actuator.name}</h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {actuator.id.toUpperCase()}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={isOn ? "default" : "secondary"}
                  className={`text-xs font-mono ${
                    isOn ? "bg-primary/20 text-primary border-primary/30" : ""
                  }`}
                >
                  {isOn ? "ON" : "OFF"}
                </Badge>
              </div>

              <div
                className={`h-1 rounded-full mb-4 transition-all duration-150 ${
                  isOn ? "bg-primary" : "bg-secondary"
                }`}
                style={{ boxShadow: isOn ? "0 0 12px hsl(162, 100%, 42%, 0.4)" : "none" }}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nguồn</span>
                  <Switch
                    checked={isOn}
                    onCheckedChange={() => handleToggle(actuator.id)}
                    disabled={mode === "auto" || isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Chế độ</span>
                  <button
                    onClick={() => handleModeToggle(actuator.id)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors duration-150 ${
                      mode === "auto"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-secondary text-muted-foreground border border-border"
                    } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {mode === "auto" ? "Tự động" : "Thủ công"}
                  </button>
                </div>

                {mode === "auto" && actuator.autoCondition && (
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
