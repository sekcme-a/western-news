const DATA = {
  NAME: `서부뉴스`,
  DESCRIPTION: `서부 뉴스에서 실시간 속보와 핵심 정보를 놓치지 마세요, 가장 빠르고 정확한 오늘의 주요 뉴스 신문. `,
  URL: `https://western-news.co.kr`,
};

const metadata = {
  metadataBase: new URL(DATA.URL),
  title: `${DATA.NAME}`,
  title: {
    default: `${DATA.NAME}`,
    template: `%s | ${DATA.NAME}`,
  },
  description: DATA.DESCRIPTION,
  keywords: `${DATA.NAME}, 서부, 뉴스, 신문`,
  openGraph: {
    title: `${DATA.NAME}`,
    description: DATA.DESCRIPTION,
    url: DATA.URL,
    siteName: DATA.NAME,
    images: [
      {
        url: `${DATA.URL}/images/og_logo.png`,
        width: 1200,
        height: 630,
        alt: `${DATA.NAME} 대표 이미지`,
      },
    ],
    type: `website`,
  },
  twitter: {
    title: DATA.NAME,
    description: DATA.DESCRIPTION,
    images: [`${DATA.URL}/images/og_logo.png`],
  },
};

export default metadata;
