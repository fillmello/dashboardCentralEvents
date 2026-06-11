import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatusHistory } from 'src/common/entities/post.entity';
import { User } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enums/role.enum';
import { PostStatus } from 'src/common/enums/post.enum';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { AdvanceStatusDto } from './dtos/advance-status.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostStatusHistory)
    private statusHistoryRepository: Repository<PostStatusHistory>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    currentUser: User,
  ): Promise<Post> {
    // Apenas Gestor pode criar posts
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException('Apenas gestores podem criar posts');
    }

    const post = this.postsRepository.create({
      ...createPostDto,
      createdById: currentUser.id,
      updatedById: currentUser.id,
    });

    return this.postsRepository.save(post);
  }

  async findAll(currentUser: User, filters?: any): Promise<Post[]> {
    const query = this.postsRepository.createQueryBuilder('post');

    // Se não é gestor, vê apenas seus posts
    if (currentUser.role !== Role.GESTOR) {
      query.where('post.responsibleId = :responsibleId', {
        responsibleId: currentUser.id,
      });
    }

    // Aplicar filtros adicionais
    if (filters?.status) {
      query.andWhere('post.status = :status', { status: filters.status });
    }
    if (filters?.platform) {
      query.andWhere('post.platform = :platform', {
        platform: filters.platform,
      });
    }
    if (filters?.type) {
      query.andWhere('post.type = :type', { type: filters.type });
    }
    if (filters?.responsibleId && currentUser.role === Role.GESTOR) {
      query.andWhere('post.responsibleId = :responsibleId', {
        responsibleId: filters.responsibleId,
      });
    }

    return query
      .leftJoinAndSelect('post.responsible', 'responsible')
      .leftJoinAndSelect('post.createdBy', 'createdBy')
      .leftJoinAndSelect('post.updatedBy', 'updatedBy')
      .orderBy('post.updatedAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, currentUser: User): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: [
        'responsible',
        'createdBy',
        'updatedBy',
        'statusHistory',
        'statusHistory.changedBy',
      ],
    });

    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar acesso
    if (
      currentUser.role !== Role.GESTOR &&
      post.responsibleId !== currentUser.id
    ) {
      throw new ForbiddenException(
        'Você não tem acesso a este post',
      );
    }

    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    currentUser: User,
  ): Promise<Post> {
    // Apenas Gestor pode editar
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException('Apenas gestores podem editar posts');
    }

    const post = await this.findOne(id, currentUser);

    Object.assign(post, updatePostDto);
    post.updatedById = currentUser.id;

    return this.postsRepository.save(post);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Apenas Gestor pode deletar
    if (currentUser.role !== Role.GESTOR) {
      throw new ForbiddenException('Apenas gestores podem deletar posts');
    }

    const post = await this.findOne(id, currentUser);
    await this.postsRepository.remove(post);
  }

  async advanceStatus(
    id: string,
    advanceStatusDto: AdvanceStatusDto,
    currentUser: User,
  ): Promise<Post> {
    const post = await this.findOne(id, currentUser);

    // Verificar permissões de avanço por role
    this.validateStatusAdvance(
      currentUser.role,
      post.status,
      advanceStatusDto.newStatus,
    );

    // Registrar histórico
    const history = this.statusHistoryRepository.create({
      postId: post.id,
      previousStatus: post.status,
      newStatus: advanceStatusDto.newStatus,
      changedById: currentUser.id,
      reason: advanceStatusDto.reason,
    });

    await this.statusHistoryRepository.save(history);

    // Atualizar post
    post.status = advanceStatusDto.newStatus;
    post.updatedById = currentUser.id;

    return this.postsRepository.save(post);
  }

  private validateStatusAdvance(
    role: Role,
    currentStatus: PostStatus,
    targetStatus: PostStatus,
  ): void {
    const statusOrder = [
      PostStatus.NaoIniciado,
      PostStatus.Captando,
      PostStatus.Editando,
      PostStatus.Criando,
      PostStatus.Aprovacao,
      PostStatus.CopyCapa,
      PostStatus.EmPublicacao,
      PostStatus.Publicado,
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const targetIndex = statusOrder.indexOf(targetStatus);

    // Gestor pode fazer qualquer mudança
    if (role === Role.GESTOR) {
      return;
    }

    // Designer pode avançar até Aprovação
    if (role === Role.DESIGNER) {
      const designerLimit = statusOrder.indexOf(PostStatus.Aprovacao);
      if (targetIndex > designerLimit) {
        throw new BadRequestException(
          'Designer não pode avançar além da etapa de Aprovação',
        );
      }
      if (targetIndex < currentIndex) {
        throw new BadRequestException(
          'Designer não pode reverter posts',
        );
      }
      if (targetIndex <= currentIndex) {
        throw new BadRequestException('Status deve avançar na sequência');
      }
      return;
    }

    // Social Media pode avançar de Aprovação em diante
    if (role === Role.SOCIAL_MEDIA) {
      const socialMediaStart = statusOrder.indexOf(PostStatus.Aprovacao);
      if (currentIndex < socialMediaStart) {
        throw new BadRequestException(
          'Social Media não pode gerenciar posts antes da etapa de Aprovação',
        );
      }
      if (targetIndex < currentIndex) {
        throw new BadRequestException(
          'Social Media não pode reverter posts',
        );
      }
      if (targetIndex <= currentIndex) {
        throw new BadRequestException('Status deve avançar na sequência');
      }
      return;
    }
  }
}
