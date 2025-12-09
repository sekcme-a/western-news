import AuthForm from "./components/AuthForm";
import PasswordReset from "./components/PasswordReset";
import SocialLogin from "./components/SocialLogin";

const Login = () => {
  return (
    <>
      <AuthForm />
      {/* 비밀번호 찾기 폼 (선택적으로 분리된 페이지에 배치 가능) */}
      <div className="mt-8">
        <PasswordReset />
      </div>
      <SocialLogin />
    </>
  );
};

export default Login;
