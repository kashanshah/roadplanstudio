"use client";

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

/** Single app-wide tooltip host — mount once near the root. */
export function AppTooltip() {
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
