import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { configAPI, webhookAPI } from "../api/client";

function OnboardingWizard({ onComplete }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const useDemoConfig = async () => {
        setLoading(true);
        try {
            const demoConfig = {
                name: "Demo ICP",
                industries: ["SaaS", "Technology", "E-commerce"],
                company_size_min: 50,
                company_size_max: 500,
                regions: ["North America", "Europe"],
                target_job_titles: [
                    "VP Engineering",
                    "CTO",
                    "Engineering Manager",
                    "DevOps Lead",
                    "Platform Engineer",
                ],
                tech_stack: ["AWS", "Kubernetes", "Docker", "React"],
                pain_points: [
                    "Testing complexity",
                    "CI/CD bottlenecks",
                    "Quality assurance",
                ],
            };

            await configAPI.saveICP(demoConfig);

            // Generate a demo lead
            const demoWebhook = {
                id: `demo-${Date.now()}`,
                company_domain: "stripe.com",
                company_name: "Stripe",
                contact_name: "Sarah Johnson",
                contact_email: "sarah.johnson@stripe.com",
                contact_title: "VP Engineering",
                visited_pages: [
                    { path: "/features", timestamp: new Date().toISOString() },
                    { path: "/pricing", timestamp: new Date().toISOString() },
                    {
                        path: "/documentation/getting-started",
                        timestamp: new Date().toISOString(),
                    },
                    {
                        path: "/integrations",
                        timestamp: new Date().toISOString(),
                    },
                ],
            };

            await webhookAPI.sendTest(demoWebhook);

            setTimeout(() => {
                onComplete();
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Error setting up demo:", error);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome to RB2B Lead Actionability!
                    </h2>
                    <p className="text-gray-600">
                        Let's get you set up to start processing leads
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            What this tool does:
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>
                                    Receives RB2B webhooks and scores companies
                                    against your ICP
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>
                                    Identifies buyer personas from website
                                    behavior
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>
                                    Finds additional contacts via LinkedIn if
                                    needed
                                </span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">✓</span>
                                <span>
                                    Generates personalized outreach emails based
                                    on buying stage
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Prerequisites:
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                            <li>
                                • Ollama installed and running (download from
                                ollama.ai)
                            </li>
                            <li>
                                • llama3 model pulled (run: ollama pull llama3)
                            </li>
                        </ul>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={useDemoConfig}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? (
                                <span>Setting up...</span>
                            ) : (
                                <>
                                    <span>Use Demo Configuration</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate("/config")}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Configure Manually
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OnboardingWizard;

