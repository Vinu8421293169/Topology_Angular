import { AfterViewInit, Component } from '@angular/core';

interface Cordinates {
  x: number;
  y: number;
}

interface Box {
  id?: number;
  name?: string;
  parent?: number | number[];
  status?: string;
  childs?: Box[];
  startPoint?: Cordinates;
  endPoint?: Cordinates;

  isLine?: boolean;
  topPoint?: Cordinates;
  svg?: SVGElement;
}

@Component({
  selector: 'app-topology',
  templateUrl: './topology.component.html',
  styleUrls: ['./topology.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopologyComponent implements AfterViewInit {
  topologyData: Box[][] = [
    [
      { id: 1, name: 'CLPR0' },
      {
        isLine: true,
      },
    ],
    [
      {
        id: 2,
        name: 'MPBs (2)',
        parent: 1,
        status: 'green',
        // childs: [
        //   { name: 'MPBs-01', parent: 'CL1-D' },
        //   { name: 'MPBs-03', parent: 'CL1-D' },
        // ],
      },
      { id: 3, name: 'MPU-10', parent: 1, status: 'green' },
      {
        id: 4,
        name: 'MPBs (3)',
        parent: 1,
        // childs: [
        //   { name: 'MPBs-02', parent: 'CL1-D' },
        //   { name: 'MPBs-05', parent: 'CL1-D' },
        //   { name: 'MPBs-09', parent: 'CL1-D' },
        // ],
      },
      {
        isLine: true,
      },
    ],
    [
      { id: 5, parent: [2, 3, 4], name: 'CL1-D' },
      {
        isLine: true,
      },
    ],
    [
      { id: 6, name: 'LDEVs (3)', parent: 5, status: 'green' },
      { id: 7, name: 'LDEVs (49)', parent: 5, status: 'green' },
      {
        isLine: true,
      },
    ],
    [
      { id: 8, name: 'JCTDC0', parent: 6, status: 'green' },
      { id: 8, name: 'JCTDC0124-N', parent: 6, status: 'green' },
      { id: 9, name: 'LDEVs (49)', parent: 7, status: 'green' },
      { id: 10, name: 'LDEVs (49)', parent: 7, status: 'green' },
    ],
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.drawLines();
    });
  }

  getLineHeight(
    topologyData: Box[][],
    i: number,
    verticalLineSVG: any
  ): number {
    const line = topologyData[i]?.find((ele: Box) => ele.isLine);
    if (verticalLineSVG && line) {
      let lineRect = verticalLineSVG.getBoundingClientRect();
      line.topPoint = { x: lineRect.x, y: lineRect.y };
      line.svg = verticalLineSVG;
    }
    let length = Math.max(
      topologyData[i].filter((box: Box) => !box.isLine).length,
      topologyData[i + 1].filter((box: Box) => !box.isLine).length
    );
    let margin = (length - 2) * 10 + (length - (length - 2)) * 5;
    return length * 22 + margin - 21;
  }

  setBoxDiv(ele: any, box: Box) {
    let boxRect = ele.getBoundingClientRect();
    box.startPoint = { x: boxRect.x, y: boxRect.y + ele.offsetHeight / 2 };
    box.endPoint = {
      x: boxRect.x + ele.offsetWidth,
      y: boxRect.y + ele.offsetHeight / 2,
    };
  }

  drawLines() {
    for (let i = 1; i < this.topologyData.length; i++) {
      const prevLevels = this.topologyData[i - 1],
        levels: any[] = this.topologyData[i];
      let line = prevLevels.find((ele: any) => ele.isLine);

      for (let j = 0; j < levels.length; j++) {
        if (levels[j].isLine) {
          break;
        }

        if (Array.isArray(levels[j].parent)) {
          levels[j].parent?.forEach((p: number) => {
            let box: any = prevLevels.find((box: any) => box.id == p);
            this.connectLine(
              box.endPoint,
              levels[j].startPoint,
              line,
              box.name + '->' + levels[j].name
            );
          });
        } else {
          let box: any = prevLevels.find(
            (box: any) => box.id == levels[j].parent
          );
          this.connectLine(
            box.endPoint,
            levels[j].startPoint,
            line,
            box.name + '->' + levels[j].name
          );
        }
      }
    }
  }

  connectLine(startPoint: any, endPoint: Cordinates, line: any, name: string) {
    let end: Cordinates = {
      x: 0,
      y: Math.floor(this.diff(endPoint.y, line.topPoint.y)),
    };

    let start: Cordinates = {
      x: 0,
      y: Math.floor(this.diff(startPoint.y, line.topPoint.y)),
    };

    this.appendIntoSVG(start.x, start.y, end.x, end.y, line.svg);
  }

  appendIntoSVG(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    svg: any
  ): void {
    let str = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#babfc7" />`;
    svg.innerHTML += str;
  }

  diff(a: number, b: number): number {
    return a > b ? a - b : b - a;
  }
}
