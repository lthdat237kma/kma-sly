import { DashboardHeader } from "@/components/DashboardHeader";
import { SensorCard } from "@/components/SensorCard";
import { DeviceStatus } from "@/components/DeviceStatus";
import { HistoryChart } from "@/components/HistoryChart";
import { NetworkStats } from "@/components/NetworkStats";
import { sensors, devices, historyData } from "@/lib/mockData";

const Index = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader />

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>

      {/* Charts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HistoryChart data={historyData} />
        </div>
        <div className="space-y-4">
          <DeviceStatus devices={devices} />
          <NetworkStats />
        </div>
      </div>
    </div>
  );
};

export default Index;
