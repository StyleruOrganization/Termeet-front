declare module "*.module.css" {
  const IClassNames: {
    [className: string]: string
  };
  const classNames: IClassNames;
  export = classNames;}

declare module "*.svg" {
  import * as React from "react";
  export default React.FC<React.SVGProps<SVGSVGElement>>;
}
