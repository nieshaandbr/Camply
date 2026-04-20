import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Build the student onboarding email HTML.
 */
function buildStudentEmail({ name, studentNumber, tempPassword, appLink }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="color: #1D3E6E; margin-bottom: 8px;">Welcome to Camply</h2>
      <p>Good day ${name},</p>
      <p>
        I am pleased to inform you that you have been successfully loaded onto the Camply system.
        We hope you enjoy and make full use of the platform we've built, and we can't wait for your feedback on it.
      </p>
      <p>Please see below a link to download the Camply app along with your login details:</p>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p><strong>Link:</strong> <a href="${appLink}">${appLink}</a></p>
        <p><strong>Username:</strong> ${studentNumber}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
      </div>

      <p>
        For security, you will be asked to create a new password the first time you log in.
      </p>

      <p>Regards,<br/>Camply Team</p>
    </div>
  `;
}

/**
 * Build the admin onboarding email HTML.
 */
function buildAdminEmail({ name, email, tempPassword, adminLink }) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="color: #1D3E6E; margin-bottom: 8px;">Welcome to Camply Admin</h2>
      <p>Good day ${name},</p>
      <p>
        I am pleased to inform you that you have been successfully loaded onto the Camply admin system.
        We hope you enjoy and make full use of the platform we've built, and we can't wait for your feedback on it.
      </p>
      <p>Please see below a link to the Camply admin web app along with your login details:</p>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p><strong>Link to site:</strong> <a href="${adminLink}">${adminLink}</a></p>
        <p><strong>Username:</strong> ${email}</p>
        <p><strong>Password:</strong> ${tempPassword}</p>
      </div>

      <p>
        For security, you will be asked to create a new password the first time you log in.
      </p>

      <p>Regards,<br/>Camply Team</p>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userType,
      name,
      email,
      studentNumber,
      tempPassword,
    } = req.body || {};

    if (!userType || !name || !email || !tempPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const from = process.env.RESEND_FROM_EMAIL;
    const studentAppLink = process.env.VITE_CAMPLY_STUDENT_APP_LINK;
    const adminLink = process.env.VITE_CAMPLY_ADMIN_LINK;

    let subject = '';
    let html = '';

    if (userType === 'student') {
      subject = 'Your Camply account is ready';
      html = buildStudentEmail({
        name,
        studentNumber,
        tempPassword,
        appLink: studentAppLink,
      });
    } else if (userType === 'admin') {
      subject = 'Your Camply admin account is ready';
      html = buildAdminEmail({
        name,
        email,
        tempPassword,
        adminLink,
      });
    } else {
      return res.status(400).json({ error: 'Invalid userType' });
    }

    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend email error:', error);
      return res.status(500).json({ error: error.message || 'Email failed' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Onboarding email handler error:', error);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}