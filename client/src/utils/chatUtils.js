export const mergeUniqueMessages = (...messageGroups) => {
  const seenIds = new Set();
  const merged = [];

  messageGroups.forEach((group) => {
    (group || []).forEach((message) => {
      const id = message?._id == null ? null : String(message._id);
      if (id && seenIds.has(id)) return;
      if (id) seenIds.add(id);
      merged.push(message);
    });
  });

  return merged;
};
