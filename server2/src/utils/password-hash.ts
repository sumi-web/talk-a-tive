import argon2 from 'argon2';

export class PasswordHash {
  public async hash(password: string) {
    try {
      const hash = await argon2.hash(password);
      return hash;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  public async comparePassword(hashedPass: string, currPassword: string) {
    try {
      if (await argon2.verify(hashedPass, currPassword)) {
        // password match
        return true;
      } else {
        // password did not match
        return false;
      }
    } catch (err: any) {
      // internal failure
      throw new Error(err);
    }
  }
}
