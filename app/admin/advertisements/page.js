"use client";

import { useState, useEffect, useMemo } from "react";
import { storageService } from "@/utils/supabase/StorageService";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";

// 광고 타입 정의
const AD_TYPES = [
  { ad_type: "main_top_right", text: "메인 최상단 우측(16*7)" },
  { ad_type: "main_top_full", text: "메인 최상단 통배너(728*90)" },
  { ad_type: "main_body_one_1_middle", text: "메인 중상단 중간배너(720*144)" },
  { ad_type: "main_body_one_1_right", text: "메인 중상단 우측(16*7)" },
  { ad_type: "main_body_one_bottom_full", text: "메인 중단 통배너(720*144)" },
  { ad_type: "main_body_two_bottom_full", text: "메인 중간 통배너2(720*144)" },
  { ad_type: "main_body_one_2_middle", text: "메인 중하단 중간배너(720*144)" },
  { ad_type: "main_body_one_2_right", text: "메인 중하단 우측(16*7)" },
  {
    ad_type: "main_body_one_2_bottom_full",
    text: "메인 중하단 통배너(720*144)",
  },
  { ad_type: "main_body_two_2_bottom_full", text: "메인 하단 통배너(720*144)" },
  { ad_type: "main_bottom_full", text: "메인 최하단 통배너(720*144)" },
  {
    ad_type: "category_right_middle_1",
    text: "[카테고리]우측 중단배너1(16*7)",
  },
  {
    ad_type: "category_right_middle_2",
    text: "[카테고리]우측 중단배너2(16*7)",
  },
  {
    ad_type: "category_right_bottom_1",
    text: "[카테고리]우측 하단배너1(16*7)",
  },
  {
    ad_type: "category_right_bottom_2",
    text: "[카테고리]우측 하단배너2(16*7)",
  },
  {
    ad_type: "category_middle_1",
    text: "[카테고리]기사목록 중간배너1(728*90)",
  },
  {
    ad_type: "category_middle_2",
    text: "[카테고리]기사목록 중간배너2(728*90)(기사 더보기 클릭시 노출)",
  },
  {
    ad_type: "category_middle_3",
    text: "[카테고리]기사목록 중간배너3(728*90)(기사 더보기 클릭시 노출)",
  },
  {
    ad_type: "category_middle_4",
    text: "[카테고리]기사목록 중간배너4(728*90)(기사 더보기 클릭시 노출)",
  },
  { ad_type: "category_bottom_full", text: "[카테고리]최하단 통배너(728*90)" },
  {
    ad_type: "article_middle_full",
    text: "[기사본문]중간 통배너(728*90)",
  },
  {
    ad_type: "article_right_1",
    text: "[기사본문]우측 배너1(16*7)",
  },
  {
    ad_type: "article_right_2",
    text: "[기사본문]우측 배너2(16*7)",
  },
  {
    ad_type: "article_bottom_full",
    text: "[기사본문]최하단 통배너(728*90)",
  },
];

