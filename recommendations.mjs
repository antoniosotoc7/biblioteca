import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=30",
    },
  });

const normalize = (value = "") =>
  String(value).trim().replace(/\s+/g, " ").toLocaleUpperCase("es-ES");

export default async (request) => {
  if (request.method !== "GET") return json({ error: "Método no permitido" }, 405);

  try {
    const store = getStore({ name: "book-reviews" });
    const { blobs } = await store.list();
    const reviews = await Promise.all(
      blobs.slice(0, 1000).map(({ key }) => store.get(key, { type: "json" }))
    );

    const grouped = new Map();
    for (const review of reviews.filter(Boolean)) {
      const title = normalize(review.title);
      const groupKey = title;
      const current = grouped.get(groupKey) || {
        title,
        author: review.author || "Autor desconocido",
        total: 0,
        ratingSum: 0,
        recommendedYes: 0,
      };
      current.total += 1;
      current.ratingSum += Number(review.rating) || 0;
      if ((Number(review.rating) || 0) === 5) current.recommendedYes += 1;
      grouped.set(groupKey, current);
    }

    const result = [...grouped.values()]
      .map((book) => ({
        ...book,
        recommendPercent: Math.round((book.recommendedYes / book.total) * 100),
        averageRating: Number((book.ratingSum / book.total).toFixed(1)),
      }))
      .sort((a, b) =>
        b.recommendPercent - a.recommendPercent ||
        b.total - a.total ||
        b.averageRating - a.averageRating ||
        a.title.localeCompare(b.title, "es")
      );

    return json(result);
  } catch (error) {
    console.error(error);
    return json({ error: "No se pudieron obtener las recomendaciones" }, 500);
  }
};

export const config = { path: "/api/recommendations" };
