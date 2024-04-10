// azureTokenGenerationService.ts
import { AccessToken, DefaultAzureCredential } from '@azure/identity';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';

export async function generateToken(): Promise<AccessToken> {
  if (process.env.NODE_ENV === 'production') {
    throw new UnauthorizedException(HttpStatus.UNAUTHORIZED, 'This route is not authorized on production');
  }
  try {
    const credential = new DefaultAzureCredential();
    //const scopes = ['https://management.azure.com/.default'];
    const tokenResponse = await credential.getToken('.default');
    console.log(tokenResponse);
    return tokenResponse;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}
