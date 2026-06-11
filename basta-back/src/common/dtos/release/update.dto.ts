import { PartialType } from '@nestjs/mapped-types';
import { CreateReleaseDto } from './create.dto';

export class UpdateReleaseDto extends PartialType(CreateReleaseDto) {}
