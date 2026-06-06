const status = ["open", "in_progress", "resolved"] as const;
export type Status = (typeof status)[number];
const type = ["bug", "feature_request"] as const;
export type Type = (typeof type)[number];

export interface IIssue {
  title: string;
  description: string;
  type: Type;
  status?: Status;
  reporter_id?: number;
}