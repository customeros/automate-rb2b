import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Settings, Home, Activity } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import ICPConfig from "./pages/ICPConfig";
import LeadDetail from "./pages/LeadDetail";
import HealthCheck from "./components/HealthCheck";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Activity className="h-8 w-8 text-blue-600" />
                                    <span className="ml-2 text-xl font-bold text-gray-900">
                                        RB2B Lead Actionability
                                    </span>
                                </div>
                                <div className="ml-10 flex space-x-8">
                                    <Link
                                        to="/"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                        <Home className="h-4 w-4 mr-1" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/config"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                                    >
                                        <Settings className="h-4 w-4 mr-1" />
                                        ICP Config
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <HealthCheck />
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/config" element={<ICPConfig />} />
                        <Route path="/companies/:id" element={<LeadDetail />} />
                        {/* Legacy route for backward compatibility */}
                        <Route path="/leads/:id" element={<LeadDetail />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
