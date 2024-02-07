import { PasswordHash } from '@/utils/password-hash';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  name: 'name',
  query: {
    user: {
      async create({ args, query }) {
        const passwordHash = new PasswordHash();
        // take incoming password and hash it
        args.data.password = await passwordHash.hash(args.data.password);

        return query(args);
      },
    },
  },
  result: {
    user: {
      // removed password on fetching user
      password: {
        needs: {},
        compute() {
          return undefined;
        },
      },
    },
  },
});

export default prisma;
