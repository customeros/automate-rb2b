import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Loader,
    Building2,
    User,
    Clock,
    Mail,
    ExternalLink,
    Search,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { companiesAPI } from "../api/client";
import ScoreGauge from "../components/ScoreGauge";
import EmailPreview from "../components/EmailPreview";

function LeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrapingLinkedIn, setScrapingLinkedIn] = useState(false);
    const [expandedContacts, setExpandedContacts] = useState(new Set());

    useEffect(() => {
        loadCompanyDetails();
    }, [id]);

    const loadCompanyDetails = async () => {
        try {
            setLoading(true);
            const response = await companiesAPI.getById(id);
            setCompany(response.data.company);
            setContacts(response.data.company.contacts || []);
            setEmails(response.data.emails || []);
        } catch (error) {
            console.error("Error loading company details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScrapeLinkedIn = async () => {
        setScrapingLinkedIn(true);
        try {
            const response = await companiesAPI.scrapeLinkedIn(id);

            if (response.data.success) {
                const count = response.data.contacts?.length || 0;
                alert(
                    `✅ Success! Found ${count} matching contact${
                        count !== 1 ? "s" : ""
                    } on LinkedIn.\n\n${response.data.message || ""}`
                );
                await loadCompanyDetails();
            } else {
                alert(
                    `❌ Error: ${response.data.error || "Unknown error"}\n\n${
                        response.data.details || ""
                    }`
                );
            }
        } catch (error) {
            console.error("Error scraping LinkedIn:", error);
            const errorMsg =
                error.response?.data?.error || error.message || "Unknown error";
            const details = error.response?.data?.details || "";
            alert(
                `❌ LinkedIn Search Failed\n\n${errorMsg}\n\n${details}\n\nTip: Make sure you're logged into LinkedIn in the browser window.`
            );
        } finally {
            setScrapingLinkedIn(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!company) {
        return <div>Company not found</div>;
    }

    // Get primary contact (original contact from webhook)
    const primaryContact =
        contacts.find((c) => c.contact_type === "original") || {};
    // Get enriched contacts (from LinkedIn)
    const enrichedContacts = contacts.filter(
        (c) => c.contact_type === "enriched"
    );

    const toggleContactExpanded = (contactId) => {
        setExpandedContacts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(contactId)) {
                newSet.delete(contactId);
            } else {
                newSet.add(contactId);
            }
            return newSet;
        });
    };

    const getStageColor = (stage) => {
        switch (stage) {
            case "Educate":
                return "bg-blue-100 text-blue-800";
            case "Explore":
                return "bg-purple-100 text-purple-800";
            case "Evaluate":
                return "bg-orange-100 text-orange-800";
            case "Purchase":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div>
            <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
            </button>

            {/* Company Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                            <Building2 className="h-6 w-6 text-gray-400" />
                            <h1 className="text-2xl font-bold text-gray-900">
                                {company.company_name || company.company_domain}
                            </h1>
                        </div>
                        <p className="text-gray-600 mb-4">
                            {company.company_domain}
                        </p>

                        <div className="flex items-center space-x-6 text-sm">
                            <div>
                                <span className="text-gray-500">
                                    Buying Stage:{" "}
                                </span>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStageColor(
                                        company.buying_stage
                                    )}`}
                                >
                                    {company.buying_stage}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">
                                    Intent Score:{" "}
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {company.intent_score} / 3
                                </span>
                            </div>
                        </div>
                    </div>
                    <ScoreGauge
                        score={company.icp_score}
                        tier={company.icp_tier}
                    />
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            ICP Fit Analysis
                        </h3>
                        <p className="text-sm text-gray-700">
                            {company.icp_explanation}
                        </p>
                    </div>
                    {company.buying_stage_explanation && (
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Buying Stage Analysis
                            </h3>
                            <p className="text-sm text-gray-700">
                                {company.buying_stage_explanation}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Contacts Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Contacts {contacts.length > 0 && `(${contacts.length})`}
                    </h2>
                    <button
                        onClick={handleScrapeLinkedIn}
                        disabled={scrapingLinkedIn}
                        className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {scrapingLinkedIn ? (
                            <>
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Searching LinkedIn...</span>
                            </>
                        ) : (
                            <>
                                <Search className="h-4 w-4" />
                                <span>Find More Contacts on LinkedIn</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-4">
                    {contacts.map((contact) => {
                        const isOriginal = contact.contact_type === "original";
                        const contactEmail = emails.find(
                            (e) => e.contact_id === contact.id
                        );
                        const isExpanded = expandedContacts.has(contact.id);

                        // For original contacts, show company visited pages
                        // For enriched contacts, they don't have visited pages
                        const contactPages = isOriginal
                            ? company.visited_pages
                            : [];

                        return (
                            <div
                                key={contact.id}
                                className="bg-white rounded-lg shadow-sm border overflow-hidden"
                            >
                                {/* Contact Header - Always Visible */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() =>
                                        toggleContactExpanded(contact.id)
                                    }
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <User className="h-5 w-5 text-gray-400" />
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {contact.contact_name ||
                                                        "Unknown"}
                                                </h3>
                                                {isOriginal && (
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                                                        Original Visitor
                                                    </span>
                                                )}
                                            </div>

                                            <div className="ml-8 space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    {contact.contact_title ||
                                                        "No title"}
                                                </p>

                                                {contact.contact_email && (
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <Mail className="h-3 w-3 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {
                                                                contact.contact_email
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-8 mt-3 flex items-center space-x-3">
                                                <span className="text-xs text-gray-500">
                                                    {contact.persona ||
                                                        "Unknown Persona"}
                                                    {contact.persona_confidence && (
                                                        <span className="text-gray-400">
                                                            {" "}
                                                            (
                                                            {(
                                                                contact.persona_confidence *
                                                                100
                                                            ).toFixed(0)}
                                                            %)
                                                        </span>
                                                    )}
                                                </span>

                                                {contact.is_persona_match ? (
                                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                                                        ✓ Persona Match
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full font-medium">
                                                        Not a Match
                                                    </span>
                                                )}

                                                {contact.persona_fit_score && (
                                                    <span className="text-xs font-semibold text-blue-600">
                                                        {(
                                                            contact.persona_fit_score *
                                                            100
                                                        ).toFixed(0)}
                                                        % fit
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {contactEmail && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    ✉️ Email Ready
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t bg-gray-50">
                                        <div className="p-5 space-y-4">
                                            {/* Persona Reasoning */}
                                            {contact.persona_reasoning && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                        Persona Analysis
                                                    </h4>
                                                    <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                                                        {
                                                            contact.persona_reasoning
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {/* Visited Pages - Only for original contact */}
                                            {isOriginal &&
                                                contactPages &&
                                                contactPages.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                            Visitor Journey (
                                                            {
                                                                contactPages.length
                                                            }{" "}
                                                            pages)
                                                        </h4>
                                                        <div className="space-y-1 max-h-48 overflow-y-auto">
                                                            {contactPages.map(
                                                                (
                                                                    page,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center space-x-2 p-2 bg-white rounded text-xs"
                                                                    >
                                                                        <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                                                        <span className="flex-1 text-gray-900 truncate">
                                                                            {page.page_path ||
                                                                                page.path ||
                                                                                page}
                                                                        </span>
                                                                        {(page.visited_at ||
                                                                            page.timestamp) && (
                                                                            <span className="text-gray-500 flex-shrink-0">
                                                                                {new Date(
                                                                                    page.visited_at ||
                                                                                        page.timestamp
                                                                                ).toLocaleString(
                                                                                    "en-US",
                                                                                    {
                                                                                        month: "short",
                                                                                        day: "numeric",
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                    }
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Generated Email */}
                                            {contactEmail && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                        Generated Outreach Email
                                                    </h4>
                                                    <div className="bg-white rounded border">
                                                        <EmailPreview
                                                            email={contactEmail}
                                                            contactName={
                                                                contact.contact_name
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* LinkedIn Profile Link */}
                                            {contact.profile_url && (
                                                <div className="pt-3 border-t">
                                                    <a
                                                        href={
                                                            contact.profile_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span>
                                                            View LinkedIn
                                                            Profile
                                                        </span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {contacts.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No contacts found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeadDetail;
