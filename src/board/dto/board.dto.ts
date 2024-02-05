export class BoardDto {
  title: string;
  contents: string;
}
export class BoardUpdateDto {
  userId: number;
  boardId: number;
  contents: string;
}
export class BoardDeleteDto {
  userId: number;
  boardId: number;
}
