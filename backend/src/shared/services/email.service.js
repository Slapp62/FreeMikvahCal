const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const VERIFICATION_TEMPLATE_ID = Number(process.env.BREVO_VERIFICATION_TEMPLATE_ID || 1);
const PASSWORD_RESET_TEMPLATE_ID = Number(process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID || 2);

async function sendVerificationEmail(email, firstName, code) {
  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      to: [{ email, name: firstName }],
      templateId: VERIFICATION_TEMPLATE_ID,
      params: {
        FIRSTNAME: firstName,
        code: code // Make sure your template uses {{ params.code }}
      },
      sender: {
        email: 'no-reply@freemikvahcal.com',
        name: 'FreeMikvahCal'
      }
    },
    {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
}

async function sendPasswordResetEmail(email, firstName, code) {
  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      to: [{ email, name: firstName }],
      templateId: PASSWORD_RESET_TEMPLATE_ID,
      params: {
        FIRSTNAME: firstName,
        code
      },
      sender: {
        email: 'no-reply@freemikvahcal.com',
        name: 'FreeMikvahCal'
      }
    },
    {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
