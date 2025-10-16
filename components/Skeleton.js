import React from "react";

// TypeScript가 아니므로 Props는 주석으로만 명시합니다.
/**
 * @typedef {object} SkeletonProps
 * @property {'square' | 'circle' } [variant='square'] - 스켈레톤의 모양 (직사각형 또는 원).
 * @property {string} [className=''] - 커스텀 CSS 클래스. 너비, 높이, 마진 등을 설정하는 데 사용.
 */

/**
 * 재사용 가능한 Skeleton 컴포넌트입니다.
 * Tailwind CSS를 사용하여 애니메이션과 스타일을 적용합니다.
 *
 * @param {SkeletonProps} props
 */
const Skeleton = ({ variant = "square", className = "" }) => {
  // 기본 스타일: 배경색과 로딩 애니메이션
  const baseClasses = "bg-[#3d3d3d] animate-pulse rounded-xl";

  // 모양에 따른 스타일 설정
  let variantClasses = "";
  if (variant === "circle") {
    variantClasses = "rounded-full";
  } else if (variant === "square") {
    // 직사각형은 기본 클래스의 'rounded'를 사용하거나 'rounded-md' 등으로 구체화할 수 있습니다.
    variantClasses = "rounded-md";
  }

  // 최종 클래스 조합
  // className이 가장 마지막에 적용되어 너비(w-*), 높이(h-*), 마진(m-*) 등의 커스텀 설정을 오버라이드합니다.
  const finalClasses = `${baseClasses} ${variantClasses} ${className}`;

  return (
    <div className={finalClasses}>
      {/* 내용 없이 크기만 차지하도록 비워 둠 */}
    </div>
  );
};

export default Skeleton;
