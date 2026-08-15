export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startDiscordBot } = await import("./src/lib/discord/bot");
  await startDiscordBot();
}
