
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ResetPasswordEmailProps {
  email: string;
  resetLink: string;
}

export const ResetPasswordEmail = ({
  email,
  resetLink,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>إعادة تعيين كلمة المرور</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>إعادة تعيين كلمة المرور</Heading>
        <Text style={text}>
          مرحباً،
          <br />
          لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. انقر على الرابط أدناه لإعادة تعيين كلمة المرور:
        </Text>
        <Link href={resetLink} target="_blank" style={button}>
          إعادة تعيين كلمة المرور
        </Link>
        <Text style={text}>
          إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui',
}

const container = {
  padding: '2rem',
  margin: '0 auto',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'right' as const,
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'right' as const,
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '16px 0',
}

export default ResetPasswordEmail
