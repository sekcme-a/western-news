// utils/StorageService.js

import { createBrowserSupabaseClient } from "./client";

const BUCKET_NAME = "public-bucket"; // 사용할 Supabase Storage 버킷 이름을 정의합니다.

/**
 * Supabase Storage 관련 작업을 처리하는 재사용 가능한 서비스 클래스.
 */
class StorageService {
  constructor(bucketName = BUCKET_NAME) {
    const supabase = createBrowserSupabaseClient();
    this.bucketName = bucketName;
    this.storage = supabase.storage.from(this.bucketName);
  }

  /**
   * 공개 URL에서 Supabase Storage 내의 파일 경로를 추출합니다.
   * @param {string} publicUrl - 파일의 공개 URL.
   * @returns {string | null} - 스토리지 내 파일 경로 (예: folder/filename.jpg).
   */
  getStoragePath(publicUrl) {
    if (!publicUrl) return null;
    try {
      const url = new URL(publicUrl);
      const path = url.pathname;
      // '/bucketName/' 이후의 경로를 추출합니다.
      const pathSegments = path.split(`/${this.bucketName}/`);
      return pathSegments.length > 1 ? pathSegments.pop() : null;
    } catch (e) {
      console.error("Invalid URL for path extraction:", publicUrl);
      return null;
    }
  }

  /**
   * 새 파일을 지정된 경로에 업로드하고 공개 URL을 반환합니다.
   * @param {File} file - 업로드할 File 객체.
   * @param {string} storagePath - 스토리지 내에 저장할 경로와 파일명 (예: ad_type/file.jpg).
   * @param {Object} options - Supabase upload 옵션 (예: { cacheControl: '3600' }).
   * @returns {Promise<string>} - 새로 업로드된 파일의 공개 URL.
   * @throws {Error} - 업로드 실패 시.
   */
  async upload(file, storagePath, options = {}) {
    if (!file || !storagePath) {
      throw new Error("File and storagePath are required for upload.");
    }

    const { error } = await this.storage.upload(storagePath, file, {
      upsert: false, // 덮어쓰기 허용 여부는 update 메서드에서 처리
      ...options,
    });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data } = this.storage.getPublicUrl(storagePath);
    return data.publicUrl;
  }

  /**
   * 기존 파일을 덮어쓰고 공개 URL을 반환합니다 (업데이트).
   * @param {File} file - 덮어쓸 새 File 객체.
   * @param {string} storagePath - 기존 파일의 스토리지 경로.
   * @returns {Promise<string>} - 업데이트된 파일의 공개 URL.
   * @throws {Error} - 업데이트 실패 시.
   */
  async update(file, storagePath) {
    if (!file || !storagePath) {
      throw new Error("File and storagePath are required for update.");
    }

    // upsert: true를 사용하여 기존 파일을 덮어씁니다.
    const { error } = await this.storage.upload(storagePath, file, {
      upsert: true,
    });

    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }

    const { data } = this.storage.getPublicUrl(storagePath);
    return data.publicUrl;
  }

  /**
   * Supabase Storage에서 파일을 삭제합니다.
   * @param {string} publicUrlOrPath - 파일의 공개 URL 또는 스토리지 경로.
   * @returns {Promise<boolean>} - 삭제 성공 여부.
   * @throws {Error} - 삭제 실패 시.
   */
  async remove(publicUrlOrPath) {
    const path = this.getStoragePath(publicUrlOrPath) || publicUrlOrPath;

    if (!path) {
      console.warn("Attempted to remove with null path.");
      return false;
    }

    // remove 메서드는 배열을 인자로 받습니다.
    const { error } = await this.storage.remove([path]);

    if (error) {
      // 파일을 찾을 수 없는 경우 (404)는 성공으로 간주할 수 있습니다.
      if (error.message.includes("The resource was not found")) {
        console.warn(
          `File not found, treating as successful deletion: ${path}`
        );
        return true;
      }
      throw new Error(`Deletion failed: ${error.message}`);
    }
    return true;
  }
}

// 싱글톤 인스턴스를 내보내어 재사용성을 높입니다.
export const storageService = new StorageService(BUCKET_NAME);
