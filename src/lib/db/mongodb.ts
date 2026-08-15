import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

// Alguns DNS locais (Windows/ISP) recusam querySrv do Atlas.
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const globalMongo = globalThis as typeof globalThis & {
  __hollowMongoClient?: MongoClient;
  __hollowMongoPromise?: Promise<MongoClient>;
};

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI não configurada. Confira o arquivo .env.local e reinicie o npm run dev.",
    );
  }
  return uri;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (globalMongo.__hollowMongoClient) {
    return globalMongo.__hollowMongoClient;
  }

  if (!globalMongo.__hollowMongoPromise) {
    const client = new MongoClient(getMongoUri(), {
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 15_000,
    });

    globalMongo.__hollowMongoPromise = client
      .connect()
      .then((connected) => {
        globalMongo.__hollowMongoClient = connected;
        return connected;
      })
      .catch((error) => {
        globalMongo.__hollowMongoPromise = undefined;
        globalMongo.__hollowMongoClient = undefined;

        const message =
          error instanceof Error ? error.message : "falha desconhecida";
        throw new Error(
          `Falha ao conectar no MongoDB: ${message}. No Atlas → Network Access, libere seu IP (ou 0.0.0.0/0 para teste).`,
        );
      });
  }

  return globalMongo.__hollowMongoPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB?.trim() || "hollow";
  return client.db(dbName);
}
