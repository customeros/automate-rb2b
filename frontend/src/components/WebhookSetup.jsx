import { useState } from "react";
import { Webhook, Copy, Check, ExternalLink, X } from "lucide-react";

function WebhookSetup({ onClose }) {
    const [copied, setCopied] = useState(false);
    const [ngrokUrl, setNgrokUrl] = useState("");

    const backendPort = "3001";
    const webhookPath = "/api/webhook/rb2b";

    const getWebhookUrl = () => {
        if (ngrokUrl) {
            return `${ngrokUrl}${webhookPath}`;
        }
        return `[Enter your ngrok URL above]`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getWebhookUrl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <Webhook className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Webhook Setup
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Step 1: Ngrok */}
                        <div className="border rounded-lg p-4 bg-blue-50">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                📡 Step 1: Start Ngrok Tunnel
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Ngrok exposes your local server to the internet
                                so RB2B can send webhooks.
                            </p>
                            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mb-3">
                                ngrok http 3001
                            </div>
                            <p className="text-xs text-gray-600">
                                Don't have ngrok?{" "}
                                <a
                                    href="https://ngrok.com/download"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Download it here
                                </a>{" "}
                                or install with:{" "}
                                <code className="bg-gray-100 px-1 rounded">
                                    brew install ngrok
                                </code>
                            </p>
                        </div>

                        {/* Step 2: Get URL */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                🔗 Step 2: Copy Your Ngrok URL
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                After starting ngrok, copy the "Forwarding" URL
                                (e.g., https://abc123.ngrok-free.app)
                            </p>
                            <input
                                type="text"
                                value={ngrokUrl}
                                onChange={(e) => setNgrokUrl(e.target.value)}
                                placeholder="https://abc123.ngrok-free.app"
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                        </div>

                        {/* Step 3: Webhook URL */}
                        <div
                            className={`border rounded-lg p-4 ${
                                ngrokUrl ? "bg-green-50" : "bg-gray-50"
                            }`}
                        >
                            <h3 className="font-semibold text-gray-900 mb-2">
                                ✅ Step 3: Configure in RB2B
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Use this URL in your RB2B webhook settings:
                            </p>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={getWebhookUrl()}
                                    readOnly
                                    className={`flex-1 px-3 py-2 border rounded-lg text-sm font-mono ${
                                        ngrokUrl
                                            ? "bg-white text-gray-900"
                                            : "bg-gray-100 text-gray-400"
                                    }`}
                                    placeholder="Enter ngrok URL in Step 2 first"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    disabled={!ngrokUrl}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            {!ngrokUrl && (
                                <p className="text-xs text-amber-600 mt-2">
                                    ⚠️ You must enter your ngrok URL in Step 2
                                    before you can copy the webhook URL
                                </p>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                📖 Next Steps
                            </h3>
                            <ol className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start space-x-2">
                                    <span className="font-semibold text-blue-600">
                                        1.
                                    </span>
                                    <span>
                                        Log in to your{" "}
                                        <a
                                            href="https://rb2b.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            RB2B dashboard
                                        </a>
                                    </span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-semibold text-blue-600">
                                        2.
                                    </span>
                                    <span>
                                        Navigate to Settings → Webhooks or
                                        Integrations
                                    </span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-semibold text-blue-600">
                                        3.
                                    </span>
                                    <span>
                                        Add a new webhook endpoint and paste the
                                        URL above
                                    </span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-semibold text-blue-600">
                                        4.
                                    </span>
                                    <span>
                                        Select "Visitor Identified" or "Contact
                                        Identified" events
                                    </span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-semibold text-blue-600">
                                        5.
                                    </span>
                                    <span>
                                        Send a test webhook to verify it's
                                        working
                                    </span>
                                </li>
                            </ol>
                        </div>

                        {/* Helpful Links */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                📚 Helpful Resources
                            </h4>
                            <div className="space-y-1">
                                <a
                                    href="http://127.0.0.1:4040"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>
                                        Ngrok Web Inspector
                                        (http://127.0.0.1:4040)
                                    </span>
                                </a>
                                <a
                                    href="https://github.com/yourusername/automate-rb2b/blob/main/NGROK_SETUP.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Full Ngrok Setup Guide</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WebhookSetup;
