import * as Immutable from "immutable";
import * as he from "he";
import urlRegex from "url-regex";
import {
  CellFormatter,
  ClickHandler,
  ClickHandlerAppContext,
  FormatOptions,
} from "./FormatOptions";

/*
 * TODO: move to tad-app
const shell = require('electron').shell; // install this globally so we can access in generated a tag:
window.tadOpenExternal = (url: string) => {
  console.log('tadOpenExternal: ', url);
  shell.openExternal(url);
  return false;
};
*/

(window as any).tadLinkNOP = (url: string) => {
  return false;
};

export interface TextFormatOptionsProps {
  type: string;
  urlsAsHyperlinks: boolean;
}

const defaultTextFormatOptionsProps: TextFormatOptionsProps = {
  type: "TextFormatOptions",
  urlsAsHyperlinks: true,
};

const isValidURL = (s: string): boolean =>
  urlRegex({
    exact: true,
  }).test(s);

export class TextFormatOptions
  extends Immutable.Record(defaultTextFormatOptionsProps)
  implements TextFormatOptionsProps, FormatOptions
{
  public readonly type!: string;
  public readonly urlsAsHyperlinks!: boolean;

  getFormatter(): CellFormatter {
    const ff = (val?: string | null): string | undefined | null => {
      if (this.urlsAsHyperlinks && val && isValidURL(val)) {
        // Just return false from onclick handler to prevent default link handling
        const ret = `<a href="${val}" onclick='return false;'>${val}</a>`;
        return ret;
      }

      return val ? he.encode(val) : val;
    };

    return ff;
  }

  getClassName(): string | null {
    return null;
  }

  getClickHandler(): ClickHandler {
    const ch = (
      appContext: ClickHandlerAppContext,
      row: number,
      column: number,
      val: any
    ) => {
      if (this.urlsAsHyperlinks && val && isValidURL(val)) {
        appContext.openURL(val);
      }
    };
    return ch;
  }
}
