import { ImapFlow } from "imapflow";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const senderQuery = searchParams.get("senders");
  const subjectQuery = searchParams.get("subject");
  const afterQuery = searchParams.get("after");

  const senderList = senderQuery
    ? senderQuery.split(",").map((s) => s.trim().toLowerCase())
    : [];

  const afterDate = afterQuery ? new Date(afterQuery) : null;

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

    const messages = [];

    // 최근 메일부터 검색하기 위해 UID 역순으로
    for await (let msg of client.fetch("1:*", { envelope: true })) {
      const fromAddress = msg.envelope.from?.[0]?.address?.toLowerCase() ?? "";
      const subject = msg.envelope.subject?.toLowerCase() ?? "";
      const date = new Date(msg.envelope.date);

      // ✅ 필터 조건
      const matchSender =
        senderList.length === 0 ||
        senderList.some((s) => fromAddress.includes(s));

      const matchSubject =
        !subjectQuery || subject.includes(subjectQuery.toLowerCase());

      const matchDate = !afterDate || date.getTime() >= afterDate.getTime();

      if (matchSender && matchSubject && matchDate) {
        messages.push({
          subject: msg.envelope.subject,
          from: msg.envelope.from?.[0]?.address ?? "(unknown)",
          date: msg.envelope.date,
        });
      }
    }

    await client.logout();

    // 최신순 정렬
    messages.sort((a, b) => new Date(b.date) - new Date(a.date));

    return Response.json(messages.slice(0, 30)); // 최근 30개만 반환
  } catch (error) {
    console.error("Daum Mail Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
