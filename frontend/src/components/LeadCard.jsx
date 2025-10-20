import { useNavigate } from "react-router-dom";
import { Building2, User, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import ScoreGauge from "./ScoreGauge";

function LeadCard({ lead }) {
    const navigate = useNavigate();

    // Support both company-based and legacy lead-based data structures
    const company = lead;
    const primaryContact = company.primary_contact || {};
    const stats = company.contact_stats || {
        total_contacts: 0,
        matched_contacts: 0,
        enriched_contacts: 0,
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
        <div
            onClick={() => navigate(`/companies/${company.id}`)}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {company.company_name || company.company_domain}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {company.company_domain}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-8">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(
                                company.buying_stage
                            )}`}
                        >
                            {company.buying_stage}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>Intent: {company.intent_score}/3</span>
                        </div>
                    </div>
                </div>

                <div className="ml-6">
                    <ScoreGauge
                        score={company.icp_score}
                        tier={company.icp_tier}
                    />
                </div>
            </div>

            {/* Contacts Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">
                            Total Contacts
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                        {stats.total_contacts}
                    </p>
                </div>

                <div className="bg-green-50 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-500">
                            Persona Match
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                        {stats.matched_contacts}
                    </p>
                </div>

                <div className="bg-blue-50 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-500">
                            From LinkedIn
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                        {stats.enriched_contacts}
                    </p>
                </div>
            </div>

            {/* Primary Contact */}
            {primaryContact.contact_name && (
                <div className="pt-3 border-t">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                Primary Contact
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                                {primaryContact.contact_name}
                            </p>
                            <p className="text-xs text-gray-600">
                                {primaryContact.contact_title}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-gray-500">
                                {primaryContact.persona}
                            </span>
                            {primaryContact.is_persona_match && (
                                <div className="mt-1">
                                    <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                                        ✓ Match
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadCard;
