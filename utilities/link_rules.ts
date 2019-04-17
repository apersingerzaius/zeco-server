/**
 * Strategies?
 *  - For each node name, run link creator
 *  - Link creator will take the current node [source] and
 *    parse thru the source contents to see where it sends data to [target]
 *  - We will determine where it sends data to by searching contents for
 *    the other projects' names
 *  - Need to ensure we don't pick up any unwanted hits:
 *    > ZED -> "UninitialiZED..."
 *    > Possibly search the string for single/double ticks?
 *    > Find the line that the search term is on and make sure the line
 *      doesn't begin with a comma
 *  - Common regex patterns?
 *  - If API call, search for a specific port?
 *
 **/
import data from '../strategies/strategies.json';


export class LinkRules {
  private _jsonRules: JSON;
  private _content: string;

  constructor(content: string) {
    this._jsonRules = data;
    this.content = content
  }

  private startScrape(): void {
    console.log(this.content);
    console.log(this._jsonRules)
  }

  set content(newContent: string) {
    this._content = newContent;
  }

  get content() {
    return this._content;
  }
}

