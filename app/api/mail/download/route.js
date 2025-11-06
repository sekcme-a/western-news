// app/api/download/route.js
import { ImapFlow } from "imapflow";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = parseInt(searchParams.get("uid"));
  const filename = searchParams.get("filename");

  const client = new ImapFlow({
    host: "imap.daum.net",
    port: 993,
    secure: true,
    auth: {
      user: process.env.DAUM_EMAIL,
      pass: process.env.DAUM_APP_PASSWORD,
    },
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    let fileBuffer = null;
    for await (let part of client.download(uid, { source: true })) {
      if (part.filename === filename) {
        fileBuffer = Buffer.from(await part.content.arrayBuffer());
        break;
      }
    }

    await client.logout();

    if (!fileBuffer) return new Response("파일 없음", { status: 404 });

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
