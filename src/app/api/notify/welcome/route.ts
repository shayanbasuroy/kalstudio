import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { WelcomeEmailTemplate } from '@/components/emails/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Kal Studio <onboarding@resend.dev>',
      to: [email],
      subject: "Welcome to Kal Studio — Your Workspace is Ready!",
      react: WelcomeEmailTemplate({ name }) as React.ReactElement,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
