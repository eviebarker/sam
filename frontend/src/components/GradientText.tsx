import type { CSSProperties, ReactNode } from "react";
import "./GradientText.css";

type GradientTextProps = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: "horizontal" | "vertical" | "diagonal";
};

export default function GradientText({
  children,
  className = "",
  colors = ["#5227FF", "#FF9FFC", "#B19EEF"],
  animationSpeed = 8,
  showBorder = false,
  direction = "horizontal",
}: GradientTextProps) {
  const gradientAngle =
    direction === "horizontal"
      ? "to right"
      : direction === "vertical"
        ? "to bottom"
        : "to bottom right";
  const gradientColors = [...colors, colors[0]].join(", ");

  const backgroundSize =
    direction === "horizontal"
      ? "300% 100%"
      : direction === "vertical"
        ? "100% 300%"
        : "300% 300%";
  const fromPos =
    direction === "vertical" ? "50% 0%" : direction === "diagonal" ? "0% 0%" : "0% 50%";
  const toPos =
    direction === "vertical" ? "50% 100%" : direction === "diagonal" ? "100% 100%" : "100% 50%";

  const style = {
    "--gt-gradient": `linear-gradient(${gradientAngle}, ${gradientColors})`,
    "--gt-duration": `${animationSpeed}s`,
    "--gt-bg-size": backgroundSize,
    "--gt-bg-pos-from": fromPos,
    "--gt-bg-pos-to": toPos,
  } as CSSProperties;

  return (
    <div
      className={`animated-gradient-text${showBorder ? " with-border" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={style}
    >
      {showBorder ? <div className="gradient-overlay" /> : null}
      <div className="text-content">{children}</div>
    </div>
  );
}
