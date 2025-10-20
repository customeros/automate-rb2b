import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { healthAPI } from "../api/client";

function HealthCheck() {
    const [status, setStatus] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await healthAPI.check();
                setStatus(response.data.status);
            } catch (error) {
                setStatus({
                    backend: false,
                    database: false,
                    ollama: false,
                    icpConfigured: false,
                });
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, []);

    if (!status) return null;

    const allHealthy =
        status.backend &&
        status.database &&
        status.ollama &&
        status.icpConfigured;
    const someIssues =
        status.backend &&
        status.database &&
        (!status.ollama || !status.icpConfigured);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
                {allHealthy ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                ) : someIssues ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium">System Status</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-4 z-10">
                    <h3 className="font-semibold mb-3 text-gray-900">
                        Health Check
                    </h3>
                    <div className="space-y-2">
                        <StatusItem label="Backend" status={status.backend} />
                        <StatusItem label="Database" status={status.database} />
                        <StatusItem label="Ollama" status={status.ollama} />
                        <StatusItem
                            label="ICP Configured"
                            status={status.icpConfigured}
                        />
                    </div>
                    {!status.ollama && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                            Ollama not detected. Install from ollama.ai
                        </div>
                    )}
                    {!status.icpConfigured && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                            Configure your ICP in settings
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatusItem({ label, status }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            {status ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
                <XCircle className="h-4 w-4 text-red-500" />
            )}
        </div>
    );
}

export default HealthCheck;

