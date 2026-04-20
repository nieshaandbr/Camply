/**
 * Frontend helper that calls the server-side email endpoint.
 * The Resend API key stays on the server, not here.
 */
export async function sendOnboardingEmail(payload) {
  const response = await fetch('/api/send-onboarding-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to send onboarding email');
  }

  return result;
}