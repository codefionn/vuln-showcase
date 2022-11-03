export type SubjectNameTypes = "user";

export interface InsertConfirm {
  subjectName: SubjectNameTypes;
  subjectId: number;
}

export interface LikeConfirm {
  id: number;
  key: string;
  subjectName: SubjectNameTypes;
  subjectId: number;
}

export class Confirm {
  public id: number;
  public key: string;
  public subjectName: SubjectNameTypes;
  public subjectId: number;

  public constructor(
    id: number,
    key: string,
    subjectName: SubjectNameTypes,
    subjectId: number,
  ) {
    this.id = id;
    this.key = key;
    this.subjectName = subjectName;
    this.subjectId = subjectId;
  }

  public verifyKey(key: string): boolean {
    return key === this.key; // Insecure
  }
}
