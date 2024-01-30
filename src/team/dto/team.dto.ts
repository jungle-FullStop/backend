export class TeamDto {
  userId: string;
  name: string;
  code: string;
}

export class TeamFindDto {
  code: string;
}

export class TeamDeleteDto {
  userId: string;
  code: string;
}
