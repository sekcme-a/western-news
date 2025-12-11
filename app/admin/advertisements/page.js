"use client";

// pages/index.js
import { useState, useEffect } from "react";
// 가정: '@/utils/supabase/StorageService'와 '@/utils/supabase/client'는 이미 정의되어 있음
import { storageService } from "@/utils/supabase/StorageService";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// ✨ AD_TYPES 변경: 객체 배열로 정의하여 한글 텍스트 추가
const AD_TYPES = [
  { ad_type: "main_1_right", text: "메인 우측 상단 1번" },
  { ad_type: "main_2_right", text: "메인 우측 상단 2번" },
  { ad_type: "main_3_right", text: "메인 우측 상단 3번" },
  { ad_type: "main_1_middle", text: "메인 중간 1번" },
  { ad_type: "main_2_middle", text: "메인 중간 2번" },
  { ad_type: "main_3_middle", text: "메인 중간 3번" },
];

export default function AdEditorPage() {
  const supabase = createBrowserSupabaseClient();
  const [ads, setAds] = useState([]);
  // ✨ 초기값 설정 시 첫 번째 객체의 ad_type 사용
  const [adType, setAdType] = useState(AD_TYPES[0].ad_type);
  const [targetUrl, setTargetUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // 광고 타입의 ad_type을 받아 해당 객체 전체를 반환하는 헬퍼 함수
  const getAdTypeObject = (typeValue) => {
    return AD_TYPES.find((type) => type.ad_type === typeValue);
  };

  // 광고 타입의 ad_type을 받아 한글 텍스트를 반환하는 헬퍼 함수
  const getAdTypeText = (typeValue) => {
    const typeObj = getAdTypeObject(typeValue);
    return typeObj ? typeObj.text : typeValue;
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // 1. 광고 데이터 조회 (동일)
  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("ad_type", { ascending: true });

    if (error) {
      console.error("Error fetching ads:", error);
    } else {
      setAds(data);
    }
  };

  // 2. 광고 데이터 저장 및 이미지 관리 (로직 동일)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!imageFile && !editingAd) {
      alert("이미지를 업로드해주세요.");
      return;
    }
    setLoading(true);

    let newImageUrl = null;
    let oldImageUrl = null;

    try {
      if (imageFile) {
        if (editingAd) {
          oldImageUrl = editingAd.image_url;
        } else {
          const { data: existingAd } = await supabase
            .from("advertisements")
            .select("id, image_url")
            .eq("ad_type", adType)
            .maybeSingle();
          oldImageUrl = existingAd ? existingAd.image_url : null;
        }

        const fileExt = imageFile.name.split(".").pop();
        // StoragePath 변경: ads/type/file.jpg 형태
        const newStoragePath = `admin/advertisements/${adType}/${Date.now()}.${fileExt}`;

        newImageUrl = await storageService.upload(imageFile, newStoragePath);

        if (oldImageUrl && oldImageUrl !== newImageUrl) {
          await storageService.remove(oldImageUrl);
        }
      } else {
        newImageUrl = editingAd.image_url;
      }

      let dbCall;
      const dataToSave = {
        image_url: newImageUrl,
        target_url: targetUrl || "",
        ad_type: adType,
      };

      if (editingAd) {
        dbCall = supabase
          .from("advertisements")
          .update(dataToSave)
          .eq("id", editingAd.id);
      } else {
        dbCall = supabase.from("advertisements").insert([dataToSave]);
      }

      const { error: dbError } = await dbCall;

      if (dbError) {
        if (imageFile && newImageUrl) {
          await storageService.remove(newImageUrl);
        }
        throw dbError;
      }

      alert("광고가 성공적으로 저장/업데이트되었습니다.");
      fetchAds();
      handleResetForm();
    } catch (error) {
      console.error("Error during save operation:", error.message);
      alert(`작업 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. 광고 삭제 (동일)
  const handleDelete = async (adId, imageUrl) => {
    if (
      !confirm(
        "정말로 이 광고를 삭제하시겠습니까? 관련 이미지 파일도 함께 삭제됩니다."
      )
    ) {
      return;
    }
    setLoading(true);

    try {
      if (imageUrl) {
        await storageService.remove(imageUrl);
      }

      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", adId);

      if (error) {
        throw error;
      }

      alert("광고가 성공적으로 삭제되었습니다.");
      fetchAds();
    } catch (error) {
      console.error("Error deleting ad:", error.message);
      alert(`광고 삭제 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. 편집 모드 설정 (동일)
  const handleEdit = (ad) => {
    setEditingAd(ad);
    setAdType(ad.ad_type);
    setTargetUrl(ad.target_url || "");
    setImageFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 5. 폼 초기화 (동일)
  const handleResetForm = () => {
    setEditingAd(null);
    setAdType(AD_TYPES[0].ad_type); // ✨ 초기값 변경
    setTargetUrl("");
    setImageFile(null);
  };

  const submitButtonText = editingAd ? "수정 내용 저장" : "새 광고 등록";

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>✨ 광고 편집 관리 페이지</h1>

      {/* --- 광고 추가/수정 폼 --- */}
      <form
        onSubmit={handleSave}
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "8px",
          backgroundColor: editingAd ? "#fffbe6" : "#f9f9f9",
        }}
      >
        <h3>
          {editingAd
            ? `광고 수정: ${getAdTypeText(editingAd.ad_type)}`
            : "새 광고 등록"}
        </h3>

        {editingAd && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            **주의:** 파일을 선택하지 않으면 기존 이미지가 유지됩니다.
          </p>
        )}

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            광고 타입:
          </label>
          {/* ✨ SELECT 옵션 변경 */}
          <select
            value={adType}
            onChange={(e) => setAdType(e.target.value)}
            disabled={loading || editingAd}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: editingAd ? "#eee" : "white",
            }}
          >
            {AD_TYPES.map((type) => (
              // value는 DB에 저장되는 ad_type, 사용자에게는 text를 보여줌
              <option key={type.ad_type} value={type.ad_type}>
                {type.text}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            이미지/GIF 파일:
          </label>
          <input
            type="file"
            accept="image/*,.gif"
            onChange={(e) => setImageFile(e.target.files[0])}
            disabled={loading}
            required={!editingAd}
          />
          {imageFile && (
            <p style={{ fontSize: "12px", color: "#555" }}>
              선택된 새 파일: **{imageFile.name}**
            </p>
          )}
          {editingAd && !imageFile && (
            <p style={{ fontSize: "12px", color: "blue" }}>
              현재 이미지 URL: **{editingAd.image_url.substring(0, 50)}...**
              (파일 미선택 시 유지됨)
            </p>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            클릭 시 이동할 URL:
          </label>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          {loading ? "처리 중..." : submitButtonText}
        </button>

        {editingAd && (
          <button
            type="button"
            onClick={handleResetForm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ccc",
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            편집 취소
          </button>
        )}
      </form>

      {/* --- 기존 광고 목록 --- */}
      <h2>📄 현재 등록된 광고 목록</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#e9ecef" }}>
            <th style={tableHeaderStyle}>광고 타입 (한글)</th> {/* ✨ 변경 */}
            <th style={tableHeaderStyle}>이미지 미리보기</th>
            <th style={tableHeaderStyle}>이동 URL</th>
            <th style={tableHeaderStyle}>액션</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad, index) => (
            <tr
              key={ad.id}
              style={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                outline:
                  editingAd && editingAd.id === ad.id
                    ? "2px solid orange"
                    : "none",
              }}
            >
              {/* ✨ getAdTypeText 헬퍼 함수를 사용하여 한글 표시 */}
              <td style={tableCellStyle}>**{getAdTypeText(ad.ad_type)}**</td>
              <td style={tableCellStyle}>
                <img
                  src={ad.image_url}
                  alt={ad.ad_type}
                  style={{
                    maxHeight: "100px",
                    maxWidth: "100px",
                    objectFit: "contain",
                  }}
                />
              </td>
              <td style={tableCellStyle}>
                <a
                  href={ad.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {ad.target_url.substring(0, 50)}...
                </a>
              </td>
              <td style={tableCellStyle}>
                <button
                  onClick={() => handleEdit(ad)}
                  disabled={loading}
                  style={{ ...actionButtonStyle, backgroundColor: "#28a745" }}
                >
                  편집
                </button>
                <button
                  onClick={() => handleDelete(ad.id, ad.image_url)}
                  disabled={loading}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: "#dc3545",
                    marginLeft: "5px",
                  }}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 테이블 스타일 정의 (동일)
const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
};

const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  wordBreak: "break-all",
};

const actionButtonStyle = {
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
};
