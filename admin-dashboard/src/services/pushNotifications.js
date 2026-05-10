/**
 * Sends push notifications through our Vercel serverless API.
 */
export async function sendPushNotifications(
  tokens = [],
  title,
  body,
  data = {}
) {
  const cleanTokens = tokens.filter(Boolean);

  if (!cleanTokens.length) {
    console.log('No valid push tokens found.');
    return;
  }

  try {
    const response = await fetch('/api/send-push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: cleanTokens,
        title,
        body,
        data,
      }),
    });

    const result = await response.json();

    console.log('Push notification result:', result);
  } catch (error) {
    console.error('Push send error:', error);
  }
}