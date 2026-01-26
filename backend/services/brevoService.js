const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const TEMPLATE_ID = 1; // <-- replace with your template ID

async function sendVerificationEmail(email, firstName, token) {
  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      to: [{ email, name: firstName }],
      templateId: TEMPLATE_ID,
      params: {
        token
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

module.exports = sendVerificationEmail;
