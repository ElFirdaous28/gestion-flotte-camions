import React from "react";

const Logo = ({ isExpanded = true, size = 'text-xl' }) => {
  return (
    <div
      className={`
        ${size}
        font-semibold
        whitespace-nowrap
        tracking-wider
        transition-all
        duration-200
        ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}
      `}
    >
      <span className="text-primary">T</span>ruck
      <span className="text-primary ml-1">F</span>leet
    </div>
  );
};

export default React.memo(Logo);