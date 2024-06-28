import { v4 as uuidv4 } from 'uuid';
export const createUserWithOrganisationReqBody: any = {
  User: {
    GivenName: 'Test',
    Surname: 'Test',
    Email: 'test@gmail.com',
    UserIdentifier: uuidv4(),
  },
  Organisation: {
    ID: 'b5288e67-ce45-41ec-9dc2-98643634cfcd',
    Name: 'My organisation',
  },
};

export const userData = {
  GivenName: 'Test',
  Surname: 'Test',
  Email: 'test@gmail.com',
  UserIdentifier: uuidv4(),
};

export const userData2 = {
  GivenName: 'Test2',
  Surname: 'Test2',
  Email: 'test2@gmail.com',
  UserIdentifier: uuidv4(),
};
