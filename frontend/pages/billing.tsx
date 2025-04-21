import { Box, Button, Heading, SimpleGrid, useToast } from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';

const CHECKOUT = gql`
  mutation ($tenantId: String!, $plan: Plan!) {
    createCheckout(tenantId: $tenantId, plan: $plan)
  }
`;

export default function Billing() {
  const [checkout] = useMutation(CHECKOUT);
  const toast = useToast();
  const tenantId = 'default-tenant'; // TODO: JWT から

  const handle = async (plan: string) => {
    const { data } = await checkout({ variables: { tenantId, plan } });
    if (data?.createCheckout) {
      window.location.href = data.createCheckout;
    } else {
      toast({ title: 'Error', status: 'error' });
    }
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Upgrade Plan</Heading>
      <SimpleGrid columns={[1, 3]} spacing={6}>
        <Button onClick={() => handle('STARTER')}>Starter ¥9,800</Button>
        <Button onClick={() => handle('BUSINESS')} colorScheme="teal">
          Business ¥39,800
        </Button>
        <Button onClick={() => handle('ENTERPRISE')} colorScheme="purple">
          Enterprise Contact us
        </Button>
      </SimpleGrid>
    </Box>
  );
}
