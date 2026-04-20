import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { ApprovalEmailTemplate } from '@/components/emails/ApprovalEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json();

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Kal Studio <onboarding@resend.dev>',
      to: [email],
      subject: "Welcome to the Studio — You're Approved!",
      react: ApprovalEmailTemplate({ name, role }) as React.ReactElement,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
