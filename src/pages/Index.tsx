import { useState, useCallback, useEffect } from "react";
import { ActuatorControl } from "@/components/ActuatorControl";
import { DeviceStatus } from "@/components/DeviceStatus";
import { HistoryChart } from "@/components/HistoryChart";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SensorCard } from "@/components/SensorCard";
import { ConnectionInfo } from "@/components/ConnectionInfo";
import { useLatestSensorData, useHistoryData, useDevices, useActuators } from "@/hooks/useIoTData";
import { Loader2, DatabaseZap, Wifi } from "lucide-react";
import { toast } from "sonner";

function getSensorStatus(id: string, value: number): "normal" | "warning" | "danger" {
  if (id === "temp" && value > 38) return "danger";
  if (id === "temp" && value > 33) return "warning";
  if (id === "soil" && value < 25) return "danger";
  if (id === "soil" && value < 35) return "warning";
  return "normal";
}

function buildSensorCards(reading: { device_id: string; temperature: number | null; humidity: number | null; soil_moisture: number | null }, history: { temperature: number | null; humidity: number | null; soil_moisture: number | null }[]) {
  return [
    {
      id: `temp-${reading.device_id}`, name: "Nhiệt độ (DHT11)",
      value: reading.temperature ?? 0, unit: "°C", icon: "Thermometer",
      min: 0, max: 50,
      status: getSensorStatus("temp", reading.temperature ?? 0),
      trend: history.slice(-8).map((h) => h.temperature ?? 0),
    },
    {
      id: `humidity-${reading.device_id}`, name: "Độ ẩm KK (DHT11)",
      value: reading.humidity ?? 0, unit: "%", icon: "Droplets",
      min: 20, max: 90,
      status: "normal" as const,
      trend: history.slice(-8).map((h) => h.humidity ?? 0),
    },
    {
      id: `soil-${reading.device_id}`, name: "Độ ẩm đất",
      value: reading.soil_moisture ?? 0, unit: "%", icon: "Leaf",
      min: 0, max: 100,
      status: getSensorStatus("soil", reading.soil_moisture ?? 0),
      trend: history.slice(-8).map((h) => h.soil_moisture ?? 0),
    },
  ];
}

const Index = () => {
  const [disconnected, setDisconnected] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleNewData = useCallback(() => {
    setDisconnected((prev) => {
      if (prev) {
        toast.success("Thiết bị đã kết nối! Đang hiển thị dữ liệu...");
        return false;
      }
      return prev;
    });
  }, []);

  const { readings, loading } = useLatestSensorData(handleNewData);
  const history = useHistoryData();
  const devices = useDevices(handleNewData);
  const { actuators, toggleActuator, setMode } = useActuators();

  const chartData = history.map((r) => ({
    time: new Date(r.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    temperature: r.temperature ?? 0,
    humidity: r.humidity ?? 0,
    soilMoisture: r.soil_moisture ?? 0,
  }));

  const deviceList = devices.map((d) => ({
    id: d.id, name: d.name, location: d.location || "",
    status: d.status as "online" | "offline" | "warning",
    rssi: d.rssi ?? -120, snr: d.snr ?? 0, battery: d.battery ?? 0,
    lastSeen: d.last_seen ? new Date(d.last_seen).toLocaleString("vi-VN") : "N/A",
    spreadingFactor: d.spreading_factor ?? 7,
    mcu: (d.mcu || "ESP32") as "ESP32" | "STM32",
  }));

  const actuatorData = actuators.map((a) => ({
    id: a.actuator_id,
    name: a.actuator_id === "pump" ? "Máy bơm nước (Node 1)"
      : a.actuator_id === "pump2" ? "Máy bơm nước (Node 2)"
      : a.actuator_id === "servo" ? "Servo Motor (Node 1)"
      : a.actuator_id === "servo2" ? "Servo Motor (Node 2)"
      : a.actuator_id,
    icon: a.actuator_id.startsWith("pump") ? "Waves" : "Settings",
    isOn: a.is_on,
    mode: a.mode as "manual" | "auto",
    autoCondition: a.actuator_id.startsWith("pump") ? "Bật khi độ ẩm đất < 30%" : "Bật khi nhiệt độ > 35°C",
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const noData = readings.length === 0 && deviceList.length === 0 && actuatorData.length === 0 && chartData.length === 0;
  const showDisconnected = disconnected || noData;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader
        isDisconnected={showDisconnected}
        onDisconnect={() => setDisconnected(true)}
      />

      {showDisconnected ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-6">
            {disconnected ? (
              <Wifi className="w-12 h-12 text-muted-foreground" />
            ) : (
              <DatabaseZap className="w-12 h-12 text-primary" />
            )}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {disconnected ? "Đã ngắt kết nối" : "Kết nối với thiết bị"}
          </h2>
          <p className="text-sm text-muted-foreground mb-2 text-center max-w-md">
            {disconnected
              ? "Dashboard đang ở chế độ chờ. Khi thiết bị gửi dữ liệu mới, giao diện sẽ tự động chuyển về chế độ giám sát."
              : "Chưa có thiết bị nào được kết nối. Sử dụng thông tin API bên dưới để kết nối ESP32/STM32 của bạn."}
          </p>
          {disconnected && (
            <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-chart-4 animate-pulse" />
              Đang lắng nghe dữ liệu từ thiết bị...
            </p>
          )}
          <div className="w-full max-w-2xl">
            <ConnectionInfo defaultExpanded />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <ConnectionInfo />
          </div>

          {/* Node selector */}
          <div className="flex gap-3 mb-6">
            {deviceList.map((device) => (
              <button
                key={device.id}
                onClick={() => setSelectedNode(device.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  selectedNode === device.id
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-secondary text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${device.status === "online" ? "bg-chart-2" : "bg-muted-foreground"}`} />
                {device.name}
              </button>
            ))}
          </div>

          {/* Auto-select first node */}
          {deviceList.length > 0 && !selectedNode && (() => { setSelectedNode(deviceList[0].id); return null; })()}

          {/* Selected node data */}
          {selectedNode && (() => {
            const reading = readings.find((r) => r.device_id === selectedNode);
            const deviceHistory = history.filter((h) => h.device_id === selectedNode);
            const deviceName = devices.find((d) => d.id === selectedNode)?.name || selectedNode;
            const nodeActuators = actuatorData.filter((a) => {
              if (selectedNode === deviceList[0]?.id) return !a.id.endsWith("2");
              if (selectedNode === deviceList[1]?.id) return a.id.endsWith("2");
              return false;
            });

            const cards = reading ? buildSensorCards(reading, deviceHistory) : [];
            const nodeChartData = deviceHistory.map((r) => ({
              time: new Date(r.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              temperature: r.temperature ?? 0,
              humidity: r.humidity ?? 0,
              soilMoisture: r.soil_moisture ?? 0,
            }));

            return (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-2" />
                  {deviceName}
                </h2>

                {cards.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {cards.map((sensor) => (
                      <SensorCard key={sensor.id} sensor={sensor} />
                    ))}
                  </div>
                )}

                {nodeActuators.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Điều khiển thiết bị
                    </h2>
                    <ActuatorControl
                      actuators={nodeActuators}
                      onToggle={toggleActuator}
                      onModeChange={setMode}
                    />
                  </div>
                )}

                {nodeChartData.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <HistoryChart data={nodeChartData} />
                    <DeviceStatus devices={deviceList.filter((d) => d.id === selectedNode)} />
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default Index;