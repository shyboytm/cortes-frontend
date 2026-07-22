"use client";

import { useEffect } from "react";
import { bind } from "cuelume";

// Wires up Cuelume's delegated `data-cuelume-*` listeners once, site-wide.
// bind() attaches its listeners at the document root and is idempotent, so
// mounting this once in the root layout is all that's needed — it also
// automatically picks up elements added later (client-side navigations,
// dynamically rendered lists, etc.) without re-binding.
export default function CuelumeSetup() {
  useEffect(() => {
    bind();
  }, []);

  return null;
}
