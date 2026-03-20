import axios from "@/axios-api";

export const messengerLikeMessage = async (messageId, isLiked) => {
  const response = await axios.post("/messenger/likes/", {
    message: messageId,
    is_liked: isLiked,
  });
  return response.data;
};
