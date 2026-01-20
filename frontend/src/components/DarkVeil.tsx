import React from "react";
import "./DarkVeil.css";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DarkVeil = require("./DarkVeil.jsx").default;

export default function DarkVeilWrapper(props: any) {
  return <DarkVeil {...props} />;
}
