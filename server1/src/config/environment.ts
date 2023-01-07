const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

export class Environment {
  public static readonly IS_PROD: boolean = process.env.NODE_ENV === 'production';
  public static readonly DB_NAME: string = process.env.DB_NAME || 'talkative';
  public static readonly MONGO_URL: string = this.IS_PROD
    ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.llcwi.mongodb.net/${this.DB_NAME}`
    : `mongodb://127.0.0.1/${this.DB_NAME}`;
  public static readonly SERVER_PORT: number = Number(process.env.PORT) || 5001;
  public static readonly ISSUER: string = process.env.ISSUER || '';
}
