export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  icon: string;
  min: number;
  max: number;
  status: "normal" | "warning" | "danger";
  trend: number[];
}

export interface DeviceInfo {
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

export interface ActuatorData {
  id: string;
  name: string;
  icon: string;
  isOn: boolean;
  mode: "manual" | "auto";
  autoCondition?: string;
}

export interface HistoryPoint {
  time: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
}

export const sensors: SensorData[] = [
  {
    id: "temp",
    name: "Nhiệt độ (DHT11)",
    value: 27.4,
    unit: "°C",
    icon: "Thermometer",
    min: 0,
    max: 50,
    status: "normal",
    trend: [25.1, 25.8, 26.2, 26.9, 27.1, 27.4, 27.2, 27.4],
  },
  {
    id: "humidity",
    name: "Độ ẩm KK (DHT11)",
    value: 68,
    unit: "%",
    icon: "Droplets",
    min: 20,
    max: 90,
    status: "normal",
    trend: [65, 66, 67, 68, 69, 68, 67, 68],
  },
  {
    id: "soil",
    name: "Độ ẩm đất",
    value: 35,
    unit: "%",
    icon: "Leaf",
    min: 0,
    max: 100,
    status: "warning",
    trend: [42, 40, 39, 38, 37, 36, 35, 35],
  },
];

export const actuators: ActuatorData[] = [
  {
    id: "pump",
    name: "Máy bơm nước",
    icon: "Waves",
    isOn: false,
    mode: "manual",
    autoCondition: "Bật khi độ ẩm đất < 30%",
  },
  {
    id: "servo",
    name: "Servo Motor",
    icon: "Settings",
    isOn: false,
    mode: "manual",
    autoCondition: "Bật khi nhiệt độ > 35°C",
  },
];

export const devices: DeviceInfo[] = [
  {
    id: "dev-001",
    name: "ESP32 - Node cảm biến",
    location: "Khu vực A - Ngoài trời",
    status: "online",
    rssi: -65,
    snr: 9.5,
    battery: 87,
    lastSeen: "2 phút trước",
    spreadingFactor: 7,
    mcu: "ESP32",
  },
  {
    id: "dev-002",
    name: "STM32 - Bộ điều khiển",
    location: "Nhà kính B",
    status: "online",
    rssi: -78,
    snr: 7.1,
    battery: 92,
    lastSeen: "1 phút trước",
    spreadingFactor: 9,
    mcu: "STM32",
  },
  {
    id: "dev-003",
    name: "ESP32 - Node phụ",
    location: "Cánh đồng C",
    status: "warning",
    rssi: -105,
    snr: 2.1,
    battery: 22,
    lastSeen: "18 phút trước",
    spreadingFactor: 12,
    mcu: "ESP32",
  },
];

export const historyData: HistoryPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  temperature: 22 + Math.sin(i / 4) * 5 + Math.random() * 2,
  humidity: 60 + Math.cos(i / 6) * 15 + Math.random() * 5,
  soilMoisture: 40 + Math.sin(i / 5) * 12 + Math.random() * 5,
}));
