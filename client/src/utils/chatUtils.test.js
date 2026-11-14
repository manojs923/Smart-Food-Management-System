import { mergeUniqueMessages } from "./chatUtils";

test("merges fetched and received messages without duplicate IDs", () => {
  const first = { _id: "message-1", text: "hello" };
  const second = { _id: "message-2", text: "there" };

  expect(mergeUniqueMessages([first], [first, second])).toEqual([first, second]);
});
