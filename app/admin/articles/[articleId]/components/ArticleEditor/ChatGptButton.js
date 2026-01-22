import { useAuth } from "@/providers/AuthProvider";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";

const AITEXT = `"아래 보도자료를 기사 형태로 다듬어줘. 내용이나 사실관계는 100% 동일하게 유지하되, 다작성 시 아래의 원칙을 반드시 지켜야 해.

1. 내용 유지: 보도자료에 없는 사실을 추가하거나, 있는 사실을 삭제하지 말 것.

2. 과장된 표현 금지: 보도자료의 내용보다 더 과장된 표현을 쓰지 말 것."

3. 문장 꾸미기 금지: 표, 목차 등을 포함하지 않고 제목/내용만 있는 기사"


[보도자료 내용]
`;

export default function ChatGptButton({ title, content }) {
  const supabase = createBrowserSupabaseClient();
  const { user } = useAuth();

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user) fetchUserRole();
  }, [user]);
  const fetchUserRole = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("members")
      .select("role")
      .eq("user_id", user.id)
      .single();

    setUserRole(data?.role || null);
  };

  if (userRole === "super_admin")
    return (
      <Button
        variant="outlined"
        sx={{ my: 1, ml: 2 }}
        color="secondary"
        onClick={() =>
          navigator.clipboard.writeText(
            `${AITEXT}\n제목: ${title}\n\n\n내용: ${content}`,
          )
        }
      >
        제미니 내용 복사
      </Button>
    );
}
