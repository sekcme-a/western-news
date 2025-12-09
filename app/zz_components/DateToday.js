export default function DateToday() {
  const options = {
    year: "numeric", // '2025년'
    month: "long", // '10월'
    day: "numeric", // '9일'
    weekday: "long", // '목요일'
  };

  return (
    <p className="text-right text-xs my-1.5 text-gray-400 hidden md:block">
      {new Date().toLocaleString("ko-KR", options)}asdf
    </p>
  );
}
