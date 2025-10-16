// components/CategoryItem.js
"use client";

import { Checkbox } from "@mui/material";
import React from "react";

const CategoryItem = ({ category, selectedCategories, onToggle }) => {
  const isSelected = selectedCategories.has(category.id);

  const handleCheck = (e) => {
    onToggle(category.id, e.target.checked, category.parent_id);
  };

  return (
    <li>
      <div
        className={`flex items-center space-x-2 ${
          category.parent_id ? "ml-4" : ""
        }`}
      >
        <Checkbox
          onChange={handleCheck}
          checked={isSelected}
          size="small"
          sx={{ p: 0 }}
        />
        <>{category.name}</>
      </div>
      {category.children && category.children.length > 0 && (
        <ul className="mt-2 space-y-1 flex">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              selectedCategories={selectedCategories}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryItem;
