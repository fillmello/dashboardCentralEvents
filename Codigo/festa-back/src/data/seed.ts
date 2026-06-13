import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/common/entities/user.entity';
import { Post } from 'src/common/entities/post.entity';
import { ScheduleItem } from 'src/common/entities/schedule-item.entity';
import { PostStatusLog } from 'src/common/entities/post-status-log.entity';
import { SEED_ACCOUNTS, SEED_PASSWORD } from './seed-accounts';

// Standalone seed: one account per role. Idempotent — skips emails that already
// exist. Run with: pnpm seed   (DATABASE_URL is read from the environment/.env).
// The same accounts are also seeded automatically on app boot (SeedService).

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:festa123@localhost:5432/festa_multiplicacao';

async function run(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: DATABASE_URL,
    entities: [User, Post, ScheduleItem, PostStatusLog],
    synchronize: false,
  });

  await dataSource.initialize();
  const users = dataSource.getRepository(User);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const account of SEED_ACCOUNTS) {
    const existing = await users.findOne({ where: { email: account.email } });
    if (existing) {
      console.log(
        `• skip  ${account.role.padEnd(10)} ${account.email} (already exists)`,
      );
      continue;
    }
    await users.save(
      users.create({
        fullName: account.fullName,
        email: account.email,
        password: passwordHash,
        role: account.role,
      }),
    );
    console.log(`✓ seed  ${account.role.padEnd(10)} ${account.email}`);
  }

  await dataSource.destroy();
  console.log(
    `\nDone. Shared password for all seeded accounts: ${SEED_PASSWORD}`,
  );
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
