import { ValidationError } from "../compiler/types";

export interface GraphConfig {
  strictMode: boolean; // true = CI/Prod (dangling refs fail), false = Editor/Preview (warnings)
}

export interface GraphMetadata {
  graphVersion: string;
  schemaVersion: string;
  builderVersion: string;
  createdAt: string;
}

export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  isolatedNodes: number;
  connectedComponents: number;
  maxDepth: number;
}

export class GraphContext {
  public readonly metadata: GraphMetadata = {
    graphVersion: "1.0",
    schemaVersion: "1.0",
    builderVersion: "1.0",
    createdAt: new Date().toISOString(),
  };

  private _diagnostics: ValidationError[] = [];
  private _statistics: GraphStatistics = { 
    nodeCount: 0, 
    edgeCount: 0, 
    isolatedNodes: 0, 
    connectedComponents: 0, 
    maxDepth: 0 
  };

  constructor(public readonly config: GraphConfig) {}

  public get diagnostics(): readonly ValidationError[] {
    return this._diagnostics;
  }

  public get statistics(): Readonly<GraphStatistics> {
    return this._statistics;
  }

  public addDiagnostic(diagnostic: ValidationError): void {
    this._diagnostics.push(diagnostic);
  }

  public updateStatistics(stats: Partial<GraphStatistics>): void {
    this._statistics = { ...this._statistics, ...stats };
  }
}
