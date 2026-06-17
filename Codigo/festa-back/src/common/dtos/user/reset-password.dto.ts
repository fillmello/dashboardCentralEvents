import { IsStrongPassword } from 'class-validator';

// Coordenação resets another user's password (recovers access to an account
// whose password is unknown). Same strength policy as sign-up.
export class ResetPasswordDto {
  @IsStrongPassword(
    {
      minLength: 8,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    },
    {
      message:
        'A senha deve ter no mínimo 8 caracteres, incluindo ao menos 1 letra maiúscula, 1 número e 1 símbolo.',
    },
  )
  password: string;
}
