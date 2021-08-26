export default class Debugger {
  constructor(private isDebug?: boolean) {
    this.isDebug = isDebug;
  }
  public log(...args: any[]) {
    if (!this.isDebug) {
      return;
    }
    console.log('%c Sunmao Debugger:', 'padding: 1px; background: #4af; color: #fff;', ...args);
  }
}
