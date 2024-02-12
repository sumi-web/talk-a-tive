import { passwordHash } from '@/utils/password-hash';
import { PrismaClient, type User } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  name: 'name',
  // ## better use exclude to remove password
  // model: {
  //   user: {
  //     async signUp(data: User) {
  //       const hash = await passwordHash.hash(data.password);

  //       const user = await prisma.user.create({
  //         data: {
  //           ...data,
  //           password: hash,
  //         },
  //       });

  //       const { password, ...rest } = user;

  //       return rest;
  //     },
  //     // fetch user without password
  //     async getUserWithoutPassword({ email, id }: { id?: number; email?: string }) {
  //       if (email || id) {
  //         const user = await prisma.user.findUnique({
  //           where: { email, id },
  //         });

  //         if (user) {
  //           const { password, ...rest } = user;
  //           return rest;
  //         }
  //       }
  //     },
  //   },
  // },
});

export default prisma;
