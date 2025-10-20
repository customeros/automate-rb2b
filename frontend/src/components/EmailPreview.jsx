import { useState } from "react";
import { Copy, Check, Mail } from "lucide-react";

function EmailPreview({ email, contactName }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`;

    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                        {contactName || "Contact"}
                    </span>
                </div>
                <button
                    onClick={() => copyToClipboard(fullEmail)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
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

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                        Subject
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                        {email.subject}
                    </p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                        Body
                    </label>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {email.body}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EmailPreview;

