// Manual mapping of company names to LinkedIn company IDs
// Use this when auto-detection fails or for frequently searched companies

const COMPANY_ID_MAP = {
    // Tech Companies
    stripe: "2135371",
    shopify: "784652",
    hubspot: "68529",
    atlassian: "1441",
    salesforce: "2478",
    google: "1441",
    microsoft: "1035",
    amazon: "1586",
    meta: "10667",
    facebook: "10667",
    apple: "162479",
    netflix: "165158",
    uber: "1815218",
    airbnb: "2267049",
    spotify: "2943991",
    slack: "2612894",
    zoom: "2532259",
    notion: "10248794",
    figma: "3166135",
    datadog: "2405953",

    // Add more as needed...
};

export function getCompanyIdByName(companyName) {
    const normalized = companyName.toLowerCase().trim();
    return COMPANY_ID_MAP[normalized] || null;
}

export function addCompanyMapping(companyName, companyId) {
    const normalized = companyName.toLowerCase().trim();
    COMPANY_ID_MAP[normalized] = companyId;
}

export default COMPANY_ID_MAP;
