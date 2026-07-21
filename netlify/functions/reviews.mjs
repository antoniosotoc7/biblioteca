import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const normalize = (value = "") =>
  String(value).trim().replace(/\s+/g, " ").toLocaleUpperCase("es-ES");

const hash = async (value) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }

  try {
    const body = await request.json();
    const user = normalize(body.user);
    const title = normalize(body.title);
    const author = String(body.author || "").trim();
    const rating = Number(body.rating);
    const readDate = String(body.readDate || "");

    if (
      !user ||
      !title ||
      !author ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(readDate)
    ) {
      return json({ error: "Datos incompletos o inválidos" }, 400);
    }

    const store = getStore("book-reviews");
    const key = await hash(`${user}::${title}`);

    await store.setJSON(key, {
      userHash: await hash(user),
      title,
      author,
      rating,
      recommended: rating === 5 ? "Sí" : "No",
      readDate,
      updatedAt: new Date().toISOString(),
    });

    return json({ ok: true });
  } catch (error) {
    console.error("reviews error", error);
    return json({ error: "No se pudo guardar la valoración" }, 500);
  }
};

export const config = {
  path: "/api/reviews",
};
