import { ImapFlow } from "imapflow";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'hwp' or 'image'
  const subjectQuery = searchParams.get("subject");
  const fromQuery = searchParams.get("from");
  const dateQuery = searchParams.get("date");

  const targetDate = dateQuery ? new Date(dateQuery) : null;

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

    let targetUid = null;

    // ✅ 조건에 맞는 메일 UID 찾기
    for await (let msg of client.fetch("1:*", { envelope: true })) {
      const fromAddress = msg.envelope.from?.[0]?.address ?? "";
      const subject = msg.envelope.subject ?? "";
      const date = new Date(msg.envelope.date);

      const matchFrom = fromQuery ? fromAddress === fromQuery : true;
      const matchSubject = subjectQuery ? subject === subjectQuery : true;
      const matchDate = targetDate ? Math.abs(date - targetDate) < 2000 : true; // 2초 이내

      if (matchFrom && matchSubject && matchDate) {
        targetUid = msg.uid;
        break;
      }
    }

    if (!targetUid) {
      await client.logout();
      return new Response(JSON.stringify({ files: [] }), { status: 200 });
    }

    // ✅ 첨부파일 메타데이터 가져오기
    const attachments = [];
    const messageStructure = await client.fetchOne(targetUid, {
      source: false,
      bodyStructure: true,
    });

    // bodyStructure에서 첨부 파트 탐색
    const traverseParts = (part) => {
      if (!part) return [];
      if (part.disposition === "attachment" || part.disposition === "inline")
        return [part];
      if (part.childNodes) {
        return part.childNodes.flatMap(traverseParts);
      }
      return [];
    };

    const attachmentParts = traverseParts(messageStructure.bodyStructure);

    // ✅ 각 첨부파일 다운로드
    for (const part of attachmentParts) {
      const filename =
        part.parameters?.name ||
        part.dispositionParameters?.filename ||
        "unknown";
      const contentType = part.type + "/" + part.subtype;

      if (type === "hwp" && !filename.toLowerCase().endsWith(".hwp")) continue;
      if (type === "image" && !contentType.startsWith("image/")) continue;

      const { content } = await client.download(targetUid, part.part);
      const buffer = await streamToBuffer(content);
      attachments.push({
        filename,
        data: buffer.toString("base64"),
      });
    }

    await client.logout();

    return new Response(JSON.stringify({ files: attachments }), {
      status: 200,
    });
  } catch (err) {
    console.error("Download Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

// ✅ stream → buffer 변환 함수
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
