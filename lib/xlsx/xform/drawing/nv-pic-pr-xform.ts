import BaseXform = require('../base-xform');
import CNvPrXform = require('./c-nv-pr-xform');
import CNvPicPrXform = require('./c-nv-pic-pr-xform');

class NvPicPrXform extends BaseXform {
  public map: {[key: string]: any};
  public parser: any;
  public model: any;

  constructor() {
    super();

    this.map = {
      'xdr:cNvPr': new CNvPrXform(),
      'xdr:cNvPicPr': new CNvPicPrXform(),
    };
  }

  get tag(): string {
    return 'xdr:nvPicPr';
  }

  render(xmlStream: any, model: any): void {
    xmlStream.openNode(this.tag);
    this.map['xdr:cNvPr'].render(xmlStream, model);
    this.map['xdr:cNvPicPr'].render(xmlStream, model);
    xmlStream.closeNode();
  }

  parseOpen(node: any): boolean {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }

    switch (node.name) {
      case this.tag:
        this.reset();
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  }

  parseText(): void {}

  parseClose(name: string): boolean {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        this.model = this.map['xdr:cNvPr'].model;
        return false;
      default:
        return true;
    }
  }
}

export = NvPicPrXform;
