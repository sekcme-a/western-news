import { ImapFlow } from "imapflow";

// 파일 확장자별 MIME 타입 또는 확장자 확인 함수
function checkFileType(filename, fileType) {
  const name = filename.toLowerCase();

  if (fileType === "hwp") {
    // 한글 파일 (hwp)
    return name.endsWith(".hwp");
  }

  if (fileType === "image") {
    // 일반적인 이미지 파일 확장자
    return (
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png") ||
      name.endsWith(".gif")
    );
  }

  return false;
}

export async function POST(request) {
  const { mailInfo, fileType } = await request.json();

  if (!mailInfo || !fileType) {
    return Response.json(
      { error: "필수 정보가 누락되었습니다." },
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
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const attachments = [];

    // 🚨 메일을 찾기 위한 검색 조건 설정
    const searchOptions = {
      from: mailInfo.from,
      subject: mailInfo.subject,
      // from, subject가 동일한 메일이 여러 개 있을 수 있으므로,
      // 날짜를 기준으로 가장 근접한 메일을 찾는 것이 현실적입니다.
      // 여기서는 간단히 from/subject/date가 일치하는 메일을 찾습니다.
      // date는 날짜만 사용하도록 변환 (시간이 다를 수 있으므로)
      since: new Date(mailInfo.date).toDateString(),
    };

    // ImapFlow의 search 기능을 사용하거나, GET 라우트처럼 전체 순회 후 조건을 걸 수 있습니다.
    // 여기서는 GET 라우트와 유사하게 전체 순회 후 조건 일치 여부를 확인합니다. (정확한 일치를 위해)
    // 실제로는 UID를 사용해야 가장 정확하게 찾을 수 있습니다.

    // ⛔️ 주의: UID가 없는 경우, 아래처럼 찾으면 동일한 제목/보낸이/날짜의 메일이 여러 개일 때 오작동할 수 있습니다.
    for await (let msg of client.fetch("1:*", {
      envelope: true,
      bodyStructure: true,
      uid: true,
    })) {
      const msgDate = new Date(msg.envelope.date);

      // 프론트엔드에서 보낸 정보와 정확히 일치하는 메일을 찾습니다.
      const isMatch =
        msg.envelope.subject === mailInfo.subject &&
        msg.envelope.from?.[0]?.address === mailInfo.from &&
        msgDate.getTime() === new Date(mailInfo.date).getTime();

      if (isMatch) {
        // 메일을 찾았으면, 첨부파일을 가져옵니다.
        for (const part of msg.bodyStructure.childNodes || []) {
          if (part.disposition && part.disposition.type === "attachment") {
            // 요청한 파일 타입과 일치하는지 확인
            if (checkFileType(part.disposition.params.filename, fileType)) {
              // 첨부파일 스트림 가져오기
              const contentStream = await client.getStream(msg.uid, part.part);

              // 스트림 데이터를 버퍼로 변환
              const buffers = [];
              for await (const chunk of contentStream) {
                buffers.push(chunk);
              }
              const contentBuffer = Buffer.concat(buffers);

              // 클라이언트로 전송하기 위해 Base64로 인코딩
              attachments.push({
                filename: part.disposition.params.filename,
                content: contentBuffer.toString("base64"),
              });
            }
          }
        }
        // 찾았으므로 더 이상 검색하지 않고 종료
        break;
      }
    }

    await client.logout();

    return Response.json(attachments);
  } catch (error) {
    console.error("Attachment Download Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
