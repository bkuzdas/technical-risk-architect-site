export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    await verifyTurnstile(env, request, body.turnstileToken);

    const response = await fetch('https://professional.brianboruma.com/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Contact-Proxy-Token': env.CONTACT_PROXY_TOKEN,
      },
      body: JSON.stringify({
        ...body,
        source: 'technical-risk-architect-site',
        turnstileToken: undefined,
      }),
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Technical Risk Architect contact proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unable to send message right now.';
    const status = message === 'Please complete the security check' ? 400 : 500;
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  }
}

export async function onRequest() {
  return new Response('Method not allowed', { status: 405 });
}

async function verifyTurnstile(env, request, token) {
  if (!env.TURNSTILE_SECRET_KEY || !env.CONTACT_PROXY_TOKEN) {
    throw new Error('Security configuration is incomplete');
  }

  if (!String(token || '').trim()) {
    throw new Error('Please complete the security check');
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: String(token),
    remoteip: request.headers.get('CF-Connecting-IP') || '',
  });

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error('Please complete the security check');
  }
}
