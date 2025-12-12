import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Email templates
export function getPasswordResetEmailHtml(name: string, resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinir Senha</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Flame Boilerplate</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Redefinir Senha</h2>
          <p style="color: #4b5563;">Olá ${name || "Usuário"},</p>
          <p style="color: #4b5563;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Redefinir Senha</a>
          </div>
          <p style="color: #4b5563; font-size: 14px;">Este link expira em 1 hora.</p>
          <p style="color: #6b7280; font-size: 12px;">Se você não solicitou a redefinição de senha, ignore este email.</p>
        </div>
      </body>
    </html>
  `;
}

export function getInviteEmailHtml(
  inviterName: string,
  organizationName: string,
  inviteUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Convite para Organização</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Flame Boilerplate</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Você foi convidado!</h2>
          <p style="color: #4b5563;">${inviterName} convidou você para fazer parte da organização <strong>${organizationName}</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Aceitar Convite</a>
          </div>
          <p style="color: #6b7280; font-size: 12px;">Este convite expira em 7 dias.</p>
        </div>
      </body>
    </html>
  `;
}

export function getWelcomeEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Bem-vindo!</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; text-align: center;">Flame Boilerplate</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Bem-vindo ao Flame!</h2>
          <p style="color: #4b5563;">Olá ${name},</p>
          <p style="color: #4b5563;">Sua conta foi criada com sucesso! Estamos muito felizes em ter você conosco.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/dashboard" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acessar Dashboard</a>
          </div>
          <p style="color: #4b5563;">Aqui estão algumas coisas que você pode fazer:</p>
          <ul style="color: #4b5563;">
            <li>Criar sua organização</li>
            <li>Convidar membros da equipe</li>
            <li>Explorar as funcionalidades</li>
          </ul>
        </div>
      </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: "Redefinir sua senha - Flame",
    html: getPasswordResetEmailHtml(name, resetUrl),
  });
}

export async function sendInviteEmail(
  email: string,
  inviterName: string,
  organizationName: string,
  token: string
) {
  const inviteUrl = `${APP_URL}/invite/${token}`;
  return sendEmail({
    to: email,
    subject: `${inviterName} convidou você para ${organizationName}`,
    html: getInviteEmailHtml(inviterName, organizationName, inviteUrl),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Bem-vindo ao Flame!",
    html: getWelcomeEmailHtml(name),
  });
}
