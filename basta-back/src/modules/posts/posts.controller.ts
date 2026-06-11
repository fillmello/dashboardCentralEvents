import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { AdvanceStatusDto } from './dtos/advance-status.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { AuthenticatedRequest } from 'src/auth/jwt-payload.type';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles(Role.GESTOR)
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Get()
  findAll(
    @Query() filters: any,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.findAll(req.user, filters);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.GESTOR)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.update(id, updatePostDto, req.user);
  }

  @Delete(':id')
  @Roles(Role.GESTOR)
  remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.remove(id, req.user);
  }

  @Patch(':id/advance-status')
  advanceStatus(
    @Param('id') id: string,
    @Body() advanceStatusDto: AdvanceStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.advanceStatus(
      id,
      advanceStatusDto,
      req.user,
    );
  }

  @Get(':id/history')
  getHistory(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.findOne(id, req.user);
  }
}
