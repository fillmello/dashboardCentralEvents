import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatusHistory } from 'src/common/entities/post.entity';
import { User } from 'src/common/entities/user.entity';
import { PostStatus } from 'src/common/enums/post.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostStatusHistory)
    private statusHistoryRepository: Repository<PostStatusHistory>,
  ) {}

  async getDashboardMetrics(): Promise<any> {
    const totalPosts = await this.postsRepository.count();

    const statusCounts = await this.postsRepository
      .createQueryBuilder('post')
      .select('post.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('post.status')
      .getRawMany();

    const publishedCount =
      statusCounts.find((s) => s.status === PostStatus.Publicado)
        ?.count || 0;

    const publishedPercentage =
      totalPosts > 0 ? (publishedCount / totalPosts) * 100 : 0;

    const typeCounts = await this.postsRepository
      .createQueryBuilder('post')
      .select('post.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('post.type')
      .getRawMany();

    const inProgress = totalPosts - publishedCount;

    return {
      total: totalPosts,
      published: publishedCount,
      publishedPercentage: publishedPercentage.toFixed(2),
      inProgress: inProgress,
      notStarted:
        statusCounts.find((s) => s.status === PostStatus.NaoIniciado)
          ?.count || 0,
      byStatus: statusCounts.reduce(
        (acc, cur) => {
          acc[cur.status] = cur.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byType: typeCounts.reduce(
        (acc, cur) => {
          acc[cur.type] = cur.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }

  async getUserMetrics(userId: string): Promise<any> {
    const userPosts = await this.postsRepository.find({
      where: { responsibleId: userId },
    });

    const totalAssigned = userPosts.length;
    const published = userPosts.filter(
      (p) => p.status === PostStatus.Publicado,
    ).length;
    const inProgress = totalAssigned - published;

    return {
      userId,
      totalAssigned,
      published,
      inProgress,
      publishedPercentage:
        totalAssigned > 0
          ? ((published / totalAssigned) * 100).toFixed(2)
          : 0,
    };
  }

  async getTimelineMetrics(): Promise<any> {
    const histories = await this.statusHistoryRepository.find({
      relations: ['post'],
      order: { createdAt: 'DESC' },
    });

    const statusTransitions: any = {};

    for (const history of histories) {
      const key = `${history.previousStatus}_to_${history.newStatus}`;
      if (!statusTransitions[key]) {
        statusTransitions[key] = [];
      }
      statusTransitions[key].push(history);
    }

    // Calculate average time per transition
    const avgTimePerTransition: any = {};
    for (const [key, transitions] of Object.entries(statusTransitions)) {
      const times = (transitions as PostStatusHistory[]).map((t) => {
        const prev = statusTransitions[key].find(
          (h: PostStatusHistory) => h.id === t.id,
        );
        return prev ? prev.createdAt.getTime() : 0;
      });

      const avgTime =
        times.reduce((a, b) => a + b, 0) / (times.length || 1);
      avgTimePerTransition[key] = avgTime;
    }

    return {
      statusTransitions: Object.keys(statusTransitions).length,
      avgTimePerTransition,
    };
  }

  async getPlatformMetrics(): Promise<any> {
    const platformCounts = await this.postsRepository
      .createQueryBuilder('post')
      .select('post.platform', 'platform')
      .addSelect('COUNT(*)', 'count')
      .groupBy('post.platform')
      .getRawMany();

    return platformCounts.reduce(
      (acc, cur) => {
        acc[cur.platform] = cur.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
