import type { ReactNode } from "react";

type FoodHubProps = {
  leftTop: ReactNode;
  leftBottom: ReactNode;
  rightTop: ReactNode;
  rightBottom: ReactNode;
  footer?: ReactNode;
};

export default function FoodHub({
  leftTop,
  leftBottom,
  rightTop,
  rightBottom,
  footer,
}: FoodHubProps) {
  return (
    <main className="grid">
      {leftTop}
      {rightTop}
      {leftBottom}
      {rightBottom}
      {footer ? <div className="funFactDock">{footer}</div> : null}
    </main>
  );
}
