import { ActuatorControl } from "@/components/ActuatorControl";
import { DeviceStatus } from "@/components/DeviceStatus";
import { HistoryChart } from "@/components/HistoryChart";
import { NetworkStats } from "@/components/NetworkStats";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SensorCard } from "@/components/SensorCard";
import { useLatestSensorData, useHistoryData, useDevices, useActuators } from "@/hooks/useIoTData";
import { Loader2, DatabaseZap } from "lucide-react";

function getSensorStatus(id: string, value: number): "normal" | "warning" | "danger" {
  if (id === "temp" && value > 38) return "danger";
  if (id === "temp" && value > 33) return "warning";
  if (id === "soil" && value < 25) return "danger";
  if (id === "soil" && value < 35) return "warning";
  return "normal";
}

const Index = () => {
  const { readings, loading } = useLatestSensorData();
  const history = useHistoryData();
  const devices = useDevices();
  const { actuators, toggleActuator, setMode } = useActuators();

  const latestReading = readings[0];
  const sensorCards = latestReading
    ? [
        {
          id: "temp", name: "Nhiệt độ (DHT11)",
          value: latestReading.temperature ?? 0, unit: "°C", icon: "Thermometer",
          min: 0, max: 50,
          status: getSensorStatus("temp", latestReading.temperature ?? 0),
          trend: history.slice(-8).map((h) => h.temperature ?? 0),
        },
        {
          id: "humidity", name: "Độ ẩm KK (DHT11)",
          value: latestReading.humidity ?? 0, unit: "%", icon: "Droplets",
          min: 20, max: 90,
          status: "normal" as const,
          trend: history.slice(-8).map((h) => h.humidity ?? 0),
        },
        {
          id: "soil", name: "Độ ẩm đất",
          value: latestReading.soil_moisture ?? 0, unit: "%", icon: "Leaf",
          min: 0, max: 100,
          status: getSensorStatus("soil", latestReading.soil_moisture ?? 0),
          trend: history.slice(-8).map((h) => h.soil_moisture ?? 0),
        },
      ]
    : [];

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
    name: a.actuator_id === "pump" ? "Máy bơm nước" : "Servo Motor",
    icon: a.actuator_id === "pump" ? "Waves" : "Settings",
    isOn: a.is_on,
    mode: a.mode as "manual" | "auto",
    autoCondition: a.actuator_id === "pump" ? "Bật khi độ ẩm đất < 30%" : "Bật khi nhiệt độ > 35°C",
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const noData = sensorCards.length === 0 && deviceList.length === 0 && actuatorData.length === 0 && chartData.length === 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader />

      {noData && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <DatabaseZap className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Chưa có dữ liệu</p>
          <p className="text-sm mt-1">Kết nối thiết bị ESP32/STM32 để bắt đầu nhận dữ liệu cảm biến.</p>
        </div>
      )}

      {sensorCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {sensorCards.map((sensor) => (
            <SensorCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      )}

      {actuatorData.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Điều khiển thiết bị
          </h2>
          <ActuatorControl
            actuators={actuatorData}
            onToggle={toggleActuator}
            onModeChange={setMode}
          />
        </div>
      )}

      {(chartData.length > 0 || deviceList.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <HistoryChart data={chartData} />
          </div>
          <div className="space-y-4">
            <DeviceStatus devices={deviceList} />
            <NetworkStats />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
