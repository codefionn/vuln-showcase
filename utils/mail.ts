/*
 * vuln-showcase - Showcasing some common web vulnerabilities
 * Copyright (C) 2022 Fionn Langhans
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
