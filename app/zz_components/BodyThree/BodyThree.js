import Articles from "./Articles";

export default function BodyThree({ categorys = [] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-10 mt-10 border-t-[1px] border-[#e6e6e6]">
      {categorys.map((category) => (
        <Articles categorySlug={category.slug} categoryName={category.name} />
      ))}
    </div>
  );
}
