import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

// Windows/Next.js Turbopack ignora dns.setServers() para querySrv do Atlas.
// Forçamos resolução via Google/Cloudflare DNS e fazemos fallback para hosts diretos.
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const globalMongo = globalThis as typeof globalThis & {
  __hollowMongoClient?: MongoClient;
  __hollowMongoPromise?: Promise<MongoClient>;
};

function getSrvUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "MONGODB_URI não configurada. Confira o arquivo .env.local e reinicie o npm run dev.",
    );
  }
  return uri;
}

function getDirectUri(): string | null {
  const uri = process.env.MONGODB_DIRECT_URI?.trim();
  return uri || null;
}

async function tryConnect(uri: string, label: string): Promise<MongoClient> {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10_000,
    connectTimeoutMS: 10_000,
  });
  await client.connect();
  console.log(`[mongo] Connected via ${label}`);
  return client;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (globalMongo.__hollowMongoClient) {
    return globalMongo.__hollowMongoClient;
  }

  if (!globalMongo.__hollowMongoPromise) {
    globalMongo.__hollowMongoPromise = (async () => {
      // Tentativa 1: URI SRV original (funciona em Linux/macOS)
      try {
        const client = await tryConnect(getSrvUri(), "SRV");
        globalMongo.__hollowMongoClient = client;
        return client;
      } catch (srvError) {
        console.warn("[mongo] SRV failed:", srvError instanceof Error ? srvError.message : srvError);
      }

      // Tentativa 2: Hosts diretos (fallback para Windows/Turbopack)
      const directUri = getDirectUri();
      if (directUri) {
        try {
          const client = await tryConnect(directUri, "direct-hosts");
          globalMongo.__hollowMongoClient = client;
          return client;
        } catch (directError) {
          globalMongo.__hollowMongoPromise = undefined;
          globalMongo.__hollowMongoClient = undefined;
          const message =
            directError instanceof Error ? directError.message : "falha desconhecida";
          throw new Error(
            `Falha ao conectar no MongoDB: ${message}. No Atlas → Network Access, libere seu IP (ou 0.0.0.0/0 para teste).`,
          );
        }
      }

      globalMongo.__hollowMongoPromise = undefined;
      globalMongo.__hollowMongoClient = undefined;
      throw new Error(
        "Falha ao conectar no MongoDB pela URI SRV. Defina MONGODB_DIRECT_URI no .env.local para o fallback de hosts diretos.",
      );
    })();
  }

  return globalMongo.__hollowMongoPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB?.trim() || "hollow";
  return client.db(dbName);
}
