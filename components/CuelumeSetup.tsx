"use client";

import { useEffect } from "react";
import { bind, setEnabled } from "cuelume";
import { getStoredSoundEnabled } from "@/lib/sound-preference";

export default function CuelumeSetup() {
  useEffect(() => {
    bind();
    setEnabled(getStoredSoundEnabled());
  }, []);

  return null;
}
