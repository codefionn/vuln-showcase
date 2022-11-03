/*
 * vuln-showcase - Showcasing some common web vulnerabilities
 * Copyright (C) 2022 Fionn Langhans
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
