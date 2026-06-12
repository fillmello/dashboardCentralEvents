import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';

// Gestor-only field edit (RF-02). Status changes go through UpdatePostStatusDto.
export class UpdatePostDto extends PartialType(CreatePostDto) {}
