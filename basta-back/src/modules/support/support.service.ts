import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Support } from 'src/common/entities/support.entity';
import { SupportMessage } from 'src/common/entities/support-message.entity';
import { StorageService } from 'src/storage/storage.service';
import { Role } from 'src/common/enums/role.enum';
import { CreateSupportDto } from 'src/common/dtos/support/create.dto';
import { CreateSupportMessageDto } from 'src/common/dtos/support/create-message.dto';
import { ListSupportAdminQueryDto } from 'src/common/dtos/support/admin-query.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private supportRepo: Repository<Support>,
    @InjectRepository(SupportMessage)
    private messageRepo: Repository<SupportMessage>,
    private storageService: StorageService,
  ) {}

  // TODO: Create a new Support row for userId.
  //  - Apply dto (title, description, category — default PROBLEMA if missing).
  //  - Set user: { id: userId }, status defaults to OPEN.
  //  - If file is provided: validate mimetype is image/* or application/pdf,
  //    upload via storageService.upload(file, 'support'), set fileUrl + derive
  //    fileType (SupportFileType.IMAGE for image/*, SupportFileType.PDF for pdf).
  //  - Return the saved Support.
  create(
    userId: number,
    dto: CreateSupportDto,
    file?: Express.Multer.File,
  ): Promise<Support> {
    throw new Error('Not implemented');
  }

  // TODO: Return every Support row where user.id === userId, ordered by
  // updatedAt DESC. No need to eager-load messages here.
  listForUser(userId: number): Promise<Support[]> {
    throw new Error('Not implemented');
  }

  // TODO: Paginated admin list.
  //  - Honor query.status (filter) and query.page / query.limit (defaults
  //    already applied by PaginationQueryDto: page=1, limit=10).
  //  - Use repository.findAndCount with order: { updatedAt: 'DESC' }.
  //  - Return { items, total, page, limit }.
  listForAdmin(query: ListSupportAdminQueryDto): Promise<{
    items: Support[];
    total: number;
    page: number;
    limit: number;
  }> {
    throw new Error('Not implemented');
  }

  // TODO: Load a chat by id with its messages and user.
  //  - If role === Role.USER: filter by { id: supportId, user: { id: userId } }
  //    (USER must own the chat — never trust the route param alone).
  //  - If role === Role.ADMIN: filter by { id: supportId } only.
  //  - 404 (NotFoundException) when not found.
  //  - Side effect: flip visualized = true on every message whose author is
  //    the OPPOSITE party (USER opens → messages where isUser === false;
  //    ADMIN opens → messages where isUser === true). Use messageRepo.update.
  //  - Return the Support with messages ordered by createdAt ASC.
  getOne(userId: number, role: Role, supportId: number): Promise<Support> {
    throw new Error('Not implemented');
  }

  // TODO: Finish a chat (USER only — controller already gates this, but
  // enforce ownership again here defensively).
  //  - Lookup with { id: supportId, user: { id: userId } }; 404 if missing.
  //  - If status === FINISHED, throw BadRequestException.
  //  - Set status = FINISHED, finishedAt = new Date(); save and return.
  finish(userId: number, supportId: number): Promise<Support> {
    throw new Error('Not implemented');
  }

  // TODO: Append a message to a chat.
  //  - Load the Support row: USER must own it (filter user.id = userId);
  //    ADMIN can post on any. 404 if not found / not owned.
  //  - Reject if support.status === FINISHED (BadRequestException).
  //  - Derive isUser from role (USER → true, ADMIN → false).
  //  - If file: validate mimetype (image/* or pdf), upload via
  //    storageService.upload(file, 'support/messages'), set fileUrl + fileType.
  //  - Persist with visualized = false, support: { id: supportId }.
  //  - Return the saved SupportMessage.
  addMessage(
    userId: number,
    role: Role,
    supportId: number,
    dto: CreateSupportMessageDto,
    file?: Express.Multer.File,
  ): Promise<SupportMessage> {
    throw new Error('Not implemented');
  }
}
