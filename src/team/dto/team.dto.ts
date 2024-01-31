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

export class TeamStreamDto {
  userId: number;
  status: string;
  teamCode: number;
}
