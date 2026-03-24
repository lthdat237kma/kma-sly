import { ActuatorControl } from "@/components/ActuatorControl";
import { DeviceStatus } from "@/components/DeviceStatus";
import { HistoryChart } from "@/components/HistoryChart";
import { NetworkStats } from "@/components/NetworkStats";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SensorCard } from "@/components/SensorCard";
import { useLatestSensorData, useHistoryData, useDevices, useActuators } from "@/hooks/useIoTData";
import { Loader2 } from "lucide-react";

// Fallback mock data when DB is empty
const mockSensors = [
  { id: "temp", name: "Nhiệt độ (DHT11)", value: 27.4, unit: "°C", icon: "Thermometer", min: 0, max: 50, status: "normal" as const, trend: [25.1, 25.8, 26.2, 26.9, 27.1, 27.4, 27.2, 27.4] },
  { id: "humidity", name: "Độ ẩm KK (DHT11)", value: 68, unit: "%", icon: "Droplets", min: 20, max: 90, status: "normal" as const, trend: [65, 66, 67, 68, 69, 68, 67, 68] },
  { id: "soil", name: "Độ ẩm đất", value: 35, unit: "%", icon: "Leaf", min: 0, max: 100, status: "warning" as const, trend: [42, 40, 39, 38, 37, 36, 35, 35] },
];

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

  // Build sensor cards from live data or fallback
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
    : mockSensors;

  // Build history chart data
  const chartData = history.length > 0
    ? history.map((r) => ({
        time: new Date(r.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        temperature: r.temperature ?? 0,
        humidity: r.humidity ?? 0,
        soilMoisture: r.soil_moisture ?? 0,
      }))
    : Array.from({ length: 24 }, (_, i) => ({
        time: `${String(i).padStart(2, "0")}:00`,
        temperature: 22 + Math.sin(i / 4) * 5 + Math.random() * 2,
        humidity: 60 + Math.cos(i / 6) * 15 + Math.random() * 5,
        soilMoisture: 40 + Math.sin(i / 5) * 12 + Math.random() * 5,
      }));

  // Map DB devices to component format
  const deviceList = devices.length > 0
    ? devices.map((d) => ({
        id: d.id, name: d.name, location: d.location || "",
        status: d.status as "online" | "offline" | "warning",
        rssi: d.rssi ?? -120, snr: d.snr ?? 0, battery: d.battery ?? 0,
        lastSeen: d.last_seen ? new Date(d.last_seen).toLocaleString("vi-VN") : "N/A",
        spreadingFactor: d.spreading_factor ?? 7,
        mcu: (d.mcu || "ESP32") as "ESP32" | "STM32",
      }))
    : [
        { id: "dev-001", name: "ESP32 - Node cảm biến", location: "Khu vực A", status: "online" as const, rssi: -65, snr: 9.5, battery: 87, lastSeen: "Chưa có dữ liệu", spreadingFactor: 7, mcu: "ESP32" as const },
        { id: "dev-002", name: "STM32 - Bộ điều khiển", location: "Nhà kính B", status: "offline" as const, rssi: -78, snr: 7.1, battery: 92, lastSeen: "Chưa có dữ liệu", spreadingFactor: 9, mcu: "STM32" as const },
      ];

  // Map actuators from DB
  const actuatorData = actuators.length > 0
    ? actuators.map((a) => ({
        id: a.actuator_id,
        name: a.actuator_id === "pump" ? "Máy bơm nước" : "Servo Motor",
        icon: a.actuator_id === "pump" ? "Waves" : "Settings",
        isOn: a.is_on,
        mode: a.mode as "manual" | "auto",
        autoCondition: a.actuator_id === "pump" ? "Bật khi độ ẩm đất < 30%" : "Bật khi nhiệt độ > 35°C",
      }))
    : [
        { id: "pump", name: "Máy bơm nước", icon: "Waves", isOn: false, mode: "manual" as const, autoCondition: "Bật khi độ ẩm đất < 30%" },
        { id: "servo", name: "Servo Motor", icon: "Settings", isOn: false, mode: "manual" as const, autoCondition: "Bật khi nhiệt độ > 35°C" },
      ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {sensorCards.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HistoryChart data={chartData} />
        </div>
        <div className="space-y-4">
          <DeviceStatus devices={deviceList} />
          <NetworkStats />
        </div>
      </div>
    </div>
  );
};

export default Index;
