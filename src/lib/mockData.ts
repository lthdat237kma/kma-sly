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
}

export interface HistoryPoint {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  airQuality: number;
}

export const sensors: SensorData[] = [
  {
    id: "temp",
    name: "Nhiệt độ",
    value: 27.4,
    unit: "°C",
    icon: "Thermometer",
    min: -10,
    max: 50,
    status: "normal",
    trend: [25.1, 25.8, 26.2, 26.9, 27.1, 27.4, 27.2, 27.4],
  },
  {
    id: "humidity",
    name: "Độ ẩm",
    value: 68,
    unit: "%",
    icon: "Droplets",
    min: 0,
    max: 100,
    status: "normal",
    trend: [65, 66, 67, 68, 69, 68, 67, 68],
  },
  {
    id: "pressure",
    name: "Áp suất",
    value: 1013.2,
    unit: "hPa",
    icon: "Gauge",
    min: 900,
    max: 1100,
    status: "normal",
    trend: [1012.8, 1013.0, 1013.1, 1013.2, 1013.3, 1013.2, 1013.1, 1013.2],
  },
  {
    id: "aqi",
    name: "Chất lượng KK",
    value: 42,
    unit: "AQI",
    icon: "Wind",
    min: 0,
    max: 500,
    status: "normal",
    trend: [38, 40, 41, 39, 42, 43, 41, 42],
  },
  {
    id: "light",
    name: "Ánh sáng",
    value: 856,
    unit: "lux",
    icon: "Sun",
    min: 0,
    max: 10000,
    status: "normal",
    trend: [200, 450, 680, 820, 856, 840, 860, 856],
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

export const devices: DeviceInfo[] = [
  {
    id: "dev-001",
    name: "Node Trạm thời tiết",
    location: "Khu vực A - Ngoài trời",
    status: "online",
    rssi: -65,
    snr: 9.5,
    battery: 87,
    lastSeen: "2 phút trước",
    spreadingFactor: 7,
  },
  {
    id: "dev-002",
    name: "Node Nhà kính #1",
    location: "Nhà kính B",
    status: "online",
    rssi: -82,
    snr: 6.2,
    battery: 63,
    lastSeen: "5 phút trước",
    spreadingFactor: 9,
  },
  {
    id: "dev-003",
    name: "Node Kho hàng",
    location: "Kho chứa C",
    status: "warning",
    rssi: -105,
    snr: 2.1,
    battery: 22,
    lastSeen: "18 phút trước",
    spreadingFactor: 12,
  },
  {
    id: "dev-004",
    name: "Node Ngoài đồng",
    location: "Cánh đồng D",
    status: "offline",
    rssi: -120,
    snr: -3,
    battery: 5,
    lastSeen: "2 giờ trước",
    spreadingFactor: 12,
  },
];

export const historyData: HistoryPoint[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  temperature: 22 + Math.sin(i / 4) * 5 + Math.random() * 2,
  humidity: 60 + Math.cos(i / 6) * 15 + Math.random() * 5,
  pressure: 1010 + Math.sin(i / 8) * 3 + Math.random(),
  airQuality: 30 + Math.sin(i / 3) * 15 + Math.random() * 10,
}));
