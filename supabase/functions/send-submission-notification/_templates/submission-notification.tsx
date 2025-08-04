import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
  Button,
  Link,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface SubmissionNotificationEmailProps {
  clientName: string;
  businessName: string;
  submissionNumber: string;
  totalPrice: number;
  approvalUrl: string;
  items: Array<{
    product_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
}

export const SubmissionNotificationEmail = ({
  clientName,
  businessName,
  submissionNumber,
  totalPrice,
  items,
  approvalUrl,
}: SubmissionNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Nouvelle soumission {submissionNumber} de l'Imprimerie Grégoire</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Nouvelle Soumission</Heading>
          <Text style={subtitle}>Soumission #{submissionNumber}</Text>
        </Section>

        <Section style={content}>
          <Text style={greeting}>
            Bonjour {clientName},
          </Text>
          
          <Text style={paragraph}>
            Nous avons le plaisir de vous transmettre une nouvelle soumission pour <strong>{businessName}</strong>.
          </Text>

          <Section style={itemsSection}>
            <Heading as="h2" style={h2}>Détails de la soumission</Heading>
            
            {items.map((item, index) => (
              <Section key={index} style={itemContainer}>
                <Row>
                  <Column style={itemName}>
                    <strong>{item.product_name}</strong>
                  </Column>
                  <Column style={itemQuantity}>
                    Qté: {item.quantity}
                  </Column>
                  <Column style={itemPrice}>
                    {item.unit_price.toFixed(2)}$ / unité
                  </Column>
                </Row>
                {item.description && (
                  <Row>
                    <Column>
                      <Text style={itemDescription}>{item.description}</Text>
                    </Column>
                  </Row>
                )}
                <Hr style={itemSeparator} />
              </Section>
            ))}
            
            <Section style={totalSection}>
              <Row>
                <Column style={totalLabel}>
                  <strong>Total:</strong>
                </Column>
                <Column style={totalAmount}>
                  <strong>{totalPrice.toFixed(2)}$ CAD</strong>
                </Column>
              </Row>
            </Section>
          </Section>

          <Text style={paragraph}>
            Cette soumission est valide pour une période de 30 jours. N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez modifier certains éléments.
          </Text>

          <Section style={buttonSection}>
            <Button style={approvalButton} href={approvalUrl}>
              ✓ Examiner et accepter la soumission
            </Button>
          </Section>

          <Section style={linkSection}>
            <Text style={linkText}>
              Ou copiez ce lien dans votre navigateur:
            </Text>
            <Link href={approvalUrl} style={linkUrl}>
              {approvalUrl}
            </Link>
          </Section>

          <Section style={contactInfo}>
            <Text style={contactText}>
              Pour toute question, vous pouvez:
            </Text>
            <Text style={contactDetails}>
              • Nous répondre directement à ce courriel<br />
              • Nous contacter au <strong>(418) 555-0123</strong>
            </Text>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Cordialement,<br />
            L'équipe de l'Imprimerie Grégoire
          </Text>
          <Hr style={hr} />
          <Text style={footerContact}>
            Imprimerie Grégoire<br />
            123 Rue de l'Impression, Québec, QC G1V 0A6<br />
            Téléphone: (418) 555-0123<br />
            Email: info@promotiongregoire.com
          </Text>
          <Text style={securityNote}>
            Ce lien est unique et sécurisé pour cette soumission.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '24px',
  backgroundColor: '#5a7a51',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const subtitle = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: '0.9',
};

const content = {
  padding: '24px',
};

const greeting = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#374151',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#374151',
  margin: '16px 0',
};

const h2 = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
};

const itemsSection = {
  margin: '24px 0',
};

const itemContainer = {
  margin: '8px 0',
};

const itemName = {
  fontSize: '16px',
  color: '#374151',
  fontWeight: '500',
  paddingRight: '12px',
};

const itemQuantity = {
  fontSize: '14px',
  color: '#6b7280',
  textAlign: 'center' as const,
  paddingRight: '12px',
};

const itemPrice = {
  fontSize: '14px',
  color: '#374151',
  textAlign: 'right' as const,
};

const itemDescription = {
  fontSize: '14px',
  color: '#6b7280',
  fontStyle: 'italic',
  margin: '4px 0 0',
};

const itemSeparator = {
  borderColor: '#e5e7eb',
  margin: '8px 0',
};

const totalSection = {
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '6px',
  margin: '16px 0',
};

const totalLabel = {
  fontSize: '18px',
  color: '#374151',
  textAlign: 'left' as const,
};

const totalAmount = {
  fontSize: '18px',
  color: '#5a7a51',
  textAlign: 'right' as const,
};

const footer = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '0 0 8px 8px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const footerContact = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.4',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const approvalButton = {
  backgroundColor: '#5a7a51',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '15px 40px',
  margin: '0',
};

const linkSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
};

const linkText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
};

const linkUrl = {
  fontSize: '13px',
  color: '#5a7a51',
  wordBreak: 'break-all' as const,
  textDecoration: 'underline',
};

const contactInfo = {
  backgroundColor: '#f0f0f0',
  padding: '16px',
  borderRadius: '6px',
  margin: '24px 0',
};

const contactText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 8px',
};

const contactDetails = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '1.4',
  margin: '0',
};

const securityNote = {
  fontSize: '12px',
  color: '#9ca3af',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  margin: '16px 0 0',
};