import z from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: 'Name must be string',
      })
      .min(2)
      .max(30),
    email: z.string().email().max(50),
    password: z.string().min(6),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email().max(50),
    password: z.string().min(6),
  }),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;

export const RevokeUserAccessSchema = z.object({
  params: z.object({
    userId: z.string({
      required_error: 'userId is required',
    }),
  }),
});

export type RevokeUserAccessParamType = z.infer<typeof RevokeUserAccessSchema>;
