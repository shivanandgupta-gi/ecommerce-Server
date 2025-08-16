export function VerificationEmail(name, code) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hello ${name},</h2>
      <p>You requested to reset your password.</p>
      <p>Your OTP for password reset is:</p>
      <h1 style="color: #4CAF50;">${code}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <br/>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
}
