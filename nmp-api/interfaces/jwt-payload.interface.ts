export class JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  acr: string;
  nonce: string;
  aal: string;
  serviceId: string;
  correlationId: string;
  currentRelationshipId: string;
  sessionId: string;
  email: string;
  contactId: string;
  firstName: string;
  lastName: string;
  uniqueReference: string;
  relationships: string[];
  roles: string[];
}
