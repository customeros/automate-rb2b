import { Ollama } from "ollama";

class OllamaService {
    constructor(host, model) {
        this.ollama = new Ollama({ host });
        this.model = model;
    }

    async checkConnection() {
        try {
            await this.ollama.list();
            return true;
        } catch (error) {
            return false;
        }
    }

    async scoreICPFit(companyInfo, icpConfig) {
        const prompt = `You are an expert at scoring B2B company fit for ideal customer profiles.

Company Information:
- Domain: ${companyInfo.domain}
- Name: ${companyInfo.name || "Unknown"}

ICP Criteria:
- Target Industries: ${icpConfig.industries?.join(", ") || "Any"}
- Company Size: ${icpConfig.company_size_min || 0} - ${
            icpConfig.company_size_max || "unlimited"
        } employees
- Regions: ${icpConfig.regions?.join(", ") || "Global"}
- Tech Stack: ${icpConfig.tech_stack?.join(", ") || "Any"}
- Pain Points: ${icpConfig.pain_points?.join(", ") || "Any"}

Based on the domain name and any inferences you can make, score this company's fit (0-100) and assign a tier (A/B/C/D where A=90-100, B=70-89, C=50-69, D=0-49).

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "tier": "<A/B/C/D>",
  "explanation": "<brief explanation of the score>",
  "confidence": <number 0-1>
}`;

        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                format: "json",
                stream: false,
            });

            const result = JSON.parse(response.response);
            return result;
        } catch (error) {
            console.error("Error scoring ICP fit:", error);
            // Return fallback
            return {
                score: 50,
                tier: "C",
                explanation: "Unable to score - defaulting to medium fit",
                confidence: 0.3,
            };
        }
    }

    async inferPersona(visitedPages) {
        const pageList = visitedPages.map((p) => p.path || p).join("\n");

        const prompt = `You are an expert at identifying B2B buyer personas from website behavior.

The visitor viewed these pages in order:
${pageList}

Classify the visitor as one of these personas:
1. Economic Buyer - Views pricing, ROI, case studies, leadership content
2. Technical Evaluator - Views documentation, integrations, technical specs, API docs
3. Researcher - Views blog posts, guides, comparison content, educational material
4. Other - Doesn't fit the above patterns

Respond ONLY with valid JSON in this exact format:
{
  "persona": "<Economic Buyer|Technical Evaluator|Researcher|Other>",
  "confidence": <number 0-1>,
  "reasoning": "<brief explanation of classification>"
}`;

        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                format: "json",
                stream: false,
            });

            const result = JSON.parse(response.response);
            return result;
        } catch (error) {
            console.error("Error inferring persona:", error);
            return {
                persona: "Other",
                confidence: 0.3,
                reasoning: "Unable to classify persona",
            };
        }
    }

    async inferBuyingStage(visitedPages) {
        // Helper to get page path from different formats
        const getPagePath = (page) => {
            if (typeof page === "string") return page;
            return page.page_path || page.path || "";
        };

        const pageSequence = visitedPages.map((p) => getPagePath(p)).join("\n");

        const prompt = `You are an expert at identifying B2B buyer journey stages from website behavior.

The visitor viewed these pages in sequence:
${pageSequence}

Classify their buying stage:
1. Educate - Learning about the problem space, reading blogs/guides
2. Explore - Exploring solutions, viewing product overviews, feature pages
3. Evaluate - Comparing options, viewing pricing, technical documentation, starting trials
4. Purchase - Ready to buy, viewing detailed pricing, contacting sales, enterprise info

Assign an intent score (0-3):
- 0: No buying intent (career pages, etc.)
- 1: Low intent (education phase)
- 2: Medium intent (exploration/evaluation)
- 3: High intent (ready to purchase)

Respond ONLY with valid JSON in this exact format:
{
  "stage": "<Educate|Explore|Evaluate|Purchase>",
  "intentScore": <0-3>,
  "explanation": "<1-2 sentence explanation of why they are at this stage based on their page visits>",
  "nextAction": "<recommended next action for this stage>"
}`;

        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                format: "json",
                stream: false,
            });

            const result = JSON.parse(response.response);
            return result;
        } catch (error) {
            console.error("Error inferring buying stage:", error);
            return {
                stage: "Explore",
                intentScore: 1,
                explanation: "Unable to analyze buying stage from page visits",
                nextAction: "Send educational content",
            };
        }
    }

    async generateOutreachEmail(lead, stage, persona) {
        const pagesVisited = lead.visited_pages
            .map((p) => p.path || p)
            .join(", ");

        const prompt = `You are an expert at writing personalized B2B outreach emails.

Lead Information:
- Company: ${lead.company_name}
- Contact: ${lead.contact_name || "Unknown"}
- Title: ${lead.contact_title || "Unknown"}
- Persona: ${persona}
- Buying Stage: ${stage}
- Pages Visited: ${pagesVisited}

Guidelines by stage:
- Educate: Send helpful content, no meeting ask, focus on education
- Explore: Offer resources, light touch, answer questions
- Evaluate: Provide fast-track guide, optional technical session
- Purchase: Share ROI case studies, invite to meeting

Write a personalized, helpful email (not pushy or salesy). Keep it under 150 words.

Respond ONLY with valid JSON in this exact format:
{
  "subject": "<email subject line>",
  "body": "<email body text>"
}`;

        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                format: "json",
                stream: false,
            });

            const result = JSON.parse(response.response);
            return result;
        } catch (error) {
            console.error("Error generating email:", error);
            return {
                subject: `Following up on your visit to our site`,
                body: `Hi ${
                    lead.contact_name || "there"
                },\n\nI noticed you've been exploring our website. I'd love to help answer any questions you might have.\n\nBest regards`,
            };
        }
    }

    async generateAlternativeContactEmail(lead, contact, persona) {
        const prompt = `You are an expert at writing personalized B2B outreach emails for decision makers.

Context:
- Company: ${lead.company_name}
- Contact: ${contact.name} (${contact.title})
- Contact Persona: ${persona}
- Company Industry: ${this.inferIndustry(lead.company_name)}
- Buying Stage: ${lead.buying_stage}

Situation: You're reaching out to a decision maker at ${
            lead.company_name
        } because:
- Their company appears to be in the ${
            lead.buying_stage
        } stage of evaluating solutions
- You want to provide relevant content and resources for their current needs
- This is a helpful, educational approach based on their company's buying stage

Guidelines:
- Focus on providing value based on their buying stage
- Don't reference specific individuals or page visits
- Position as a helpful resource offering relevant content
- Acknowledge their role and expertise
- Offer stage-appropriate resources (education, solution info, evaluation content)
- Keep it under 150 words and professional

Buying Stage Content Focus:
- Educate: Educational content, best practices, industry insights
- Explore: Solution overviews, feature comparisons, implementation guides
- Evaluate: Technical deep-dives, ROI case studies, proof-of-concept info
- Purchase: Implementation support, success stories, next steps

Respond ONLY with valid JSON in this exact format:
{
  "subject": "<email subject line>",
  "body": "<email body text>"
}`;

        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                format: "json",
                stream: false,
            });

            const result = JSON.parse(response.response);
            return result;
        } catch (error) {
            console.error("Error generating alternative contact email:", error);
            return {
                subject: `Resources for ${lead.company_name}'s ${lead.buying_stage} stage`,
                body: `Hi ${contact.name},\n\nI hope this email finds you well. I wanted to reach out because ${lead.company_name} appears to be in the ${lead.buying_stage} stage of evaluating solutions in this space.\n\nI'd be happy to share some relevant resources and insights that might be valuable for your team's current needs. No pressure at all - just offering to help.\n\nBest regards`,
            };
        }
    }

    inferIndustry(companyName) {
        const name = companyName.toLowerCase();
        if (
            name.includes("stripe") ||
            name.includes("paypal") ||
            name.includes("square")
        )
            return "fintech";
        if (
            name.includes("shopify") ||
            name.includes("amazon") ||
            name.includes("ebay")
        )
            return "e-commerce";
        if (
            name.includes("hubspot") ||
            name.includes("salesforce") ||
            name.includes("zendesk")
        )
            return "SaaS";
        if (
            name.includes("atlassian") ||
            name.includes("slack") ||
            name.includes("notion")
        )
            return "productivity software";
        if (
            name.includes("datadog") ||
            name.includes("newrelic") ||
            name.includes("splunk")
        )
            return "monitoring/observability";
        return "technology";
    }

    async scorePersonaFit(jobTitle, targetPersonas) {
        const prompt = `You are an expert at matching job titles to buyer personas.

Job Title: ${jobTitle}
Target Buyer Personas: ${targetPersonas.join(", ")}

Score how well this job title matches the target buyer personas (0-1 where 1 is perfect match).

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-1>,
  "matchedPersona": "<persona type>",
  "reasoning": "<brief explanation>"
}`;

        try {
            const response = await this.ollama.generate({
                model: this.model,
                prompt: prompt,
                format: "json",
                stream: false,
            });

            const result = JSON.parse(response.response);
            return result;
        } catch (error) {
            console.error("Error scoring persona fit:", error);
            return {
                score: 0.5,
                matchedPersona: "Unknown",
                reasoning: "Unable to score",
            };
        }
    }
}

export default OllamaService;
