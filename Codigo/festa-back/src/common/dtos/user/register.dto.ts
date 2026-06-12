import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

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
