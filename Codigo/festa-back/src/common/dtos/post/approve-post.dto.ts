import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';

// Gestão approval of a post sitting in APROVACAO: decides whether Copy and Capa
// are needed and, when needed, who is responsible for each. The service moves
// the post to the first required stage (Copy → Capa → Em publicação).
export class ApprovePostDto {
  @IsBoolean()
  needsCopy: boolean;

  @IsOptional()
  @IsInt()
  @IsPositive()
  copyResponsibleId?: number;

  @IsBoolean()
  needsCapa: boolean;

  @IsOptional()
  @IsInt()
  @IsPositive()
  capaResponsibleId?: number;
}
