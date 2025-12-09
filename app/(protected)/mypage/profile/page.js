import MyPageNavbar from "../components/MypageNavbar";

export default function ProfilePage() {
  return (
    <div className="md:mx-[4vw] lg:mx-[7vw]">
      <div className="lg:mx-32">
        <MyPageNavbar selectedMenu="프로필" />
      </div>
    </div>
  );
}
