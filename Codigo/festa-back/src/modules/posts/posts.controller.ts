import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post as HttpPost,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';
import { CreatePostDto } from 'src/common/dtos/post/create-post.dto';
import { UpdatePostDto } from 'src/common/dtos/post/update-post.dto';
import { UpdatePostStatusDto } from 'src/common/dtos/post/update-status.dto';
import { PostQueryDto } from 'src/common/dtos/post/post-query.dto';

const ALL_ROLES = [Role.GESTAO, Role.PAINEL, Role.INDIVIDUAL] as const;

@Controller('post')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Roles(...ALL_ROLES)
  @Get()
  findAll(
    @Query() query: PostQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.findAll(query, req.user);
  }

  @Roles(...ALL_ROLES)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.findOne(id, req.user);
  }

  // Cadastro, edição e remoção são exclusivos da Gestão.
  @Roles(Role.GESTAO)
  @HttpPost()
  create(
    @Body() dto: CreatePostDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.create(dto, req.user);
  }

  @Roles(Role.GESTAO)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  // Avanço de status — Gestão (livre) e Individual (começar/entregar). Validação
  // detalhada por papel acontece no service; Painel é bloqueado aqui.
  @Roles(Role.GESTAO, Role.INDIVIDUAL)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.postsService.updateStatus(id, dto.status, req.user);
  }

  @Roles(Role.GESTAO)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
