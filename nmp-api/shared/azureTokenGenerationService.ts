// azureTokenGenerationService.ts
import { AccessToken, DefaultAzureCredential } from '@azure/identity';

export async function generateToken(): Promise<AccessToken> {
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
