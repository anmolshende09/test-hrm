import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/common/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-canvas-parchment">
      <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center text-ink-muted48 mb-4">
        <Compass size={22} />
      </div>
      <h1 className="text-display-md">Page not found</h1>
      <p className="text-caption text-ink-muted48 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
