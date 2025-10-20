import { useState, useEffect } from "react";
import { Plus, Filter, RefreshCw, Loader, Webhook } from "lucide-react";
import { companiesAPI, webhookAPI } from "../api/client";
import LeadCard from "../components/LeadCard";
import OnboardingWizard from "../components/OnboardingWizard";
import WebhookSetup from "../components/WebhookSetup";

function Dashboard() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        tier: "",
        stage: "",
        persona_match: "",
    });
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [generatingDemo, setGeneratingDemo] = useState(false);
    const [showWebhookSetup, setShowWebhookSetup] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, [filters]);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const response = await companiesAPI.getAll(filters);
            setCompanies(response.data.companies || []);

            // Only show onboarding if no companies AND no filters applied
            const hasFilters =
                filters.tier || filters.stage || filters.persona_match;
            if (response.data.companies.length === 0 && !hasFilters) {
                setShowOnboarding(true);
            } else if (response.data.companies.length > 0) {
                setShowOnboarding(false);
            }
        } catch (error) {
            console.error("Error loading companies:", error);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    const generateDemoLead = async () => {
        setGeneratingDemo(true);
        try {
            const demoWebhook = {
                id: `demo-${Date.now()}`,
                company_domain: [
                    "stripe.com",
                    "shopify.com",
                    "atlassian.com",
                    "hubspot.com",
                    "salesforce.com",
                ][Math.floor(Math.random() * 5)],
                company_name: [
                    "Stripe",
                    "Shopify",
                    "Atlassian",
                    "HubSpot",
                    "Salesforce",
                ][Math.floor(Math.random() * 5)],
                contact_name: "John Smith",
                contact_email: "john.smith@company.com",
                contact_title: [
                    "VP Engineering",
                    "CTO",
                    "Engineering Manager",
                    "DevOps Lead",
                ][Math.floor(Math.random() * 4)],
                visited_pages: [
                    { path: "/pricing", timestamp: new Date().toISOString() },
                    { path: "/features", timestamp: new Date().toISOString() },
                    {
                        path: "/documentation",
                        timestamp: new Date().toISOString(),
                    },
                    {
                        path: "/integrations",
                        timestamp: new Date().toISOString(),
                    },
                ],
            };

            await webhookAPI.sendTest(demoWebhook);

            // Wait a bit for processing
            setTimeout(() => {
                loadCompanies();
                setGeneratingDemo(false);
            }, 3000);
        } catch (error) {
            console.error("Error generating demo lead:", error);
            setGeneratingDemo(false);
        }
    };

    if (showOnboarding && companies.length === 0 && !loading) {
        return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />;
    }

    return (
        <div>
            {showWebhookSetup && (
                <WebhookSetup onClose={() => setShowWebhookSetup(false)} />
            )}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Company Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Actionable companies from your RB2B data
                    </p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowWebhookSetup(true)}
                        className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                        <Webhook className="h-4 w-4" />
                        <span>Webhook Setup</span>
                    </button>
                    <button
                        onClick={loadCompanies}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={generateDemoLead}
                        disabled={generatingDemo}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {generatingDemo ? (
                            <>
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                <span>Generate Demo Lead</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={filters.tier}
                        onChange={(e) =>
                            setFilters({ ...filters, tier: e.target.value })
                        }
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="">All Tiers</option>
                        <option value="A">Tier A</option>
                        <option value="B">Tier B</option>
                        <option value="C">Tier C</option>
                        <option value="D">Tier D</option>
                    </select>
                    <select
                        value={filters.stage}
                        onChange={(e) =>
                            setFilters({ ...filters, stage: e.target.value })
                        }
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="">All Stages</option>
                        <option value="Educate">Educate</option>
                        <option value="Explore">Explore</option>
                        <option value="Evaluate">Evaluate</option>
                        <option value="Purchase">Purchase</option>
                    </select>
                    <select
                        value={filters.persona_match}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                persona_match: e.target.value,
                            })
                        }
                        className="px-3 py-2 border rounded-lg text-sm"
                    >
                        <option value="">All Matches</option>
                        <option value="true">Persona Match</option>
                        <option value="false">Needs LinkedIn Search</option>
                    </select>
                </div>
            </div>

            {/* Companies List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : companies.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                        {filters.tier || filters.stage || filters.persona_match
                            ? "No companies match your current filters. Try adjusting the filters above."
                            : "No companies yet. Generate a demo company to get started!"}
                    </p>
                    {(filters.tier ||
                        filters.stage ||
                        filters.persona_match) && (
                        <button
                            onClick={() =>
                                setFilters({
                                    tier: "",
                                    stage: "",
                                    persona_match: "",
                                })
                            }
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {companies.map((company) => (
                        <LeadCard key={company.id} lead={company} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
