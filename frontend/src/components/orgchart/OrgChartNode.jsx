import React, { useState } from "react";
import EmployeeProfileCard from "./EmployeeProfileCard";

export default function OrgChartNode({ node }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <EmployeeProfileCard
        employee={node}
        hasChildren={hasChildren}
        collapsed={collapsed}
        childCount={node.children.length}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {hasChildren && !collapsed && (
        <>
          <div className="w-px h-6 bg-hairline" />
          <div className="flex">
            {node.children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === node.children.length - 1;
              const isOnly = node.children.length === 1;
              return (
                <div key={child._id} className="flex flex-col items-center px-4 relative pt-px">
                  {!isOnly && (
                    <div
                      className="absolute top-0 h-px bg-hairline"
                      style={{
                        left: isFirst ? "50%" : 0,
                        right: isLast ? "50%" : 0,
                      }}
                    />
                  )}
                  <div className="w-px h-6 bg-hairline" />
                  <OrgChartNode node={child} />
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
