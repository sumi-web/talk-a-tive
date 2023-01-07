const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

export class Environment {
  public static isProd: boolean = process.env.NODE_ENV === 'production';
  public static dbName: string = process.env.DB_NAME || 'talkative';
  public static mongoUrl: string = this.isProd
    ? `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.llcwi.mongodb.net/${this.dbName}`
    : `mongodb://127.0.0.1/${this.dbName}`;
  public static serverPort: number = Number(process.env.PORT) || 5001;
  public static issuer: string = process.env.ISSUER || '';
}
