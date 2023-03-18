import { G, Line, Polygon } from "@react-pdf/renderer";
import classNames from "classnames";
import {
  GraphicDimensions,
  GraphicLimits,
  RenderTarget,
  Ticks,
} from "../graphic-renderer.types";
import { transformToSvgViewport } from "../graphic-utils";
import { GRAPHIC_MIN_PADDING } from "./svg-graphic-container";

export interface YAxisProps {
  dimensions: GraphicDimensions;
  limits: GraphicLimits;
  ticks: Ticks;
  target: RenderTarget;
}

export default function YAxis({
  dimensions,
  limits,
  ticks,
  target,
}: YAxisProps) {
  if (limits.xMin > 0 || limits.xMax < 0) {
    console.log("early return");
    return <></>;
  }

  const startPoint = transformToSvgViewport(
    {
      x: 0,
      y: limits.yMin,
    },
    dimensions,
    limits
  );

  const endPoint = transformToSvgViewport(
    {
      x: 0,
      y: limits.yMax,
    },
    dimensions,
    limits
  );

  const trianglePoints = `${endPoint.x - GRAPHIC_MIN_PADDING / 2},${
    endPoint.y + GRAPHIC_MIN_PADDING
  } ${endPoint.x + GRAPHIC_MIN_PADDING / 2},${
    endPoint.y + GRAPHIC_MIN_PADDING
  } ${endPoint.x},${endPoint.y - GRAPHIC_MIN_PADDING}`;

  switch (target) {
    case "web":
      return (
        <g>
          <line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={endPoint.x}
            y2={endPoint.y}
            className={classNames(
              "theme-light:stroke-black",
              "theme-dark:stroke-white",
              "stroke-[0.005]"
            )}
          />
          <polygon
            points={trianglePoints}
            className={classNames(
              "theme-light:fill-black",
              "theme-dark:fill-white"
            )}
          />
        </g>
      );

    case "pdf":
      return (
        <G>
          <Line
            x1={startPoint.x}
            y1={startPoint.y}
            x2={endPoint.x}
            y2={endPoint.y}
            style={{
              stroke: "black",
              strokeWidth: "0.005",
            }}
          />
          <Polygon
            points={trianglePoints}
            style={{
              fill: "black",
            }}
          />
        </G>
      );
  }
}
