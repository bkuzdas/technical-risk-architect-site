/**
 * Cloudflare Pages Function — Contact Form Handler
 * POST /contact
 * Sends form submissions to Web3Forms API → delivers to sales@technicalriskarchitect.com
 */

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const { name, email, organization, interest, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please fill in all required fields.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Map interest value to readable label
    const interestLabels = {
      'audit-strategy':  'Tier I — Audit & Strategy',
      'infrastructure':  'Tier II — Infrastructure Hardening',
      'managed':         'Tier III — Managed Risk Architecture',
      'unsure':          'Not sure yet — let\'s talk',
    };
    const interestLabel = interestLabels[interest] || interest || 'Not specified';

    // Send via Web3Forms
    const web3Response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key:   context.env.WEB3FORMS_KEY,
        from_name:    'Technical Risk Architect — Website',
        subject:      `New Inquiry: ${name} — ${interestLabel}`,
        replyto:      email,
        botcheck:     '',
        // Email body
        name,
        email,
        organization: organization || 'Not provided',
        interest:     interestLabel,
        message,
      }),
    });

    const result = await web3Response.json();

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Message sent! We\'ll be in touch shortly.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Web3Forms error:', result);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send message. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('Contact function error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Return 405 for non-POST requests
export async function onRequest(context) {
  return new Response('Method not allowed', { status: 405 });
}
