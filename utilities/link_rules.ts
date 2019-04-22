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

export class LinkRules {
  private _jsonRules: any;
  private _content: string;
  private _projectName: string;
  private _downloadURL: string;

  constructor(content: string, projectName: string, dwnldURL: string, updatedStrategies?: any, ) {
    this._jsonRules = updatedStrategies;
    this.content = content
    this._projectName = projectName
    this._downloadURL = dwnldURL
  }

  public scrapeFilesContents(): void {
    console.log(this._projectName + ' | ' + this._downloadURL);
    this._jsonRules.forEach(function(obj) {
      if(obj.name !== this._projectName) {
        let anything = this.content.indexOf(obj.name);
        console.log('Find ' + obj.name + '? ' + anything);
      }
    });
  }

  set content(newContent: string) {
    this._content = newContent;
  }

  get content() {
    return this._content;
  }
}

