import { testSuite } from "manten";

export default testSuite(async ({ describe }) => {
  describe("world", async ({ runTestSuite }) => {
    runTestSuite(import("./world.test.js"));
  });

  describe("extras", async ({ runTestSuite }) => {
    runTestSuite(import("./extras.test.js"));
  });
});