export class TeamDto {
  userId: number;
  name: string;
  code: string;
}

export class TeamFindDto {
  code: string;
}

export class TeamDeleteDto {
  userId: number;
  code: string;
}
