import z from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.email("正しいメールアドレスを入力してください"),
  message: z.string().min(1, "メッセージを入力してください"),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
