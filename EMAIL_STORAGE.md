# Email Storage and Sending

## Current Implementation

### Storage Location
Emails are currently stored in **browser localStorage** under the key `realnessScore_emails`.

Each email entry contains:
```json
{
  "email": "user@example.com",
  "optIn": true,
  "timestamp": "2025-11-17T12:00:00.000Z",
  "archetype": {
    "id": 1,
    "name": "The Resonant Sage",
    "shortTag": "Wise Regulator",
    "description": "..."
  },
  "domainScores": {
    "A": 45,
    "B": 32,
    "C": 28,
    "D": 41
  },
  "levels": {
    "A": 4,
    "B": 3,
    "C": 2,
    "D": 4
  },
  "resultsUrl": "https://realness-score.web.app/?archetype=1&A=4&B=3&C=2&D=4"
}
```

### Current Behavior
- Emails are collected before showing results
- User can opt-in to receive updates (checkbox)
- Privacy notice mentions unsubscribe option
- Email data is saved to localStorage
- Console log shows email data (for development)
- **No actual emails are sent yet**

## To Implement Email Sending

You need to set up a backend service to actually send emails. Here are your options:

### Option 1: Firebase Functions + SendGrid/Mailgun
1. Set up Firebase Cloud Functions
2. Use SendGrid, Mailgun, or Amazon SES for email delivery
3. Update `sendResultsEmail()` in `app.js` to call your function:

```javascript
await fetch('https://us-central1-realness-score.cloudfunctions.net/sendResults', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(emailData)
});
```

4. Create a Firebase Function:
```javascript
exports.sendResults = functions.https.onRequest(async (req, res) => {
  const emailData = req.body;
  
  // Send email using SendGrid/Mailgun
  await sendEmailService.send({
    to: emailData.email,
    subject: `Your Realness Score: ${emailData.archetype.name}`,
    html: generateEmailTemplate(emailData),
    unsubscribeUrl: `${process.env.APP_URL}/unsubscribe?email=${emailData.email}`
  });
  
  // Store in Firestore for analytics
  await admin.firestore().collection('emails').add(emailData);
  
  res.json({ success: true });
});
```

### Option 2: Use a Simple Email Service
- **EmailJS**: Client-side email sending (easiest, but limited)
- **Formspree**: Form backend service
- **SendGrid Web API**: Direct API calls (requires exposing API key)

### Option 3: Build Custom Backend
- Node.js + Express
- Use nodemailer for SMTP
- Store emails in PostgreSQL/MongoDB
- Deploy to Heroku, Railway, or Vercel

## Email Template Requirements

The email should include:
- Archetype name and description
- Domain scores visualization
- Link back to full results
- Unsubscribe link
- Branding from Dr. Conkright

## Unsubscribe Implementation

To comply with email best practices and CAN-SPAM:

1. **Create an unsubscribe endpoint**:
```javascript
exports.unsubscribe = functions.https.onRequest(async (req, res) => {
  const email = req.query.email;
  
  await admin.firestore().collection('unsubscribed').add({
    email: email,
    timestamp: new Date().toISOString()
  });
  
  res.send('You have been unsubscribed.');
});
```

2. **Check opt-in status before sending**:
```javascript
// Before sending emails, check if user has opted in
if (!emailData.optIn) {
  // Don't add to marketing list
}

// Check unsubscribe list
const unsubscribed = await checkUnsubscribeList(emailData.email);
if (unsubscribed) {
  // Don't send
}
```

## Accessing Stored Emails (Development)

To view all stored emails in browser console:
```javascript
const emails = JSON.parse(localStorage.getItem('realnessScore_emails') || '[]');
console.table(emails);
```

## Migration to Database

For production, you should migrate from localStorage to a database:

1. **Firestore** (recommended for Firebase Hosting)
2. **Supabase** (PostgreSQL)
3. **MongoDB Atlas**
4. **Planet Scale** (MySQL)

## Next Steps

1. Choose an email service provider
2. Set up backend function/endpoint
3. Update `sendResultsEmail()` function in `app.js`
4. Create email template (HTML)
5. Implement unsubscribe endpoint
6. Test email delivery
7. Set up proper email list management
8. Add analytics for email delivery rates

## Cost Estimates

- **SendGrid**: Free tier: 100 emails/day
- **Mailgun**: Free tier: 5,000 emails/month
- **Firebase Functions**: Free tier: 2M invocations/month
- **Postmark**: 100 emails/month free

## Compliance

Remember to comply with:
- **CAN-SPAM Act** (US)
- **GDPR** (EU)
- **CASL** (Canada)

Requirements:
- Easy unsubscribe mechanism
- Physical mailing address in emails
- Honor unsubscribe requests within 10 days
- Clear identification of sender

