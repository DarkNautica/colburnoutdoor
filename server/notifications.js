import nodemailer from 'nodemailer';

const ownerPhone = process.env.OWNER_PHONE || '7044305221';
const ownerEmail = process.env.OWNER_EMAIL || '';
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER || '';
const googleReviewLink = process.env.GOOGLE_REVIEW_LINK || '';

export function isSmsAutomationEnabled() {
  return String(process.env.TWILIO_ENABLED || 'false').toLowerCase() === 'true';
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

function hasTwilioConfig() {
  return Boolean(isSmsAutomationEnabled() && twilioAccountSid && twilioAuthToken && twilioFromNumber);
}

export function providerStatus() {
  return {
    emailConfigured: (hasResendConfig() || hasSmtpConfig()) && Boolean(ownerEmail),
    emailProvider: hasResendConfig() ? 'resend' : hasSmtpConfig() ? 'smtp' : 'none',
    smsConfigured: hasTwilioConfig(),
    smsEnabled: isSmsAutomationEnabled(),
    ownerEmailConfigured: Boolean(ownerEmail),
    ownerPhoneConfigured: Boolean(ownerPhone),
    googleReviewConfigured: Boolean(googleReviewLink),
  };
}

async function sendEmail({ to, subject, text }) {
  if (!to) {
    return { channel: 'email', status: 'skipped', reason: 'OWNER_EMAIL is not configured' };
  }

  if (hasResendConfig()) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Colburn Outdoor Maintenance <onboarding@resend.dev>',
        to,
        subject,
        text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend email failed: ${response.status} ${detail}`);
    }

    const payload = await response.json();
    return { channel: 'email', provider: 'resend', status: 'sent', providerMessageId: payload.id };
  }

  if (!hasSmtpConfig()) {
    return { channel: 'email', status: 'skipped', reason: 'RESEND_API_KEY or SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });

  return { channel: 'email', status: 'sent' };
}

export async function sendSms({ to, body }) {
  if (!isSmsAutomationEnabled()) {
    return { channel: 'sms', status: 'disabled', reason: 'SMS automation is disabled for Phase 1. Set TWILIO_ENABLED=true after Twilio/A2P verification.' };
  }

  if (!hasTwilioConfig() || !to) {
    return { channel: 'sms', status: 'disabled', reason: 'Twilio is enabled but required Twilio env vars or recipient are missing' };
  }

  const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
  const params = new URLSearchParams({
    To: to,
    From: twilioFromNumber,
    Body: body,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Twilio SMS failed: ${response.status} ${detail}`);
  }

  const payload = await response.json();
  return { channel: 'sms', status: 'sent', providerMessageId: payload.sid };
}

function formatEstimate(lead) {
  return `$${lead.estimateLow}-$${lead.estimateHigh}`;
}

function dashboardUrl(leadId = '') {
  const baseUrl = process.env.PUBLIC_SITE_URL || 'http://127.0.0.1:5188';
  return `${baseUrl.replace(/\/$/, '')}/dashboard${leadId ? `?lead=${leadId}` : ''}`;
}

export async function notifyOwnerNewLead(lead) {
  const subject = `New Colburn Outdoor lead: ${lead.name}`;
  const text = [
    `New lead from ${lead.source}`,
    '',
    `Customer: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email || 'Not provided'}`,
    `Service: ${lead.serviceType}`,
    `Timeline: ${lead.urgency}`,
    `Estimate: ${formatEstimate(lead)}`,
    `Notes: ${lead.notes || 'None'}`,
    '',
    `Dashboard: ${dashboardUrl(lead.id)}`,
  ].join('\n');

  const results = [];
  results.push(await sendEmail({ to: ownerEmail, subject, text }));
  if (isSmsAutomationEnabled()) {
    results.push(
      await sendSms({
        to: ownerPhone,
        body: `New Colburn lead: ${lead.name}, ${lead.phone}, ${lead.serviceType}, ${formatEstimate(
          lead,
        )}. ${dashboardUrl(lead.id)}`,
      }),
    );
  }
  return results;
}

export async function notifyOwnerSmsReply({ lead, fromPhone, body }) {
  return sendSms({
    to: ownerPhone,
    body: `SMS reply from ${fromPhone}: ${body}${lead?.id ? ` ${dashboardUrl(lead.id)}` : ''}`,
  });
}

export async function sendCustomerConfirmation(lead) {
  if (String(process.env.SEND_CUSTOMER_CONFIRMATION || '').toLowerCase() !== 'true') {
    return { channel: 'sms', status: 'skipped', reason: 'Customer confirmations disabled' };
  }

  return sendSms({
    to: lead.phone,
    body:
      'Thanks for contacting Colburn Outdoor Maintenance. Your request was received. We will follow up to talk through the job and scheduling.',
  });
}

export function missedCallReplyText() {
  return (
    process.env.MISSED_CALL_REPLY ||
    'Thanks for calling Colburn Outdoor Maintenance. Sorry we missed you - what outdoor work do you need help with? You can reply here or request a quote at https://colburnoutdoor.com/#contact'
  );
}

export async function sendMissedCallReply(phone) {
  return sendSms({
    to: phone,
    body: missedCallReplyText(),
  });
}

export async function sendReviewRequest(lead) {
  if (!googleReviewLink) {
    return { channel: 'sms', status: 'skipped', reason: 'GOOGLE_REVIEW_LINK not configured' };
  }

  return sendSms({
    to: lead.phone,
    body: `Thanks for choosing Colburn Outdoor Maintenance. If you were happy with the work, would you mind leaving us a quick Google review? ${googleReviewLink}`,
  });
}
