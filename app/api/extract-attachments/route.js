// /app/api/extract-attachments/route.js

import { ImapFlow } from "imapflow";
import { Writable } from "stream";

// ImapFlow 스트림 데이터를 Base64로 변환하는 헬퍼 함수
function streamToBase64(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    stream.pipe(writable);

    stream.on("error", reject);
    writable.on("error", reject);
    writable.on("finish", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer.toString("base64"));
    });
  });
}

export async function POST(request) {
  // 환경 변수 검증 (필수)
  if (!process.env.DAUM_EMAIL || !process.env.DAUM_APP_PASSWORD) {
    return Response.json(
      { error: "IMAP 인증 정보가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const { uid } = await request.json(); // 클라이언트로부터 메일 UID를 받음

  if (!uid) {
    return Response.json(
      { error: "UID가 제공되지 않았습니다." },
      { status: 400 }
    );
  }

  const client = new ImapFlow({
    host: "imap.daum.net",
    port: 993,
    secure: true,
    auth: {
      user: process.env.DAUM_EMAIL,
      pass: process.env.DAUM_APP_PASSWORD,
    },
    timeouts: {
      socket: 30000,
    },
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    // 1. 해당 UID의 메일 구조(attachments 포함)를 가져옴
    const message = await client.fetchOne(
      uid,
      { envelope: true, bodyStructure: true },
      { uid: true }
    );

    if (!message) {
      await client.logout();
      return Response.json(
        { error: `UID ${uid}의 메일을 찾을 수 없습니다.` },
        { status: 404 }
      );
    }

    // 2. 전체 메일 데이터를 가져옴 (첨부파일 내용 포함)
    const parser = await client.fetchOne(
      uid,
      {
        body: true,
      },
      { uid: true }
    );

    const attachments = [];

    // 3. 메시지 파서에서 첨부파일 데이터를 추출
    for (const attachment of parser.attachments) {
      // content가 존재하고, 파일 이름이 있으며, content-disposition이 attachment인 경우 (일반적인 첨부파일)
      if (
        attachment.content &&
        attachment.filename &&
        attachment.disposition?.type.toUpperCase() === "ATTACHMENT"
      ) {
        let contentBase64;

        if (attachment.content instanceof Buffer) {
          contentBase64 = attachment.content.toString("base64");
        } else if (typeof attachment.content.pipe === "function") {
          contentBase64 = await streamToBase64(attachment.content);
        } else {
          continue;
        }

        attachments.push({
          filename: attachment.filename,
          contentType: attachment.contentType || "application/octet-stream",
          content: contentBase64, // Base64 인코딩된 데이터
        });
      }
    }

    await client.logout();

    // 4. 추출된 첨부파일 목록을 클라이언트에 반환
    return Response.json({
      subject: message.envelope.subject,
      from: message.envelope.from?.[0]?.address ?? "(unknown)",
      date: message.envelope.date,
      uid: uid,
      attachments: attachments,
    });
  } catch (error) {
    console.error("Attachment Extraction Error:", error);
    try {
      await client.logout();
    } catch (e) {
      // 무시
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
