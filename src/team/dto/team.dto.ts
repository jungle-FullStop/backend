export class TeamDto {
  name: string;
  code: string;
  description: string;
}

export class DeleteMemberDto {
  id: string;
}

export class TeamStreamDto {
  userId: number;
  status: string;
  teamCode: string;
}
