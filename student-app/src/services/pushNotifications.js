/**
 * Send Expo push notifications to one or more Expo push tokens.
 * This is fine for pilot usage.
 */
export async function sendPushNotifications(tokens = [], title, body, data = {}) {
  const cleanTokens = tokens.filter(Boolean);

  if (!cleanTokens.length) return;

  const messages = cleanTokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Expo push result:', result);
  } catch (error) {
    console.error('Push send error:', error);
  }
}