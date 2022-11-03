import { SmtpClient } from "smtp";

export async function sendMail(
  email: string,
  subject: string,
  content: string,
): Promise<boolean> {
  try {
    const client = new SmtpClient();

    await client.connect({
      hostname: "mailer",
      port: 1025,
    });

    await client.send({
      "from": "info@mailer",
      "to": email,
      subject: subject,
      content: content,
      html: content,
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
