import React from "react";

export const Checkbox = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={`form-checkbox ${className}`}
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";
