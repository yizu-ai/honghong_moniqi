export const parseReply = (reply: string): { text: string; imagePrompt: string | null } => {
  const imageMatch = reply.match(/\[IMAGE:\s*(.+?)\]/);
  const textContent = reply.replace(/\[IMAGE:\s*.+?\]/, '').trim();
  return {
    text: textContent,
    imagePrompt: imageMatch ? imageMatch[1] : null,
  };
};

export const cleanTextForSpeech = (text: string): string => {
  return text
    .replace(/\[IMAGE:\s*.+?\]/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[「」『』]/g, '')
    .replace(/～/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};
