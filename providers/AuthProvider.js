// "use client";

// import { createBrowserSupabaseClient } from "@/utils/supabase/client";
// import { useState, useEffect, createContext, useContext, useRef } from "react";

// const AuthContext = createContext({
//   user: null,
//   session: null,
//   profile: null,
//   isLoading: true,
// });

// export const AuthProvider = ({ children }) => {
//   const supabaseRef = useRef(createBrowserSupabaseClient());
//   const supabase = supabaseRef.current;

//   const [session, setSession] = useState(null);
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isFetchingProfile, setIsFetchingProfile] = useState(false); // ✅ 추가

//   // ✅ 초기 세션 불러오기
//   useEffect(() => {
//     const getInitialSession = async () => {
//       const { data, error } = await supabase.auth.getSession();
//       if (error) console.error("❌ Failed to get session:", error);

//       setSession(data.session);
//       setUser(data.session?.user ?? null);
//       setIsLoading(false);
//     };

//     getInitialSession();

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (session?.user?.id === user?.id) return; // 동일 유저면 무시
//       setSession(session);
//       setUser(session?.user ?? null);
//       // ✅ 같은 유저일 경우 프로필 초기화하지 않음
//       if (session?.user?.id !== user?.id) {
//         setProfile(null);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []); // ✅ supabase 의존성 제거

//   // ✅ 프로필 가져오기
//   useEffect(() => {
//     if (!user || profile || isFetchingProfile) return; // ✅ 중복 호출 방지

//     const fetchProfile = async () => {
//       setIsFetchingProfile(true);
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("id", user.id)
//         .single();

//       if (error) {
//         console.error("❌ Failed to fetch profile:", error);
//       } else {
//         setProfile(data);
//       }

//       setIsFetchingProfile(false);
//       setIsLoading(false);
//     };

//     fetchProfile();
//   }, [user, profile, isFetchingProfile]);

//   return (
//     <AuthContext.Provider value={{ user, session, profile, isLoading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// components/AuthProvider.js
// components/AuthProvider.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

const AuthContext = createContext(undefined);

export default function AuthProvider({ children }) {
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // profiles 데이터를 가져오는 함수 (재사용 가능하도록 분리)
  const fetchProfile = async (userId, userEmail) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Client Profile Fetch Error:", error);
      setProfile(null);
    } else {
      setProfile({
        id: userId,
        email: userEmail,
        ...data,
      });
    }
  };

  // 첫 번째 useEffect: 실시간 인증 상태 변화만 감지
  useEffect(() => {
    // onAuthStateChange를 통해 실시간 인증 상태 변화 감지 및 동기화
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      const currentUser = currentSession?.user || null;

      setSession(currentSession);
      setUser(currentUser);

      // **중요**: 인증 상태 변화(로그인/로그아웃)가 있을 때만 프로필 초기화/재요청
      if (currentUser) {
        // 로그인 시: user 상태가 변경되므로 아래 두 번째 useEffect에서 처리
      } else {
        // 로그아웃 시: profile 상태를 명확히 null로 설정
        setProfile(null);
        setIsLoading(false);
      }
    });

    // 최초 로드 시 현재 세션을 확인하고 상태를 설정
    const loadInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      const initialUser = initialSession?.user || null;
      setSession(initialSession);
      setUser(initialUser);

      // 로딩 상태는 user 상태 변경을 감지하는 다음 useEffect에서 최종적으로 해제
    };

    loadInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  // 두 번째 useEffect: user 상태가 변경되었고 profile 데이터가 필요할 때만 호출
  // **핵심**: user가 있고, profile이 아직 없거나 (최초 로드), user.id가 변경되었을 때만 호출
  useEffect(() => {
    if (user && !profile) {
      // **필요할 때만 fetchProfile 호출**
      fetchProfile(user.id, user.email).finally(() => setIsLoading(false));
    } else if (user && profile && user.id !== profile.id) {
      // 혹시 모를 ID 불일치 상황 대비 (거의 일어나지 않음)
      fetchProfile(user.id, user.email).finally(() => setIsLoading(false));
    } else if (!user) {
      setProfile(null);
      setIsLoading(false);
    } else {
      // user가 있고 profile도 이미 로드되었을 때 (페이지 이동, useState 변경 등)
      setIsLoading(false);
    }
  }, [user, profile]); // user나 profile 상태가 변경될 때 실행

  return (
    <AuthContext.Provider value={{ user, profile, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
