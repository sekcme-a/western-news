export const MENU = [
  {
    text: "대쉬보드",
    link: "/",
  },

  {
    text: "기사 관리",
    items: [
      {
        text: "기사 목록",
        link: "/articles/list",
      },
      {
        text: "안산 보도자료",
        link: "/routine/ansan",
      },
      {
        text: "시흥 보도자료",
        link: "/routine/sihueng",
      },
    ],
  },
  {
    text: "카테고리 관리",
    link: "/categories",
  },
  {
    text: "오늘의 루틴",
    link: "/routine",
  },
  {
    text: "광고(배너) 관리",
    link: "/advertisements",
  },
];
