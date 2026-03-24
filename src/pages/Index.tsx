import { DashboardHeader } from "@/components/DashboardHeader";
import { SensorCard } from "@/components/SensorCard";
import { ActuatorControl } from "@/components/ActuatorControl";
import { DeviceStatus } from "@/components/DeviceStatus";
import { HistoryChart } from "@/components/HistoryChart";
import { NetworkStats } from "@/components/NetworkStats";
import { sensors, actuators, devices, historyData } from "@/lib/mockData";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <DashboardHeader />

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>

      {/* Actuator Controls */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Điều khiển thiết bị
        </h2>
        <ActuatorControl actuators={actuators} />
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
