import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectionDto } from './create.dto';

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {}
