# Contributing to RB2B Lead Actionability System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Prerequisites**

    - Node.js 18+
    - Ollama installed and running
    - llama3 model pulled

2. **Clone and Setup**

    ```bash
    git clone <repository-url>
    cd automate-rb2b
    ./setup.sh
    ```

3. **Development Workflow**

    ```bash
    # Start both backend and frontend in dev mode
    npm run dev

    # Or start them separately
    npm run dev:backend
    npm run dev:frontend
    ```

## Project Structure

```
/automate-rb2b
├── backend/          # Node.js/Express backend
│   ├── services/    # Business logic (Ollama, LinkedIn, Database)
│   ├── routes/      # API endpoints
│   ├── db/          # Database schema
│   └── scripts/     # Utility scripts
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/   # Main page components
│   │   ├── components/  # Reusable UI components
│   │   └── api/     # API client
└── scripts/         # Setup and build scripts
```

## Making Changes

### Backend Changes

-   **Database Changes**: Update `backend/db/schema.sql` and `backend/services/database.js`
-   **API Endpoints**: Add routes in `backend/routes/`
-   **Business Logic**: Update services in `backend/services/`
-   **AI Prompts**: Modify prompts in `backend/services/ollama.js`

### Frontend Changes

-   **UI Components**: Add/modify in `frontend/src/components/`
-   **Pages**: Update in `frontend/src/pages/`
-   **Styling**: Uses TailwindCSS utility classes
-   **API Integration**: Update `frontend/src/api/client.js`

## Testing

### Manual Testing

1. **Generate Demo Lead**

    ```bash
    npm run test-webhook
    ```

2. **Test Full Flow**
    - Use the "Generate Demo Lead" button in the UI
    - Configure ICP and verify scoring
    - Test LinkedIn scraping (requires login)
    - Review generated emails

### Testing LinkedIn Scraper

The LinkedIn scraper requires:

-   User to be logged into LinkedIn in the browser
-   Rate limiting to avoid blocks
-   Testing with real company names

## Code Style

-   **Backend**: ES modules, async/await
-   **Frontend**: Functional React components, hooks
-   **Formatting**: Prettier with 4-space indentation
-   **Naming**: camelCase for variables/functions, PascalCase for components

## Pull Request Process

1. **Create a Branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make Changes**

    - Write clear commit messages
    - Test your changes thoroughly
    - Update documentation if needed

3. **Submit PR**
    - Provide clear description of changes
    - Reference any related issues
    - Ensure all checks pass

## Areas for Contribution

### High Priority

-   [ ] Add webhook signature verification (HMAC)
-   [ ] Implement CRM integrations (Salesforce, HubSpot)
-   [ ] Add email template variations
-   [ ] Improve error handling and logging
-   [ ] Add unit tests

### Medium Priority

-   [ ] Additional data enrichment sources
-   [ ] More sophisticated persona detection
-   [ ] Export functionality (CSV, JSON)
-   [ ] Webhook replay/retry mechanism
-   [ ] Dashboard analytics and metrics

### Nice to Have

-   [ ] Dark mode toggle
-   [ ] Email scheduling
-   [ ] Bulk operations
-   [ ] Lead notes and tagging
-   [ ] Activity timeline

## Questions?

Open an issue or reach out at hello@customeros.ai

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
