import { Incident } from './types';

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "1",
    type: "AWS",
    risk_score: 98,
    file: "src/backend/config/prod.env",
    verdict: "Critical: High Entropy",
    ai_reasoning: "I detected high Shannon entropy (5.8). The variable name `AWS_SECRET_KEY` matches known patterns. The file is located in a production config path, not a test directory.",
    snippet: `DB_HOST=10.0.0.5\nDB_PORT=5432\nAWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE\n# Do not commit this file`,
    line_number: 3
  },
  {
    id: "2",
    type: "Slack",
    risk_score: 15,
    file: "tests/integration/mock_data.py",
    verdict: "False Positive: Low Entropy",
    ai_reasoning: "The value contains the substring 'mock', and the file path includes '/tests/'. Entropy is low. This is likely a placeholder used for unit testing.",
    snippet: `def test_notification():\n    # Mock token for testing\n    slack_token = "xoxb-1234-mock-token"\n    client.send(token=slack_token)`,
    line_number: 3
  },
  {
    id: "3",
    type: "DB",
    risk_score: 92,
    file: "config/database.yml",
    verdict: "High Confidence Secret",
    ai_reasoning: "Found a PostgreSQL connection string with embedded password credentials. Context indicates this is a configuration file often deployed to production.",
    snippet: `production:\n  adapter: postgresql\n  encoding: unicode\n  url: postgres://admin:SuperSecretPass123!@db-prod.internal:5432/main_db\n  pool: 5`,
    line_number: 4
  },
  {
    id: "4",
    type: "Generic",
    risk_score: 45,
    file: "README.md",
    verdict: "Probable Documentation",
    ai_reasoning: "The pattern resembles an API key, but it is located in a markdown file. It is likely an example or a truncated key.",
    snippet: `To run the project, set the following environment variable:\n\nexport API_KEY=abc-123-def-456\n\nThen run npm start.`,
    line_number: 3
  },
  {
    id: "5",
    type: "API Key",
    risk_score: 88,
    file: "src/services/stripe.ts",
    verdict: "Hardcoded Credential",
    ai_reasoning: "Stripe Secret Key format detected (sk_live_...). The file path suggests core business logic. This should be an environment variable.",
    snippet: `import Stripe from 'stripe';\n\nconst stripe = new Stripe('sk_live_51MzT32Gb...', {\n  apiVersion: '2022-11-15',\n});`,
    line_number: 3
  }
];