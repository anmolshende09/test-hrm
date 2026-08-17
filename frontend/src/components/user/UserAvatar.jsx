import React from "react";
import { getInitials, getAvatarColor } from "../../utils/avatar";

export default function UserAvatar({ name, size = 36 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: getAvatarColor(name), fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
}
