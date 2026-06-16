import { IsIn } from 'class-validator';

// Which part of the combined COPY_CAPA stage is being delivered.
export class DeliverDto {
  @IsIn(['copy', 'capa'])
  kind: 'copy' | 'capa';
}
