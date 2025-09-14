# **App Name**: Mail Pilot

## Core Features:

- Prompt Processing: Analyze the user's text prompt to extract the recipient email address and message content. The AI tool should have reasoning to avoid including unintended elements from the prompt in the final email content.
- Webhook Trigger: Send a JSON payload to the specified webhook URL (https://ak99055.app.n8n.cloud/webhook-test/firebase) with the extracted email information in a 'message' key.
- Confirmation Display: Show a confirmation message to the user indicating that the email has been sent via the webhook.
- Error Handling: Display an error message to the user if the webhook request fails or if the prompt cannot be properly parsed.
- Email Validation: Validates the email of recipient.

## Style Guidelines:

- Primary color: HSL 210, 67%, 46% (RGB: #3B82F6) to represent trust and reliability, critical for an app dealing with communications.
- Background color: HSL 210, 20%, 95% (RGB: #F0F5FA), a very light tint of the primary color, for a clean, professional backdrop.
- Accent color: HSL 180, 53%, 44% (RGB: #4ECDC4) for CTAs and confirmation messages.
- Font: 'Inter', a sans-serif font, for both headlines and body text, offering a modern and clean readability.
- Use simple, outline-style icons to represent actions and feedback, ensuring clarity without visual clutter.
- A clean and straightforward layout with a prominent text input area for the prompt and clear feedback messages.
- Subtle animations for feedback messages and loading states to enhance the user experience.