import http, { IncomingMessage, ServerResponse } from "http";
import { URL } from "url";

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

let nextId = 3;
const posts: Post[] = [
  { id: 1, title: "First post", body: "This is the content of the first post.", userId: 1 },
  { id: 2, title: "Second post", body: "This is the content of the second post.", userId: 2 }
];

const port = Number(process.env.PORT ?? 3000);

function sendJson(response: http.ServerResponse, statusCode: number, data: unknown) {
  const body = JSON.stringify(data, null, 2);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body, "utf8").toString()
  });
  response.end(body);
}

function sendText(response: http.ServerResponse, statusCode: number, text: string) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(text);
}

function parseBody(request: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    request.on("end", () => {
      const body = Buffer.concat(chunks).toString();
      if (!body) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });
    request.on("error", reject);
  });
}

const server = http.createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const requestUrl = new URL(request.url ?? "", `http://${request.headers.host ?? "localhost"}`);
  const pathname = requestUrl.pathname;
  const method = request.method ?? "GET";

  if (pathname === "/") {
    sendText(response, 200, "Node.js server running. Use /posts for the CRUD API.");
    return;
  }

  if (!pathname.startsWith("/posts")) {
    sendJson(response, 404, { error: "Route not found" });
    return;
  }

  const parts = pathname.split("/").filter(Boolean);
  const idSegment = parts.length === 2 ? Number(parts[1]) : NaN;
  const isPostById = parts.length === 2 && !Number.isNaN(idSegment);

  try {
    if (pathname === "/posts" && method === "GET") {
      sendJson(response, 200, posts);
      return;
    }

    if (pathname === "/posts" && method === "POST") {
      const body = await parseBody(request);
      if (!body || typeof body.title !== "string" || typeof body.body !== "string") {
        sendJson(response, 400, { error: "Title and body are required in JSON format." });
        return;
      }

      const newPost: Post = {
        id: nextId++,
        title: body.title,
        body: body.body,
        userId: typeof body.userId === "number" ? body.userId : 1
      };

      posts.push(newPost);
      sendJson(response, 201, newPost);
      return;
    }

    if (isPostById && method === "GET") {
      const post = posts.find((item) => item.id === idSegment);
      if (!post) {
        sendJson(response, 404, { error: "Post not found." });
        return;
      }
      sendJson(response, 200, post);
      return;
    }

    if (isPostById && method === "PUT") {
      const postIndex = posts.findIndex((item) => item.id === idSegment);
      if (postIndex === -1) {
        sendJson(response, 404, { error: "Post not found." });
        return;
      }

      const body = await parseBody(request);
      if (!body || (body.title === undefined && body.body === undefined && body.userId === undefined)) {
        sendJson(response, 400, { error: "Title, body or userId is required for update." });
        return;
      }

      const updatedPost = {
        ...posts[postIndex],
        title: typeof body.title === "string" ? body.title : posts[postIndex].title,
        body: typeof body.body === "string" ? body.body : posts[postIndex].body,
        userId: typeof body.userId === "number" ? body.userId : posts[postIndex].userId
      };
      posts[postIndex] = updatedPost;
      sendJson(response, 200, updatedPost);
      return;
    }

    if (isPostById && method === "DELETE") {
      const postIndex = posts.findIndex((item) => item.id === idSegment);
      if (postIndex === -1) {
        sendJson(response, 404, { error: "Post not found." });
        return;
      }
      const deleted = posts.splice(postIndex, 1)[0];
      sendJson(response, 200, deleted);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed on this route." });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Internal server error." });
  }
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
