import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupportService } from './support.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import type { AuthenticatedRequest } from 'src/auth/jwt-payload.type';
import { CreateSupportDto } from 'src/common/dtos/support/create.dto';
import { CreateSupportMessageDto } from 'src/common/dtos/support/create-message.dto';
import { ListSupportAdminQueryDto } from 'src/common/dtos/support/admin-query.dto';

@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  // TODO: Endpoint — Open a new support chat for the authenticated USER.
  // Accepts multipart/form-data: CreateSupportDto fields + optional `file`
  // (image/* or application/pdf). Persist support with userId = req.user.sub,
  // upload file via StorageService.upload(file, 'support') if present, and
  // derive SupportFileType from file.mimetype. Return the created Support.
  @Roles(Role.USER)
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateSupportDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.supportService.create(req.user.sub, dto, file);
  }

  // TODO: Endpoint — List all support chats owned by the authenticated USER.
  // Filter by user: { id: req.user.sub }. No pagination for the user list.
  @Roles(Role.USER)
  @Get()
  listForUser(@Request() req: AuthenticatedRequest) {
    return this.supportService.listForUser(req.user.sub);
  }

  // TODO: Endpoint — ADMIN paginated list of every support chat.
  // Honor optional `status` filter and `page`/`limit` from
  // ListSupportAdminQueryDto. Return { items, total, page, limit }.
  @Roles(Role.ADMIN)
  @Get('admin')
  listForAdmin(@Query() query: ListSupportAdminQueryDto) {
    return this.supportService.listForAdmin(query);
  }

  // TODO: Endpoint — Open a single support chat with its messages.
  // USER can only fetch chats they own (filter by user.id = req.user.sub);
  // ADMIN can fetch any. Mark all messages authored by the OPPOSITE party
  // as visualized = true (user opens chat → admin's messages flip; admin
  // opens chat → user's messages flip). 404 if not found / not owned.
  @Roles(Role.USER, Role.ADMIN)
  @Get(':id')
  getOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supportService.getOne(req.user.sub, req.user.role, id);
  }

  // TODO: Endpoint — Owner finishes the chat.
  // USER only. Verify ownership against req.user.sub. Set status = FINISHED
  // and finishedAt = new Date(). Reject if already FINISHED.
  @Roles(Role.USER)
  @Post(':id/finish')
  finish(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.supportService.finish(req.user.sub, id);
  }

  // TODO: Endpoint — Append a message to a chat.
  // USER can only post on chats they own; ADMIN can post on any. Derive
  // isUser from req.user.role (USER → true, ADMIN → false). Accept
  // multipart/form-data with optional `text` (CreateSupportMessageDto) and
  // optional `file` (image/* or pdf). At least one of text/file must be
  // provided. Reject if chat status === FINISHED. Upload file via
  // StorageService.upload(file, 'support/messages'). Set visualized = false.
  @Roles(Role.USER, Role.ADMIN)
  @Post(':id/messages')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  addMessage(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSupportMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!dto.text && !file) {
      throw new BadRequestException(
        'Mensagem precisa de texto ou arquivo anexado',
      );
    }
    return this.supportService.addMessage(
      req.user.sub,
      req.user.role,
      id,
      dto,
      file,
    );
  }
}
