import { Controller } from '@nestjs/common';
import { GrassService } from './grass.service';

@Controller('grass')
export class GrassController {
  constructor(private readonly grassService: GrassService) {}
}
