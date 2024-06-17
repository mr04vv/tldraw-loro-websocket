import { T } from "@tldraw/validate";
import {
  DefaultFontStyle,
  DefaultSizeStyle,
  RecordPropsType,
  TLBaseShape,
  createShapePropsMigrationIds,
  createShapePropsMigrationSequence,
} from "@tldraw/tlschema";

export const messageShapeProps = {
  size: DefaultSizeStyle,
  font: DefaultFontStyle,
  w: T.nonZeroNumber,
  text: T.string,
  scale: T.nonZeroNumber,
  autoSize: T.boolean,
};

export type WBMessageShapeProps = RecordPropsType<typeof messageShapeProps>;

export type WBMessageShape = TLBaseShape<"message", WBMessageShapeProps>;

const versions = createShapePropsMigrationIds("message", {});

export { versions as messageShapeVersions };

export const messageShapeMigrations = createShapePropsMigrationSequence({
  sequence: [],
});
