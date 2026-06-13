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
import { PostStatus } from 'src/common/enums/post-status.enum';
import { CreatePostDto } from 'src/common/dtos/post/create-post.dto';
import { UpdatePostDto } from 'src/common/dtos/post/update-post.dto';
import { PostQueryDto } from 'src/common/dtos/post/post-query.dto';
import { ApprovePostDto } from 'src/common/dtos/post/approve-post.dto';
import { PostsGateway } from './posts.gateway';

interface Actor {
  sub: number;
  role: Role;
}

// Every post read hydrates the production responsible plus the Copy/Capa
// assignees, so the board and the per-account scoping can rely on all three.
const POST_RELATIONS = {
  responsible: true,
  copyResponsible: true,
  capaResponsible: true,
} as const;

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
  // optional responsável filter); Individual sees any task it owns — as the
  // production responsible OR as the Copy/Capa assignee.
  findAll(query: PostQueryDto, actor: Actor): Promise<Post[]> {
    const base: FindOptionsWhere<Post> = {};
    if (query.platform) base.platform = query.platform;
    if (query.type) base.type = query.type;
    if (query.format) base.format = query.format;
    if (query.status) base.status = query.status;

    let where: FindOptionsWhere<Post> | FindOptionsWhere<Post>[];
    if (seesAllPosts(actor.role)) {
      if (query.responsibleId) base.responsible = { id: query.responsibleId };
      where = base;
    } else {
      where = this.ownedByWhere(base, actor.sub);
    }

    return this.postsRepository.find({
      where,
      relations: POST_RELATIONS,
      order: { updatedAt: 'DESC' },
    });
  }

  // OR across the three responsável relations — an Individual owns a post if it
  // produces it, writes the copy, or makes the capa. Returned as an array so
  // TypeORM ORs the conditions while keeping the shared filters in each branch.
  private ownedByWhere(
    base: FindOptionsWhere<Post>,
    userId: number,
  ): FindOptionsWhere<Post>[] {
    return [
      { ...base, responsible: { id: userId } },
      { ...base, copyResponsible: { id: userId } },
      { ...base, capaResponsible: { id: userId } },
    ];
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
    if (dto.description !== undefined)
      post.description = dto.description ?? null;
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
    this.assertCanTransition(actor, post, target);

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
   * Gestão approval (RF-06): decides whether Copy and/or Capa are needed and who
   * does each, then moves the post to the first required stage (Copy → Capa →
   * Em publicação). Only valid while the post sits in APROVACAO.
   */
  async approve(id: number, dto: ApprovePostDto, actor: Actor): Promise<Post> {
    const post = await this.findVisibleOrFail(id, actor);
    if (post.status !== PostStatus.APROVACAO)
      throw new BadRequestException('O post não está em aprovação');
    if (dto.needsCopy && !dto.copyResponsibleId)
      throw new BadRequestException('Selecione um responsável pela copy');
    if (dto.needsCapa && !dto.capaResponsibleId)
      throw new BadRequestException('Selecione um responsável pela capa');

    post.needsCopy = dto.needsCopy;
    post.needsCapa = dto.needsCapa;
    post.copyResponsible = dto.needsCopy
      ? ({ id: dto.copyResponsibleId } as User)
      : null;
    post.capaResponsible = dto.needsCapa
      ? ({ id: dto.capaResponsibleId } as User)
      : null;

    const target = dto.needsCopy
      ? PostStatus.COPY
      : dto.needsCapa
        ? PostStatus.CAPA
        : PostStatus.EM_PUBLICACAO;

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
   * Gestão moves freely (any direction/stage). Individual acts only on its own
   * task: "Começar" (Não iniciado → Captando) and "Entregar" (Captando/Editando
   * → Aprovação) as the production responsible; "Concluir" the Copy or Capa step
   * as the respective assignee, jumping to the next required stage. Painel never
   * changes status.
   */
  private assertCanTransition(actor: Actor, post: Post, to: PostStatus): void {
    const from = post.status;
    if (from === to)
      throw new BadRequestException('O post já está nesse status');

    if (actor.role === Role.GESTAO) return;

    if (actor.role === Role.INDIVIDUAL) {
      const isMain = post.responsible?.id === actor.sub;
      const isCopy = post.copyResponsible?.id === actor.sub;
      const isCapa = post.capaResponsible?.id === actor.sub;

      // Começar (Não iniciado → Captando)
      if (
        isMain &&
        from === PostStatus.NAO_INICIADO &&
        to === PostStatus.CAPTANDO
      )
        return;
      // Avançar para edição (Captando → Editando)
      if (isMain && from === PostStatus.CAPTANDO && to === PostStatus.EDITANDO)
        return;
      // Entregar para aprovação (Editando → Aprovação)
      if (isMain && from === PostStatus.EDITANDO && to === PostStatus.APROVACAO)
        return;
      // Concluir Copy → Capa (se necessária) ou Em publicação
      if (
        isCopy &&
        from === PostStatus.COPY &&
        to === (post.needsCapa ? PostStatus.CAPA : PostStatus.EM_PUBLICACAO)
      )
        return;
      // Concluir Capa → Em publicação
      if (isCapa && from === PostStatus.CAPA && to === PostStatus.EM_PUBLICACAO)
        return;

      throw new ForbiddenException('Ação não permitida para a sua tarefa');
    }

    throw new ForbiddenException('Seu perfil não pode alterar o status');
  }

  // --- Helpers --------------------------------------------------------------

  private async reload(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: POST_RELATIONS,
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    return post;
  }

  private async findVisibleOrFail(id: number, actor: Actor): Promise<Post> {
    const where: FindOptionsWhere<Post> | FindOptionsWhere<Post>[] =
      seesAllPosts(actor.role) ? { id } : this.ownedByWhere({ id }, actor.sub);
    const post = await this.postsRepository.findOne({
      where,
      relations: POST_RELATIONS,
    });
    if (!post) throw new NotFoundException('Post não encontrado');
    return post;
  }
}

// Gestão and Painel have global visibility; Individual is scoped to its own.
function seesAllPosts(role: Role): boolean {
  return role === Role.GESTAO || role === Role.PAINEL;
}
