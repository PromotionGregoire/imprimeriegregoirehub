import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Hr,
  Section,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ProofNotificationEmailProps {
  clientName: string;
  businessName: string;
  approvalUrl: string;
  orderNumber: string;
  submissionNumber: string;
}

export const ProofNotificationEmail = ({
  clientName,
  businessName,
  approvalUrl,
  orderNumber,
  submissionNumber,
}: ProofNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Nouvelle épreuve à approuver pour votre commande {orderNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with logo */}
        <Section style={header}>
          <Img
            src="https://ytcrplsistsxfaxkfqqp.supabase.co/storage/v1/object/public/proofs/logo-imprimerie-gregoire.png"
            width="180"
            height="auto"
            alt="Imprimerie Grégoire"
            style={logo}
          />
        </Section>

        <Heading style={h1}>📋 Nouvelle épreuve à approuver</Heading>
        
        <Text style={text}>
          Bonjour {clientName},
        </Text>
        
        <Text style={text}>
          Nous avons le plaisir de vous informer qu'une nouvelle épreuve est prête pour approbation concernant votre commande.
        </Text>

        {/* Order details box */}
        <Section style={orderBox}>
          <Text style={orderTitle}>Détails de la commande</Text>
          <Text style={orderDetail}><strong>Entreprise :</strong> {businessName}</Text>
          <Text style={orderDetail}><strong>Numéro de commande :</strong> {orderNumber}</Text>
          <Text style={orderDetail}><strong>Soumission :</strong> {submissionNumber}</Text>
        </Section>

        <Text style={text}>
          Veuillez cliquer sur le bouton ci-dessous pour consulter et approuver votre épreuve sur notre portail sécurisé :
        </Text>

        {/* Main CTA Button */}
        <Section style={buttonContainer}>
          <Button style={button} href={approvalUrl}>
            Approuver l'épreuve
          </Button>
        </Section>

        <Text style={smallText}>
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
        </Text>
        <Text style={linkText}>
          <Link href={approvalUrl} style={link}>
            {approvalUrl}
          </Link>
        </Text>

        <Hr style={hr} />

        <Text style={text}>
          <strong>Important :</strong> Votre approbation nous permettra de procéder à la production de votre commande. Si des modifications sont nécessaires, vous pourrez les indiquer directement sur le portail.
        </Text>

        <Text style={text}>
          Pour toute question, n'hésitez pas à nous contacter directement par réponse à ce courriel ou par téléphone.
        </Text>

        <Text style={text}>
          Cordialement,<br />
          L'équipe d'Imprimerie Grégoire
        </Text>

        <Hr style={hr} />
        
        <Text style={footer}>
          <Link href="https://promotiongregoire.com" style={footerLink}>
            Imprimerie Grégoire
          </Link>
          <br />
          Votre partenaire de confiance en impression et promotion
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ProofNotificationEmail;

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
};

const header = {
  padding: '20px 30px',
  backgroundColor: '#ffffff',
  borderBottom: '3px solid #5a7a51',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 30px 20px 30px',
  padding: '0',
  lineHeight: '1.4',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 30px',
};

const orderBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 30px',
};

const orderTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const orderDetail = {
  color: '#374151',
  fontSize: '14px',
  margin: '8px 0',
  lineHeight: '1.4',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 30px',
};

const button = {
  backgroundColor: '#5a7a51',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: 'none',
  cursor: 'pointer',
};

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '16px 30px 8px 30px',
};

const linkText = {
  margin: '0 30px 20px 30px',
  wordBreak: 'break-all' as const,
};

const link = {
  color: '#5a7a51',
  fontSize: '14px',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 30px',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '20px 30px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#5a7a51',
  textDecoration: 'none',
  fontWeight: 'bold',
};