export interface InsertPost {
  title: string;
  content: string;
  userId: number;
  isPrivate: boolean;
}

export interface LikePost {
  id: number;
  title: string;
  content: string;
  userId: number;
  isPrivate: boolean;
}

export class Post implements LikePost {
  public id: number;
  public title: string;
  public content: string;
  public userId: number;
  public isPrivate: boolean;

  public constructor(
    id: number,
    title: string,
    content: string,
    userId: number,
    isPrivate: boolean,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.userId = userId;
    this.isPrivate = isPrivate;
  }
}
