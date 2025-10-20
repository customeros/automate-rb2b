import { useState, useEffect } from "react";
import { Save, Loader, CheckCircle } from "lucide-react";
import { configAPI } from "../api/client";

function ICPConfig() {
    const [config, setConfig] = useState({
        name: "",
        industries: [],
        company_size_min: 50,
        company_size_max: 500,
        regions: [],
        target_job_titles: [],
        tech_stack: [],
        pain_points: [],
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Input states for multi-value fields
    const [industryInput, setIndustryInput] = useState("");
    const [regionInput, setRegionInput] = useState("");
    const [jobTitleInput, setJobTitleInput] = useState("");
    const [techInput, setTechInput] = useState("");
    const [painPointInput, setPainPointInput] = useState("");

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await configAPI.getICP();
            if (response.data.config) {
                setConfig(response.data.config);
            }
        } catch (error) {
            console.error("Error loading config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await configAPI.saveICP(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving config:", error);
        } finally {
            setSaving(false);
        }
    };

    const addToList = (field, value, clearInput) => {
        if (value.trim()) {
            setConfig({
                ...config,
                [field]: [...config[field], value.trim()],
            });
            clearInput("");
        }
    };

    const removeFromList = (field, index) => {
        setConfig({
            ...config,
            [field]: config[field].filter((_, i) => i !== index),
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        ICP Configuration
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Define your Ideal Customer Profile criteria
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Saved!</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            <span>Save Configuration</span>
                        </>
                    )}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Configuration Name
                    </label>
                    <input
                        type="text"
                        value={config.name}
                        onChange={(e) =>
                            setConfig({ ...config, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Main ICP 2024"
                    />
                </div>

                {/* Industries */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Industries
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={industryInput}
                            onChange={(e) => setIndustryInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    addToList(
                                        "industries",
                                        industryInput,
                                        setIndustryInput
                                    );
                                }
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., SaaS, E-commerce"
                        />
                        <button
                            onClick={() =>
                                addToList(
                                    "industries",
                                    industryInput,
                                    setIndustryInput
                                )
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.industries.map((industry, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2"
                            >
                                <span>{industry}</span>
                                <button
                                    onClick={() =>
                                        removeFromList("industries", index)
                                    }
                                    className="hover:text-blue-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Company Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Size (Employees)
                    </label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="number"
                            value={config.company_size_min}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    company_size_min: parseInt(e.target.value),
                                })
                            }
                            className="w-32 px-4 py-2 border rounded-lg"
                            placeholder="Min"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="number"
                            value={config.company_size_max}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    company_size_max: parseInt(e.target.value),
                                })
                            }
                            className="w-32 px-4 py-2 border rounded-lg"
                            placeholder="Max"
                        />
                    </div>
                </div>

                {/* Regions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Regions
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={regionInput}
                            onChange={(e) => setRegionInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    addToList(
                                        "regions",
                                        regionInput,
                                        setRegionInput
                                    );
                                }
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg"
                            placeholder="e.g., North America, Europe"
                        />
                        <button
                            onClick={() =>
                                addToList(
                                    "regions",
                                    regionInput,
                                    setRegionInput
                                )
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.regions.map((region, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center space-x-2"
                            >
                                <span>{region}</span>
                                <button
                                    onClick={() =>
                                        removeFromList("regions", index)
                                    }
                                    className="hover:text-green-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Target Job Titles */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Buyer Job Titles / Personas
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={jobTitleInput}
                            onChange={(e) => setJobTitleInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    addToList(
                                        "target_job_titles",
                                        jobTitleInput,
                                        setJobTitleInput
                                    );
                                }
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg"
                            placeholder="e.g., VP Engineering, CTO, DevOps Lead"
                        />
                        <button
                            onClick={() =>
                                addToList(
                                    "target_job_titles",
                                    jobTitleInput,
                                    setJobTitleInput
                                )
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.target_job_titles.map((title, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center space-x-2"
                            >
                                <span>{title}</span>
                                <button
                                    onClick={() =>
                                        removeFromList(
                                            "target_job_titles",
                                            index
                                        )
                                    }
                                    className="hover:text-purple-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tech Stack */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Technology Stack Indicators
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    addToList(
                                        "tech_stack",
                                        techInput,
                                        setTechInput
                                    );
                                }
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg"
                            placeholder="e.g., AWS, Kubernetes, Docker"
                        />
                        <button
                            onClick={() =>
                                addToList("tech_stack", techInput, setTechInput)
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.tech_stack.map((tech, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center space-x-2"
                            >
                                <span>{tech}</span>
                                <button
                                    onClick={() =>
                                        removeFromList("tech_stack", index)
                                    }
                                    className="hover:text-orange-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Pain Points */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pain Points / Use Cases
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            value={painPointInput}
                            onChange={(e) => setPainPointInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    addToList(
                                        "pain_points",
                                        painPointInput,
                                        setPainPointInput
                                    );
                                }
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg"
                            placeholder="e.g., Testing complexity, CI/CD issues"
                        />
                        <button
                            onClick={() =>
                                addToList(
                                    "pain_points",
                                    painPointInput,
                                    setPainPointInput
                                )
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {config.pain_points.map((pain, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center space-x-2"
                            >
                                <span>{pain}</span>
                                <button
                                    onClick={() =>
                                        removeFromList("pain_points", index)
                                    }
                                    className="hover:text-red-900"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ICPConfig;

