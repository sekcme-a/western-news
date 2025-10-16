export default function NoResult({ input }) {
  return (
    <div className="w-full flex justify-center mt-24">
      <p>{`"${input}"에 대한 검색결과가 없습니다.`}</p>
    </div>
  );
}
