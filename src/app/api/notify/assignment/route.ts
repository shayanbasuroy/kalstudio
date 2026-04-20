import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { AssignmentEmailTemplate } from '@/components/emails/AssignmentEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, name, clientName, serviceType, deadline } = await request.json();

    if (!email || !name || !clientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Kal Studio Missions <onboarding@resend.dev>',
      to: [email],
      subject: `New Mission assigned: ${clientName}`,
      react: AssignmentEmailTemplate({ name, clientName, serviceType, deadline }) as React.ReactElement,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
