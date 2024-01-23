export const JWT = 'jwt';

export interface Payload {
  id: number;
  name: string;
  accessToken: string;
  iat: number;
}
