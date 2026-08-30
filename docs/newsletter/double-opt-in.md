# Double Opt-In Flow

Our newsletter subscription requires a double opt-in to ensure deliverability and list quality.

## Flow Steps
1. User submits their email address via one of our CTA forms.
2. The Next.js API route returns a success response with a "Check your inbox" message.
3. Our newsletter provider (e.g., Beehiiv) sends a confirmation email to the user.
4. The user clicks the confirmation link in the email.
5. The provider confirms the subscription and adds them to the active list.

*Note: Double opt-in is handled entirely by the provider (Beehiiv), not by custom code in our platform.*
