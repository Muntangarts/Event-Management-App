import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

/**
 * Initialize Ethereal transporter for testing
 */
async function initializeTransporter() {
  if (transporter) return transporter

  const etherealUser = process.env.ETHEREAL_USER
  const etherealPass = process.env.ETHEREAL_PASS

  if (!etherealUser || !etherealPass) {
    console.warn('⚠️  Ethereal credentials not set. Email sending will be mocked.')
    return null
  }

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: etherealUser,
      pass: etherealPass
    }
  })

  return transporter
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(email: string, userId: string): Promise<void> {
  const transport = await initializeTransporter()

  if (!transport) {
    console.log(`📧 [MOCK] Welcome email sent to ${email}`)
    return
  }

  const verificationLink = `http://localhost:3000/verify?token=${userId}`

  try {
    const info = await transport.sendMail({
      from: '"Event Manager" <noreply@eventmanager.com>',
      to: email,
      subject: 'Welcome to Event Manager!',
      html: `
        <h1>Welcome to Event Manager</h1>
        <p>Your account has been created successfully.</p>
        <p><a href="${verificationLink}">Verify your email</a></p>
        <p>If you did not create this account, please ignore this email.</p>
      `
    })

    console.log(`✅ Welcome email sent to ${email}`)
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
  }
}

/**
 * Send event approval notification
 */
export async function sendEventApprovalEmail(email: string, eventTitle: string): Promise<void> {
  const transport = await initializeTransporter()

  if (!transport) {
    console.log(`📧 [MOCK] Event approval email sent to ${email}`)
    return
  }

  try {
    const info = await transport.sendMail({
      from: '"Event Manager" <noreply@eventmanager.com>',
      to: email,
      subject: `Your event "${eventTitle}" has been approved!`,
      html: `
        <h1>Event Approved</h1>
        <p>Your event <strong>${eventTitle}</strong> has been approved and is now visible to attendees.</p>
      `
    })

    console.log(`✅ Event approval email sent to ${email}`)
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
  } catch (error) {
    console.error('❌ Failed to send event approval email:', error)
  }
}
