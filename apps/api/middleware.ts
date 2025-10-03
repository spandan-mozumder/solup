import type { RequestHandler } from "express";
import { prismaClient } from "db/client";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized - No authorization header" });
    return;
  }

  // Extract user ID from "Bearer {userId}" format
  const userId = authHeader.replace("Bearer ", "");
  if (!userId) {
    res.status(401).json({ error: "Unauthorized - Invalid token format" });
    return;
  }

  try {
    // Verify the user exists in the database
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized - User not found" });
      return;
    }

    req.userId = user.id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Unauthorized - Database error" });
  }
};
