import puppeteer from "puppeteer";
import { getCompanyIdByName } from "./companyMapping.js";

class LinkedInScraper {
    constructor(ollamaService) {
        this.ollamaService = ollamaService;
        this.browser = null;
    }

    async initialize() {
        if (!this.browser) {
            console.log(
                "🚀 Starting LinkedIn scraper with persistent session..."
            );
            this.browser = await puppeteer.launch({
                headless: false, // User needs to be logged in
                userDataDir: "./linkedin-session", // Persist login session
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-features=VizDisplayCompositor",
                ],
            });
            console.log("✅ Browser launched with session persistence");
        }
    }

    async findCompanyId(page, companyName) {
        console.log(`\n🏢 Step 1: Finding LinkedIn ID for "${companyName}"...`);

        // First check our manual mapping
        const mappedId = getCompanyIdByName(companyName);
        if (mappedId) {
            console.log(
                `  ✓ Found in company mapping: ${companyName} → ${mappedId}`
            );
            return mappedId;
        }

        console.log(`  ⚠️  Not in mapping, searching LinkedIn...`);

        // Search for the company
        const companySearchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(
            companyName
        )}`;
        await page.goto(companySearchUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        await new Promise((resolve) => setTimeout(resolve, 4000));

        // Extract company ID from the first result
        const companyId = await page.evaluate((targetCompany) => {
            const companyLinks = document.querySelectorAll(
                'a[href*="/company/"]'
            );

            console.log(`  Found ${companyLinks.length} company links`);

            for (const link of companyLinks) {
                const href = link.href;
                // Match numeric IDs like /company/68529/
                const match = href.match(/\/company\/(\d+)/);
                if (match && match[1]) {
                    // Get the company name text to verify it's the right one
                    const companyNameEl = link.querySelector(
                        ".artdeco-entity-lockup__title, .entity-result__title-text, .t-16"
                    );
                    if (companyNameEl) {
                        const foundName = companyNameEl.innerText
                            .trim()
                            .toLowerCase();
                        const targetLower = targetCompany.toLowerCase();

                        console.log(
                            `  Checking: "${foundName}" vs "${targetLower}"`
                        );

                        if (
                            foundName === targetLower ||
                            foundName.includes(targetLower) ||
                            targetLower.includes(foundName)
                        ) {
                            console.log(
                                `  ✓ Found company: ${companyNameEl.innerText.trim()}`
                            );
                            console.log(`  Company ID: ${match[1]}`);
                            return match[1];
                        }
                    }
                }
            }

            console.log(`  ⚠️  Could not find numeric company ID`);
            return null;
        }, companyName);

        if (companyId) {
            console.log(
                `\n💡 Add this to companyMapping.js for faster searches:`
            );
            console.log(`   '${companyName.toLowerCase()}': '${companyId}',\n`);
        }

        return companyId;
    }

    async searchCompanyEmployees(
        companyName,
        targetJobTitles,
        maxResults = 10,
        verifyRoles = true
    ) {
        await this.initialize();

        try {
            const page = await this.browser.newPage();

            // Set viewport for better rendering
            await page.setViewport({ width: 1280, height: 800 });

            // First, find the company's LinkedIn ID
            const companyId = await this.findCompanyId(page, companyName);

            if (!companyId) {
                console.log(
                    `\n⚠️  Could not find LinkedIn company ID for "${companyName}"`
                );
                console.log(`   Falling back to keyword search...\n`);
            } else {
                // Skip company verification for now to avoid frame issues
                console.log(
                    `✓ Using company ID ${companyId} for ${companyName}`
                );
            }

            // Build search query with job titles
            console.log(`\n🔍 Step 2: Searching for employees...`);
            const jobTitleQuery = targetJobTitles.slice(0, 3).join(" OR ");

            let searchUrl;
            if (companyId) {
                // Use enhanced company filter for more accurate results
                searchUrl = `https://www.linkedin.com/search/results/people/?currentCompany=%5B%22${companyId}%22%5D&keywords=${encodeURIComponent(
                    jobTitleQuery
                )}&facetCurrentCompany=${companyId}&origin=FACETED_SEARCH`;
                console.log(
                    `   ✓ Using enhanced company filter: ${companyName} (ID: ${companyId})`
                );
                console.log(`   📍 URL: ${searchUrl}\n`);
            } else {
                // Fallback to keyword search
                const searchQuery = `${jobTitleQuery} at ${companyName}`;
                searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                    searchQuery
                )}`;
                console.log(
                    `   ⚠️  Using keyword search (less accurate): "${jobTitleQuery} at ${companyName}"`
                );
                console.log(`   📍 URL: ${searchUrl}\n`);
            }

            console.log(`🎯 Target titles: ${targetJobTitles.join(", ")}`);

            // Use the existing page to maintain login session
            await page.goto(searchUrl, {
                waitUntil: "domcontentloaded",
                timeout: 30000,
            });

            // Check if user is logged in
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for page to stabilize

            const isLoggedIn = await page.evaluate(() => {
                return (
                    !document.body.innerText.includes("Sign in") &&
                    !document.body.innerText.includes("Join now")
                );
            });

            if (!isLoggedIn) {
                console.log("⚠️  LinkedIn login required.");
                console.log("👉 Please log in manually in the browser window.");
                console.log("⏳ Waiting up to 2 minutes for login...\n");

                // Wait for user to log in
                await page
                    .waitForNavigation({
                        waitUntil: "domcontentloaded",
                        timeout: 120000,
                    })
                    .catch(() => {
                        console.log(
                            "Navigation timeout - checking if logged in..."
                        );
                    });

                // Refresh to see if we're now logged in
                await page.reload({ waitUntil: "domcontentloaded" });
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }

            console.log("✓ Logged in to LinkedIn");
            console.log("⏳ Waiting for search results to load...\n");

            // Give LinkedIn more time to load results
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Debug: Check what company is actually being searched
            const currentUrl = page.url();
            console.log(`🔍 Current URL: ${currentUrl}`);

            // Check if the company filter is applied correctly
            const pageTitle = await page.title();
            console.log(`📄 Page title: ${pageTitle}`);

            // Check if we can see any company information on the page
            const companyInfo = await page.evaluate(() => {
                const companyElements = document.querySelectorAll(
                    '[data-test-id="company-name"], .entity-result__title-text, .artdeco-entity-lockup__title'
                );
                const companies = Array.from(companyElements)
                    .map((el) => el.innerText.trim())
                    .filter((text) => text.length > 0);
                return companies.slice(0, 5); // Get first 5 companies mentioned
            });

            console.log(
                `🏢 Companies found on page: ${companyInfo.join(", ")}`
            );

            if (
                companyInfo.length > 0 &&
                !companyInfo.some((company) =>
                    company.toLowerCase().includes(companyName.toLowerCase())
                )
            ) {
                console.log(
                    `⚠️  WARNING: Expected ${companyName} but found: ${companyInfo.join(
                        ", "
                    )}`
                );
                console.log(
                    `   This suggests the company filter may not be working correctly.`
                );

                // Try to manually apply the company filter
                console.log(
                    `🔧 Attempting to manually apply company filter...`
                );
                try {
                    // Look for and click the company filter if it exists
                    const companyFilterApplied = await page.evaluate(
                        (targetCompany) => {
                            // Check if there's a company filter already applied
                            const activeFilters = document.querySelectorAll(
                                ".search-reusables__filter-pill-button--is-pressed"
                            );
                            const hasCompanyFilter = Array.from(
                                activeFilters
                            ).some(
                                (filter) =>
                                    filter.innerText
                                        .toLowerCase()
                                        .includes("company") ||
                                    filter.innerText
                                        .toLowerCase()
                                        .includes(targetCompany.toLowerCase())
                            );

                            if (hasCompanyFilter) {
                                console.log("Company filter already applied");
                                return true;
                            }

                            // Try to find and click the company filter
                            const companyFilterButton = document.querySelector(
                                '[data-test-id="company-filter"], .search-reusables__filter-pill-button[aria-label*="company"]'
                            );
                            if (companyFilterButton) {
                                companyFilterButton.click();
                                return true;
                            }

                            return false;
                        },
                        companyName
                    );

                    if (companyFilterApplied) {
                        console.log(
                            `✓ Company filter applied, waiting for results...`
                        );
                        await new Promise((resolve) =>
                            setTimeout(resolve, 3000)
                        );
                    }
                } catch (error) {
                    console.log(
                        `⚠️  Could not manually apply company filter: ${error.message}`
                    );
                }
            }

            // Try multiple selectors for LinkedIn's changing structure
            const resultSelectors = [
                ".reusable-search__result-container",
                ".entity-result",
                "[data-chameleon-result-urn]",
                ".search-results-container",
                ".search-results__list li",
            ];

            let resultsFound = false;
            let usedSelector = null;

            console.log("🔎 Looking for search results...");

            // Debug: Log what's on the page
            const pageInfo = await page.evaluate(() => {
                return {
                    title: document.title,
                    hasResults: !!document.querySelector(".search-results"),
                    bodyText: document.body.innerText.substring(0, 500),
                };
            });
            console.log(`   Page title: "${pageInfo.title}"`);
            console.log(`   Has results container: ${pageInfo.hasResults}`);

            for (const selector of resultSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 8000 });

                    // Check if we actually have elements
                    const count = await page.$$eval(
                        selector,
                        (els) => els.length
                    );
                    if (count > 0) {
                        resultsFound = true;
                        usedSelector = selector;
                        console.log(
                            `✓ Found ${count} results with selector: ${selector}\n`
                        );
                        break;
                    }
                } catch (e) {
                    console.log(`   ⚠️  Selector not found: ${selector}`);
                    continue;
                }
            }

            if (!resultsFound) {
                console.log("\n❌ No search results found. This could mean:");
                console.log("   1. LinkedIn changed their HTML structure");
                console.log("   2. No results for this company/job titles");
                console.log("   3. LinkedIn is showing a CAPTCHA or blocking");

                const screenshotPath = `linkedin-debug-${Date.now()}.png`;
                await page.screenshot({ path: screenshotPath, fullPage: true });
                console.log(`\n📸 Saved screenshot: ${screenshotPath}`);
                console.log(
                    "⏸️  Keeping browser open for 30 seconds so you can inspect...\n"
                );

                await new Promise((resolve) => setTimeout(resolve, 30000));
                await page.close();
                return [];
            }

            // Extract employee data with updated selectors for LinkedIn's current structure
            const employees = await page.evaluate(
                (targetTitles, companyName, hasCompanyFilter) => {
                    const results = [];

                    // Use the data-chameleon-result-urn selector that we know works
                    const containers = document.querySelectorAll(
                        "[data-chameleon-result-urn]"
                    );

                    console.log(
                        `Found ${containers.length} result containers on page`
                    );
                    if (hasCompanyFilter) {
                        console.log(
                            `✓ Using LinkedIn's company filter - all results work at ${companyName}\n`
                        );
                    } else {
                        console.log(
                            `⚠️  Manually filtering for company: "${companyName}"\n`
                        );
                    }

                    containers.forEach((el, index) => {
                        try {
                            // LinkedIn's current structure (as of 2024/2025)
                            // The profile link is inside the main content area, specifically in the name section
                            // Path: div[data-chameleon-result-urn] > .linked-area > ... > .QRsBGGTkAVlVMqjnfUqhRnPZLBuQJInSvQ > a

                            // Find the name link - it's in the span with class QRsBGGTkAVlVMqjnfUqhRnPZLBuQJInSvQ
                            const nameContainer = el.querySelector(
                                ".QRsBGGTkAVlVMqjnfUqhRnPZLBuQJInSvQ"
                            );
                            const nameEl = nameContainer
                                ? nameContainer.querySelector('a[href*="/in/"]')
                                : null;

                            // Find the title div - specific class that contains just the job title
                            const titleEl = el.querySelector(
                                ".MPFWKoQFBIWsWGqHMHsTCFjPNOuEhvFGtlc"
                            );

                            if (index < 3) {
                                console.log(
                                    `\n  === Debugging Container ${
                                        index + 1
                                    } ===`
                                );
                                console.log(
                                    `  Name container found: ${!!nameContainer}`
                                );
                                console.log(
                                    `  Name element found: ${!!nameEl}`
                                );
                                console.log(
                                    `  Title element found: ${!!titleEl}`
                                );
                                if (nameEl)
                                    console.log(
                                        `  Profile URL: ${nameEl.href}`
                                    );
                                if (titleEl)
                                    console.log(
                                        `  Title text: "${titleEl.innerText?.trim()}"`
                                    );
                            }

                            if (nameEl && titleEl) {
                                // Clean the profile URL - remove query parameters
                                const profileUrl = nameEl.href.split("?")[0];

                                // Extract name from nested spans
                                const nameSpan = nameEl.querySelector(
                                    'span[dir="ltr"] span[aria-hidden="true"]'
                                );
                                let name = nameSpan
                                    ? nameSpan.innerText.trim()
                                    : nameEl.innerText.trim();

                                // Clean up name if it contains extra text
                                if (
                                    name.includes("View ") ||
                                    name.includes("'s profile")
                                ) {
                                    name = name
                                        .replace("View ", "")
                                        .replace("'s profile", "")
                                        .trim();
                                }

                                // Title is directly in the div
                                const title = titleEl.innerText.trim();

                                // If we don't have a company filter, manually check if they work there
                                let worksAtCompany = hasCompanyFilter; // Trust LinkedIn's filter if we have it

                                if (!hasCompanyFilter) {
                                    // Manual filtering as fallback
                                    const titleLower = title.toLowerCase();
                                    const companyLower =
                                        companyName.toLowerCase();

                                    const summaryEl = el.querySelector(
                                        ".ckfYekxlWGHuLQxABvYtwvKQDRAmJqhxg"
                                    );
                                    const summary = summaryEl
                                        ? summaryEl.innerText.toLowerCase()
                                        : "";

                                    worksAtCompany =
                                        titleLower.includes(
                                            ` at ${companyLower}`
                                        ) ||
                                        titleLower.includes(
                                            ` @ ${companyLower}`
                                        ) ||
                                        (titleLower.includes(companyLower) &&
                                            titleLower.includes(" at ")) ||
                                        (summary.includes("current:") &&
                                            summary.includes(companyLower));
                                }

                                if (
                                    name &&
                                    title &&
                                    profileUrl &&
                                    profileUrl.includes("/in/") &&
                                    name.length > 2 &&
                                    title.length > 2 &&
                                    worksAtCompany
                                ) {
                                    console.log(
                                        `  ✓ ${index + 1}. ${name} - ${title}`
                                    );
                                    results.push({ name, title, profileUrl });
                                } else {
                                    if (index < 5) {
                                        console.log(
                                            `  ✗ ${
                                                index + 1
                                            }. ${name} - ${title}`
                                        );
                                        if (!worksAtCompany) {
                                            console.log(
                                                `     ⚠️  Doesn't work at ${companyName} - FILTERED OUT`
                                            );
                                        }
                                    }
                                }
                            } else {
                                // Debug why this container failed
                                if (index < 3) {
                                    console.log(
                                        `  ✗ Container ${
                                            index + 1
                                        }: Missing elements - nameEl=${!!nameEl}, titleEl=${!!titleEl}`
                                    );
                                }
                            }
                        } catch (err) {
                            console.error(
                                `Error extracting employee ${index}:`,
                                err.message
                            );
                        }
                    });

                    console.log(
                        `\n📊 Summary: ${results.length} employees found at ${companyName}\n`
                    );
                    return results;
                },
                targetJobTitles,
                companyName,
                !!companyId
            );

            console.log(
                `\n✓ Extracted ${employees.length} profiles from LinkedIn\n`
            );

            if (employees.length === 0) {
                console.log("⚠️  No profiles extracted. This could mean:");
                console.log("   - LinkedIn changed their HTML structure");
                console.log("   - No results found for this company");
                console.log("   - Rate limiting or CAPTCHA");

                const screenshotPath = `linkedin-no-results-${Date.now()}.png`;
                await page.screenshot({ path: screenshotPath, fullPage: true });
                console.log(`\n📸 Saved screenshot: ${screenshotPath}`);
                console.log(
                    "⏸️  Keeping browser open for 30 seconds so you can inspect...\n"
                );

                await new Promise((resolve) => setTimeout(resolve, 30000));
                await page.close();
                return [];
            }

            // Filter by target job titles and score persona fit
            console.log("🤖 Scoring persona fit with AI...\n");
            const scoredEmployees = [];

            for (const emp of employees.slice(0, maxResults)) {
                console.log(`   Analyzing: ${emp.name} (${emp.title})`);

                let verifiedEmployee = emp;

                if (verifyRoles) {
                    // Verify the employee's current role at the target company
                    verifiedEmployee = await this.verifyEmployeeRole(
                        page,
                        emp,
                        companyName
                    );

                    if (!verifiedEmployee.isVerified) {
                        console.log(
                            `   ❌ Skipping: ${verifiedEmployee.reason}`
                        );
                        continue;
                    }
                } else {
                    console.log(`   ⚡ Skipping verification for speed`);
                }

                const fitScore = await this.ollamaService.scorePersonaFit(
                    verifiedEmployee.verifiedRole || emp.title,
                    targetJobTitles
                );

                console.log(
                    `   → Fit score: ${(fitScore.score * 100).toFixed(0)}% - ${
                        fitScore.matchedPersona
                    }`
                );

                if (fitScore.score >= 0.5) {
                    // Lower threshold to be more inclusive
                    scoredEmployees.push({
                        ...verifiedEmployee,
                        persona: fitScore.matchedPersona,
                        persona_fit_score: fitScore.score,
                    });
                }
            }

            console.log(
                `\n✓ ${scoredEmployees.length} contacts match your target personas\n`
            );

            // Close the page after all processing is done
            await page.close();

            return scoredEmployees.sort(
                (a, b) => b.persona_fit_score - a.persona_fit_score
            );
        } catch (error) {
            console.error("❌ Error scraping LinkedIn:", error.message);
            console.error("Stack:", error.stack);
            return [];
        }
    }

    async verifyEmployeeRole(page, employee, targetCompany) {
        try {
            console.log(
                `🔍 Verifying ${employee.name}'s role at ${targetCompany}...`
            );

            // Navigate to the employee's profile
            await page.goto(employee.profileUrl, {
                waitUntil: "domcontentloaded",
                timeout: 15000,
            });

            // Wait for profile to load
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Extract current role information using modern LinkedIn selectors
            const roleInfo = await page.evaluate((targetCompany) => {
                // Find the first experience item (current position)
                // LinkedIn uses: li.artdeco-list__item for each position
                const experienceList = document.querySelector(
                    "ul.cNpTaOHypiAvlEPOELGpZYejBRGdRjzZYE"
                );

                if (!experienceList) {
                    return {
                        currentRole: null,
                        currentCompany: null,
                        worksAtTarget: false,
                        reason: "Could not find experience section",
                    };
                }

                const firstPosition = experienceList.querySelector(
                    "li.artdeco-list__item"
                );

                if (!firstPosition) {
                    return {
                        currentRole: null,
                        currentCompany: null,
                        worksAtTarget: false,
                        reason: "Could not find first position",
                    };
                }

                // Extract role - it's in a span with t-bold class inside the position
                const roleElement = firstPosition.querySelector(
                    '.t-bold span[aria-hidden="true"]'
                );
                const currentRole = roleElement
                    ? roleElement.innerText.trim()
                    : null;

                // Extract company name - it's in a span with t-14 t-normal class
                // Look for the company name (appears after the role, before the duration)
                const companySpans = firstPosition.querySelectorAll(
                    '.t-14.t-normal span[aria-hidden="true"]'
                );
                let currentCompany = null;

                // First span with t-14 t-normal typically contains the company name
                // It might include employment type like "Company Name · Full-time"
                if (companySpans.length > 0) {
                    const companyText = companySpans[0].innerText.trim();
                    // Remove employment type suffix if present
                    currentCompany = companyText.split("·")[0].trim();
                }

                // Check if they work at the target company
                const worksAtTarget =
                    currentCompany &&
                    currentCompany
                        .toLowerCase()
                        .includes(targetCompany.toLowerCase());

                return {
                    currentRole,
                    currentCompany,
                    worksAtTarget,
                    reason: worksAtTarget
                        ? "Confirmed current role"
                        : currentCompany
                        ? `Works at ${currentCompany}, not ${targetCompany}`
                        : "Could not determine current company",
                };
            }, targetCompany);

            console.log(
                `   ${roleInfo.worksAtTarget ? "✅" : "❌"} ${roleInfo.reason}`
            );

            if (roleInfo.worksAtTarget) {
                return {
                    ...employee,
                    verifiedRole: roleInfo.currentRole,
                    verifiedCompany: roleInfo.currentCompany,
                    isVerified: true,
                };
            } else {
                return {
                    ...employee,
                    verifiedRole: roleInfo.currentRole,
                    verifiedCompany: roleInfo.currentCompany,
                    isVerified: false,
                    reason: roleInfo.reason,
                };
            }
        } catch (error) {
            console.log(`   ⚠️  Could not verify role: ${error.message}`);
            return {
                ...employee,
                isVerified: false,
                reason: `Verification failed: ${error.message}`,
            };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export default LinkedInScraper;
