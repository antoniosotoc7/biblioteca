import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
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

const cleanBook = (book) => {
  const rating = Number(book?.rating);
  return {
    id: String(book?.id || crypto.randomUUID()),
    title: normalize(book?.title),
    author: String(book?.author || "").trim(),
    readDate: String(book?.readDate || ""),
    rating,
    recommended: rating === 5 ? "Sí" : "No",
  };
};

export default async (request) => {
  try {
    const store = getStore("user-libraries");

    if (request.method === "GET") {
      const url = new URL(request.url);
      const user = normalize(url.searchParams.get("user"));

      if (!user) return json({ error: "Falta el usuario" }, 400);

      const key = await hash(user);
      const stored = await store.get(key, {
        type: "json",
        consistency: "strong",
      });

      return json({
        books: Array.isArray(stored?.books) ? stored.books : [],
      });
    }

    if (request.method === "POST") {
      const body = await request.json();
      const user = normalize(body.user);

      if (!user || !Array.isArray(body.books)) {
        return json({ error: "Datos inválidos" }, 400);
      }

      const books = body.books
        .slice(0, 2000)
        .map(cleanBook)
        .filter(
          (book) =>
            book.title &&
            book.author &&
            /^\d{4}-\d{2}-\d{2}$/.test(book.readDate) &&
            Number.isInteger(book.rating) &&
            book.rating >= 1 &&
            book.rating <= 5
        );

      const unique = [];
      const titles = new Set();

      for (const book of books) {
        if (!titles.has(book.title)) {
          titles.add(book.title);
          unique.push(book);
        }
      }

      const key = await hash(user);
      await store.setJSON(
        key,
        {
          books: unique,
          updatedAt: new Date().toISOString(),
        },
        { consistency: "strong" }
      );

      return json({ ok: true, books: unique });
    }

    return json({ error: "Método no permitido" }, 405);
  } catch (error) {
    console.error("library error", error);
    return json({ error: "No se pudo acceder a la biblioteca" }, 500);
  }
};

export const config = {
  path: "/api/library",
};