export default function AdEditorPage() {
  const supabase = createBrowserSupabaseClient();
  const [ads, setAds] = useState([]);
  const [adType, setAdType] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // 등록 가능한 광고 타입 필터링
  const availableAdTypes = useMemo(() => {
    return AD_TYPES.filter((type) => {
      if (editingAd && editingAd.ad_type === type.ad_type) return true;
      return !ads.some((ad) => ad.ad_type === type.ad_type);
    });
  }, [ads, editingAd]);

  useEffect(() => {
    if (!editingAd && availableAdTypes.length > 0) {
      if (!availableAdTypes.find((t) => t.ad_type === adType)) {
        setAdType(availableAdTypes[0].ad_type);
      }
    } else if (!editingAd && availableAdTypes.length === 0) {
      setAdType("");
    }
  }, [availableAdTypes, editingAd, adType]);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("ad_type", { ascending: true });

    if (error) console.error("Error fetching ads:", error);
    else setAds(data);
  };

  const handleResetForm = () => {
    setEditingAd(null);
    setTargetUrl("");
    setImageFile(null); // 이 상태 변경이 input의 value를 비우게 함
  };

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
        const newStoragePath = `admin/advertisements/${adType}/${Date.now()}.${fileExt}`;
        newImageUrl = await storageService.upload(imageFile, newStoragePath);

        if (oldImageUrl && oldImageUrl !== newImageUrl) {
          await storageService.remove(oldImageUrl);
        }
      } else {
        newImageUrl = editingAd.image_url;
      }

      const dataToSave = {
        image_url: newImageUrl,
        target_url: targetUrl || "",
        ad_type: adType,
      };

      const { error: dbError } = editingAd
        ? await supabase
            .from("advertisements")
            .update(dataToSave)
            .eq("id", editingAd.id)
        : await supabase.from("advertisements").insert([dataToSave]);

      if (dbError) throw dbError;

      alert("광고가 성공적으로 저장되었습니다.");
      await fetchAds();
      handleResetForm(); // 저장 후 폼 초기화 및 파일 필드 비우기
    } catch (error) {
      console.error("Error:", error.message);
      alert(`작업 중 오류 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId, imageUrl) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    setLoading(true);
    try {
      if (imageUrl) await storageService.remove(imageUrl);
      const { error } = await supabase
        .from("advertisements")
        .delete()
        .eq("id", adId);
      if (error) throw error;
      alert("삭제되었습니다.");
      fetchAds();
    } catch (error) {
      alert(`삭제 중 오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setAdType(ad.ad_type);
    setTargetUrl(ad.target_url || "");
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getAdTypeText = (typeValue) => {
    const typeObj = AD_TYPES.find((type) => type.ad_type === typeValue);
    return typeObj ? typeObj.text : typeValue;
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>✨ 광고 편집 관리 페이지</h1>

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

        {!editingAd && availableAdTypes.length === 0 ? (
          <p style={{ color: "red", fontWeight: "bold" }}>
            ⚠️ 모든 위치의 광고가 이미 등록되어 있습니다.
          </p>
        ) : (
          <>
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
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                disabled={loading || !!editingAd}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "100%",
                  backgroundColor: editingAd ? "#eee" : "white",
                }}
              >
                {availableAdTypes.map((type) => (
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
                /* 핵심 수정: imageFile이 null일 때 value를 ""로 강제하여 브라우저의 파일 선택 기록을 초기화함 */
                value={imageFile === null ? "" : undefined}
                onChange={(e) => setImageFile(e.target.files[0])}
                disabled={loading}
                required={!editingAd}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                이동 URL:
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: "100%",
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
              {loading
                ? "처리 중..."
                : editingAd
                ? "수정 내용 저장"
                : "새 광고 등록"}
            </button>
          </>
        )}

        {editingAd && (
          <button
            type="button"
            onClick={handleResetForm}
            disabled={loading}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ccc",
              borderRadius: "4px",
              border: "none",
            }}
          >
            편집 취소
          </button>
        )}
      </form>

      <h2>📄 현재 등록된 광고 목록 ({ads.length}개)</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#e9ecef" }}>
            <th style={tableHeaderStyle}>광고 타입</th>
            <th style={tableHeaderStyle}>이미지</th>
            <th style={tableHeaderStyle}>URL</th>
            <th style={tableHeaderStyle}>액션</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad, index) => (
            <tr
              key={ad.id}
              style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f8f9fa" }}
            >
              <td style={tableCellStyle}>
                <strong>{getAdTypeText(ad.ad_type)}</strong>
              </td>
              <td style={tableCellStyle}>
                <img
                  src={ad.image_url}
                  alt=""
                  style={{
                    maxHeight: "60px",
                    maxWidth: "100px",
                    objectFit: "contain",
                  }}
                />
              </td>
              <td style={tableCellStyle}>{ad.target_url}</td>
              <td style={tableCellStyle}>
                <button
                  onClick={() => handleEdit(ad)}
                  style={{ ...actionButtonStyle, backgroundColor: "#28a745" }}
                >
                  편집
                </button>
                <button
                  onClick={() => handleDelete(ad.id, ad.image_url)}
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

const tableHeaderStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
};
const tableCellStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  fontSize: "14px",
};
const actionButtonStyle = {
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer",
};
