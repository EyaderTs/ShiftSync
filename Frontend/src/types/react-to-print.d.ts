import type { ReactElement, ReactInstance, ComponentType } from "react";

export interface ReactToPrintProps {
  trigger: () => ReactElement;
  content: () => ReactInstance | null;
  documentTitle?: string;
  pageStyle?: string | (() => string);
  copyStyles?: boolean;
  onBeforePrint?: () => void | Promise<void>;
  onAfterPrint?: () => void;
  removeAfterPrint?: boolean;
  bodyClass?: string;
  [key: string]: any;
}

declare module "react-to-print" {
  const ReactToPrint: ComponentType<ReactToPrintProps>;
  export default ReactToPrint;
}

