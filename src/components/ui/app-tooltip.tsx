"use client";

import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import type { PlacesType } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export const APP_TOOLTIP_ID = "rps-tooltip";

type TipOptions = {
  place?: PlacesType;
};

/**
 * Spread onto icon-only controls for hover/focus tooltips.
 * Keep `aria-label` for screen readers.
 * Tooltips are desktop-only (fine pointer + hover); touch devices skip them.
 *
 * @example
 * <button type="button" aria-label="Close" {...tip("Close")}>…</button>
 */
export function tip(content: string, options?: TipOptions) {
  return {
    "data-tooltip-id": APP_TOOLTIP_ID,
    "data-tooltip-content": content,
    ...(options?.place ? { "data-tooltip-place": options.place } : {}),
  } as const;
}

/** True when hover tooltips are usable (mouse / trackpad, not primary-touch). */
function useHoverTooltipsEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return enabled;
}

/** Single app-wide tooltip host — mount once near the root. */
export function AppTooltip() {
  const enabled = useHoverTooltipsEnabled();
  if (!enabled) return null;

  return (
    <Tooltip
      id={APP_TOOLTIP_ID}
      className="rps-tooltip"
      place="top"
      delayShow={200}
      delayHide={60}
      opacity={1}
      positionStrategy="fixed"
    />
  );
}
