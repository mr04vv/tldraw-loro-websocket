import { Editor, Rectangle2d, ShapeUtil, WeakMapCache } from "@tldraw/editor";
import {
  WBMessageShape,
  messageShapeMigrations,
  messageShapeProps,
} from "./message-shape-schema";
import { FONT_FAMILIES, FONT_SIZES, TEXT_PROPS } from "../schemas/text";

/** @note 脳死コピペ */
const sizeCache = new WeakMapCache<
  WBMessageShape["props"],
  { height: number; width: number }
>();

export class MessageShapeUtil extends ShapeUtil<WBMessageShape> {
  static override type = "message" as const;
  static override props = messageShapeProps;
  static override migrations = messageShapeMigrations;

  getDefaultProps(): WBMessageShape["props"] {
    return {
      size: "m",
      font: "mono",
      w: 8,
      text: "Hello, World!",
      scale: 1,
      autoSize: true,
    };
  }

  getMinDimensions(shape: WBMessageShape) {
    return sizeCache.get(shape.props, (props) =>
      getTextSize(this.editor, props),
    );
  }

  getGeometry(shape: WBMessageShape) {
    const { scale } = shape.props;
    const { width, height } = this.getMinDimensions(shape)!;
    return new Rectangle2d({
      width: width * scale,
      height: height * scale,
      isFilled: true,
      isLabel: true,
    });
  }

  component(shape: WBMessageShape) {
    const { id, props } = shape;
    return <p>{props.text}</p>;
  }

  indicator(shape: WBMessageShape) {
    return null;
  }
}

/** @note 脳死コピペ */
function getTextSize(editor: Editor, props: WBMessageShape["props"]) {
  const { font, text, autoSize, size, w } = props;

  const minWidth = autoSize ? 16 : Math.max(16, w);
  const fontSize = FONT_SIZES[size];

  const cw = autoSize
    ? null
    : // `measureText` floors the number so we need to do the same here to avoid issues.
    Math.floor(Math.max(minWidth, w));

  const result = editor.textMeasure.measureText(text, {
    ...TEXT_PROPS,
    fontFamily: FONT_FAMILIES[font],
    fontSize: fontSize,
    maxWidth: cw,
  });

  // // If we're autosizing the measureText will essentially `Math.floor`
  // // the numbers so `19` rather than `19.3`, this means we must +1 to
  // // whatever we get to avoid wrapping.
  if (autoSize) {
    result.w += 1;
  }

  return {
    width: Math.max(minWidth, result.w),
    height: Math.max(fontSize, result.h),
  };
}
