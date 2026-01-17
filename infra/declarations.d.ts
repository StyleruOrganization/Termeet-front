declare module "*.module.css" {
  const styles: Readonly<Record<string, string>>;
  export default styles;
}

declare module "*.svg" {
  import * as React from "react";
  export default React.FC<React.SVGProps<SVGSVGElement>>;
}
