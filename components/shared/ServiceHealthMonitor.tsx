import React, { useState, useEffect } from "react";
import { videoGenerationService } from "../../services/videoGenerationService";
import { fallbackChainService } from "../../services/fallbackChainService";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";

interface ServiceHealthMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceHealthMonitor: React.FC<ServiceHealthMonitorProps> = ({
  isOpen,
  onClose,
}) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      loadHealthData();
    }
  }, [isOpen]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const health = await videoGenerationService.getServiceHealth();
      setHealthData(health);
    } catch (error) {
      console.error("Failed to load health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const testTTSProviders = async () => {
    setLoading(true);
    try {
      const results = await videoGenerationService.testTTSProviders();
      setTestResults(results);
    } catch (error) {
      console.error("TTS testing failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (available: boolean) => {
    return available ? (
      <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-400" />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-slate-800 border border-white/20 rounded-3xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Service Health Monitor
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XCircleIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full" />
                <span className="ml-3 text-white">
                  Loading service status...
                </span>
              </div>
            ) : healthData ? (
              <div className="space-y-8">
                {/* TTS Services */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    🎙️ Text-to-Speech Services
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                      onClick={testTTSProviders}
                    >
                      Test All
                    </Button>
                  </h3>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="space-y-4">
                      {healthData.tts.providers?.map((provider: any) => (
                        <div
                          key={provider.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(provider.available)}
                            <div>
                              <p className="font-medium text-white">
                                {provider.name}
                              </p>
                              <p className="text-sm text-slate-400">
                                Priority: {provider.priority} | Failures:{" "}
                                {provider.failureCount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {provider.id === healthData.tts.activeProvider && (
                              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                Active
                              </span>
                            )}
                            {testResults[provider.id] !== undefined && (
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  testResults[provider.id]
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {testResults[provider.id]
                                  ? "Test Pass"
                                  : "Test Fail"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Video Services */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    🎬 Video Generation Services
                  </h3>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="space-y-4">
                      {healthData.video.providers?.map((provider: any) => (
                        <div
                          key={provider.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(provider.available)}
                            <div>
                              <p className="font-medium text-white">
                                {provider.name}
                              </p>
                              <p className="text-sm text-slate-400">
                                Priority: {provider.priority} | Failures:{" "}
                                {provider.failureCount}
                              </p>
                            </div>
                          </div>
                          {provider.id === healthData.video.activeProvider && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resource Usage */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    📊 Resource Usage
                  </h3>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-slate-400 text-sm">
                          Total Resources
                        </p>
                        <p className="text-white text-2xl font-bold">
                          {healthData.resources.totalResources}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Memory Usage</p>
                        <p className="text-white text-2xl font-bold">
                          {(
                            healthData.resources.totalMemoryUsage /
                            1024 /
                            1024
                          ).toFixed(1)}{" "}
                          MB
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-slate-400 text-sm mb-2">
                        Memory Pressure
                      </p>
                      <div
                        className={`px-3 py-1 rounded-full text-sm inline-block ${
                          healthData.resources.memoryPressure === "low"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : healthData.resources.memoryPressure === "medium"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {healthData.resources.memoryPressure.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {healthData.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      💡 Recommendations
                    </h3>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                      <ul className="space-y-2">
                        {healthData.recommendations.map(
                          (rec: string, index: number) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-amber-200"
                            >
                              <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">
                  Failed to load service health data
                </p>
                <Button
                  variant="gradient"
                  onClick={loadHealthData}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white/5 border-t border-white/10 px-8 py-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={loadHealthData}
              leftIcon={<ArrowPathIcon className="h-4 w-4" />}
            >
              Refresh
            </Button>
            <Button variant="gradient" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHealthMonitor;
