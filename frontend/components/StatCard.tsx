import { Card, CardHeader, CardBody, Heading, Text } from '@chakra-ui/react';

export const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <Card shadow="md" p={4} borderRadius="xl">
    <CardHeader pb={1}>
      <Heading size="sm">{title}</Heading>
    </CardHeader>
    <CardBody>
      <Text fontSize="2xl" fontWeight="bold">
        {value}
      </Text>
    </CardBody>
  </Card>
);
