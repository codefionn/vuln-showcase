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
