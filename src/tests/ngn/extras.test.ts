import { expect, test, testSuite } from "manten";
import { input } from "../../extras/input";
import { createLogSystem } from "../../extras/log";

export default testSuite(async ({ describe }) => {

  test("createLogSystem", () => {
    const logSystem = createLogSystem();
    expect(logSystem).toBeDefined();
    expect(logSystem.update).toBeDefined();
    expect(logSystem.log).toBeDefined();
    logSystem.log("");
    expect(logSystem.expiringLogs.length).toEqual(1);
  });

  test("inputSystem", () => {
    expect(input.keyboard).toBeDefined();
    expect(input.mouse).toBeDefined();
    expect(input.gamepad).toBeDefined();
  });

});
