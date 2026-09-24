import nodemailer from 'nodemailer'

type SmtpConfig = {
  host: string
  port: number
  user: string
  password: string
  from: string
}

export function createMailer(config: SmtpConfig) {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  })
  return async (email: string, resetUrl: string) => {
    await transport.sendMail({
      from: config.from,
      to: email,
      subject: 'Atur ulang kata sandi Replate',
      text: `Buka tautan ini untuk mengatur ulang kata sandi Anda (berlaku 30 menit): ${resetUrl}`,
    })
  }
}
