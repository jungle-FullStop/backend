import { SearchUserResponseDto } from 'src/users/dto/user.dto';
import { StrangerResponseDto } from '../dto/member.dto';

export type SortedUsersType<T> = T extends SearchUserResponseDto[]
  ? SearchUserResponseDto[]
  : StrangerResponseDto[];