// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/25414#issuecomment-1180518151
declare module "react-copy-to-clipboard" {
  import React from "react";

  interface Options {
    debug: boolean;
    message: string;
  }

  interface Props {
    text: string;
    onCopy?(a: string, b: boolean): void;
    options?: Options;
  }

  class CopyToClipboard extends React.Component<PropsWithChildren<Props>, unknown> {}
  export default CopyToClipboard;
}
