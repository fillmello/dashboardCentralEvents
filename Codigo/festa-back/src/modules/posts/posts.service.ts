import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Post } from 'src/common/entities/post.entity';
import { PostStatusLog } from 'src/common/entities/post-status-log.entity';
import { User } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enums/role.enum';
import { PostStatus, pipelineIndex } from 'src/common/enums/post-status.enum';
import { CreatePostDto } from 'src/common/dtos/post/create-post.dto';
import { UpdatePostDto } from 'src/common/dtos/post/update-post.dto';
import { PostQueryDto } from 'src/common/dtos/post/post-query.dto';
import { PostsGateway } from './posts.gateway';

interface Actor {
  sub: number;
  role: Role;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostStatusLog)
    private logsRepository: Repository<PostStatusLog>,
    private gateway: PostsGateway,
  ) {}

  // --- Reads ----------------------------------------------------------------

  // RF-04 filters + RF-08/09 visibility. Gestão and Painel see everything (with
  // optional responsável filter); Individual only ever sees its own tasks.
  findAll(query: PostQueryDto, actor: Actor): Promise<Post[]> {
    const where: FindOptionsWhere<Post> = {};
    if (query.platform) where.platform = query.platform;
    if (query.type) where.type = query.type;
    if (query.format) where.format = query.format;
    if (query.status) where.status = query.status;

    if (seesAllPosts(actor.role)) {
      if (query.responsibleId)
        where.responsible = { id: query.responsibleId };
    } else {
      where.responsible = { id: actor.sub };
    }

    return this.postsRepository.find({
      where,
      relations: { responsible: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number, actor: Actor): Promise<Post> {
    const post = await this.findVisibleOrFail(id, actor);
    return post;
  }

  // --- Writes (Gestão only — guarded at the controller) ---------------------

  async create(dto: CreatePostDto, actor: Actor): Promise<Post> {
    const post = this.postsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      platform: dto.platform,
      type: dto.type,
      format: dto.format,
      status: PostStatus.NAO_INICIADO,
      responsible: dto.responsibleId
        ? ({ id: dto.responsibleId } as User)
        : null,
    });
    const saved = await this.postsRepository.save(post);

    await this.logsRepository.save(
      this.logsRepository.create({
        post: { id: saved.id } as Post,
        changedBy: { id: actor.sub } as User,
        fromStatus: null,
        toStatus: PostStatus.NAO_INICIADO,
      }),
    );

    const full = await this.reload(saved.id);
    this.gateway.emitCreated(full);
    return full;
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post não encontrado');

    if (dto.name !== undefined) post.name = dto.name;
    if (dto.description !== undefined) post.description = dto.description ?? null;
    if (dto.platform !== undefined) post.platform = dto.platform;
    if (dto.type !== undefined) post.type = dto.type;
    if (dto.format !== undefined) post.format = dto.format;
    if (dto.responsibleId !== undefined)
      post.responsible = dto.responsibleId
        ? ({ id: dto.responsibleId } as User)
        : null;

    await this.postsRepository.save(post);
    const full = await this.reload(id);
    this.gateway.emitUpdated(full);
    return full;
  }

  async remove(id: number): Promise<void> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Post não encontrado');
    this.gateway.emitDeleted(id);
  }

  // --- Status pipeline (RF-05/06/07) ----------------------------------------

  async updateStatus(
    id: number,
    target: PostStatus,
    actor: Actor,
  ): Promise<Post> {
    const post = await this.findVisibleOrFail(id, actor);
    this.assertCanTransition(actor.role, post.status, target);

    const from = post.status;
    post.status = target;
    await this.postsRepository.save(post);

    await this.logsRepository.save(
      this.logsRepository.create({
        post: { id } as Post,
        changedBy: { id: actor.sub } as User,
        fromStatus: from,
        toStatus: target,
      }),
    );

    const full = await this.reload(id);
    this.gateway.emitUpdated(full);
    return full;
  }

  /**
   * Gestão moves freely (any direction/stage). Individual has exactly two
   * actions on its own task: "Começar" (Não iniciado → Captando) and "Entregar"
   * (qualquer etapa em andamento → Publicado). Painel never changes status.
   */
  private assertCanTransition(
    role: Role,
    from: PostStatus,
    to: PostStatus,
  ): void {
    if (from === to)
      throw new BadRequestException('O post já está nesse status');

    if (role === Role.GESTAO) return;

    if (role === Role.INDIVIDUAL) {
      const started =
        from === PostStatus.NAO_INICIADO && to === PostStatus.CAPTANDO;
      const fromIdx = pipelineIndex(from);
      const delivered =
        to === PostStatus.PUBLICADO &&
        fromIdx >= pipelineIndex(PostStatus.CAPTANDO) &&
        fromIdx < pipelineIndex(PostStatus.PUBLICADO);
      if (started || delivered) return;
      throw new ForbiddenException(
        'Você só pode começar ou entregar a tarefa',
      );
    }

    throw new ForbiddenException('Seu perfil não pode alterar o status');
  }

  // --- Helpers --------------------------------------------------------------

  private async reload(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: { responsible: true },
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    return post;
  }

  private async findVisibleOrFail(id: number, actor: Actor): Promise<Post> {
    const where: FindOptionsWhere<Post> = { id };
    if (!seesAllPosts(actor.role)) where.responsible = { id: actor.sub };
    const post = await this.postsRepository.findOne({
      where,
      relations: { responsible: true },
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    return post;
  }
}

// Gestão and Painel have global visibility; Individual is scoped to its own.
function seesAllPosts(role: Role): boolean {
  return role === Role.GESTAO || role === Role.PAINEL;
}
