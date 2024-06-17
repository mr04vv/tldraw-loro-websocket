import { TLDefaultFontStyle, TLDefaultSizeStyle } from "@tldraw/tlschema";

export const TEXT_PROPS = {
  lineHeight: 1.35,
  fontWeight: "normal",
  fontVariant: "normal",
  fontStyle: "normal",
  padding: "0px",
};

export const FONT_SIZES = {
  s: 18,
  m: 24,
  l: 36,
  xl: 44,
} as const satisfies Record<TLDefaultSizeStyle, number>;

export const FONT_FAMILIES: Record<TLDefaultFontStyle, string> = {
  draw: "var(--tl-font-draw)",
  sans: "var(--tl-font-sans)",
  serif: "var(--tl-font-serif)",
  mono: "var(--tl-font-mono)",
};
