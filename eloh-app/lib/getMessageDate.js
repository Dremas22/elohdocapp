export const getMessageDate = (createdAt) => {
  if (!createdAt) return new Date();
  if (typeof createdAt === "number") return new Date(createdAt);
  if (typeof createdAt === "string") return new Date(createdAt);
  if ("toDate" in createdAt) return createdAt.toDate();
  if (createdAt instanceof Date) return createdAt;
  return new Date();
};
