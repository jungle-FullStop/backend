export class TeamDto {
  name: string;
  code: string;
  description: string;
}

export class DeleteMemberDto {
  memberName: string;
}

export class TeamStreamDto {
  userId: number;
  status: string;
  teamCode: string;
}
