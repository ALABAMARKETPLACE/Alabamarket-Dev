import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const mailerPort = Number(process.env.MAILER_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: mailerPort,
  secure: mailerPort === 465, // SSL for 465, STARTTLS for 587
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message, productName, storeName } =
      await request.json();

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    const toEmail = "customerservice@alabamarketplace.ng";

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
        <div style="background:linear-gradient(135deg,#ff5f15,#ff8c42);padding:28px 32px;">
          <h2 style="color:#fff;margin:0;font-size:20px;">New Product Enquiry</h2>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Sent from Alaba Marketplace product page</p>
        </div>
        <div style="padding:28px 32px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
            <tr>
              <td style="padding:8px 0;font-weight:600;color:#6b7280;width:120px;">Subject</td>
              <td style="padding:8px 0;text-transform:capitalize;">${subject}</td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:8px 0;font-weight:600;color:#6b7280;">Name</td>
              <td style="padding:8px 0;">${name}</td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:8px 0;font-weight:600;color:#6b7280;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#ff5f15;">${email}</a></td>
            </tr>
            <tr style="border-top:1px solid #f3f4f6;">
              <td style="padding:8px 0;font-weight:600;color:#6b7280;">Phone</td>
              <td style="padding:8px 0;">${phone}</td>
            </tr>
            ${productName ? `<tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0;font-weight:600;color:#6b7280;">Product</td><td style="padding:8px 0;">${productName}</td></tr>` : ""}
            ${storeName ? `<tr style="border-top:1px solid #f3f4f6;"><td style="padding:8px 0;font-weight:600;color:#6b7280;">Store</td><td style="padding:8px 0;">${storeName}</td></tr>` : ""}
          </table>
          <div style="margin-top:20px;padding:16px;background:#fafafa;border-radius:8px;border:1px solid #f0f0f0;">
            <p style="font-weight:600;color:#6b7280;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.8px;">Message</p>
            <p style="color:#1a1a2e;font-size:14px;line-height:1.7;margin:0;white-space:pre-line;">${message}</p>
          </div>
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f0f0f0;font-size:12px;color:#9ca3af;">
            Reply directly to this email to respond to ${name}.
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Alaba Marketplace" <${process.env.MAILER_USER}>`,
      to: toEmail,
      replyTo: email,
      subject: `Product Enquiry: ${productName ?? subject}`,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Enquiry email error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 },
    );
  }
}
